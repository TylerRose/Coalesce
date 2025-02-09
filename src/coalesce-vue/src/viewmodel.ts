import {
  onBeforeUnmount,
  reactive,
  ref,
  markRaw,
  getCurrentInstance,
  toRaw,
  watch,
  type Ref,
  type WatchStopHandle,
} from "vue";

import { resolvePropMeta } from "./metadata.js";
import type {
  ModelType,
  PropertyOrName,
  PropNames,
  ModelCollectionNavigationProperty,
  ModelCollectionValue,
  Service,
  Property,
} from "./metadata.js";
import {
  ModelApiClient,
  ListParameters,
  DataSourceParameters,
  ServiceApiClient,
  mapParamsToDto,
  type BulkSaveRequestItem,
} from "./api-client.js";
import {
  type Model,
  modelDisplay,
  propDisplay,
  convertToModel,
  mapToModel,
  mapToDtoFiltered,
  mapToDto,
  type DisplayOptions,
} from "./model.js";
import {
  type Indexable,
  type DeepPartial,
  type VueInstance,
  ReactiveFlags_SKIP,
  getInternalInstance,
  IsVue2,
  IsVue3,
} from "./util.js";
import { debounce } from "lodash-es";
import type { Cancelable, DebounceSettings } from "lodash";

export type { DeepPartial } from "./util.js";

// These imports allow TypeScript to correctly name types in the generated declarations.
// Without them, it will generate some horrible, huge relative paths that won't work on any other machine.
// For example: import("../../../../Coalesce/src/coalesce-vue/src/api-client").ItemResult<TModel>
import type * as apiClient from "./api-client.js";
import type * as axios from "axios";

/*
DESIGN NOTES
    - ViewModel deliberately does not have TMeta as a type parameter.
        The type of the metadata is always accessed off of TModel as TModel["$metadata"].
        This makes the intellisense in IDEs quite nice. If TMeta is a type param,
        we end up with the type of implemented classes taking several pages of the intellisense tooltip.
        With this, we can still strongly type off of known information of TMeta (like PropNames<TModel["$metadata"]>),
        but without cluttering up tooltips with the entire type structure of the metadata.
*/

let nextStableId = 1;
const emptySet: ReadonlySet<string> = new Set();

/**
 * * If true, the data is clean with no known age.
 * * If false, the data is dirty.
 * * If number, the timestamp indicating the date of the data.
 */
type DataFreshness = boolean | number;

export abstract class ViewModel<
  TModel extends Model<ModelType> = any,
  TApi extends ModelApiClient<TModel> = any,
  TPrimaryKey extends string | number = any
> implements Model<TModel["$metadata"]>
{
  /** See comments on ReactiveFlags_SKIP for explanation.
   * @internal
   */
  readonly [ReactiveFlags_SKIP] = true;

  /** Static lookup of all generated ViewModel types. */
  public static typeLookup: ViewModelTypeLookup | null = null;

  // TODO: Do $parent and $parentCollection need to be Set<>s in order to handle objects being in multiple collections or parented to multiple parents? Could be useful.

  /** @internal  */
  $parent: ViewModel | ListViewModel | null = null;

  /** @internal  */
  $parentCollection: ViewModelCollection<this, TModel> | null = null;

  /** @internal Removed items, pending deletion in a bulk save */
  $removedItems?: ViewModel[];

  /** 
    Underlying object which will hold the backing values
    of the custom getters/setters. Not for external use.
    Must exist in order to for Vue to pick it up and add reactivity.
    @internal 
  */
  private $data: TModel & { [propName: string]: any };

  /**
   * A number unique among all ViewModel instances that will be unchanged for the instance's lifetime.
   * Can be used to uniquely identify objects with `:key` in Vue components.
   *
   * Especially useful with `transition-group` where some elements of iteration may be unsaved
   * and therefore not yet have a `$primaryKey`.
   */
  public readonly $stableId!: number;

  /**
   * Gets or sets the primary key of the ViewModel's data.
   */
  public get $primaryKey() {
    return (this as any as Indexable<TModel>)[
      this.$metadata.keyProp.name
    ] as TPrimaryKey;
  }
  public set $primaryKey(val) {
    (this as any)[this.$metadata.keyProp.name] = val;
  }

  /**
    This bool could be computed from the size of the set,
    but this wouldn't trigger reactivity because Vue 2 doesn't have reactivity
    for types like Set and Map.
    @internal 
   */
  private _isDirty = ref(false);

  /** @internal */
  _dirtyProps: Set<PropNames<TModel["$metadata"]>> = IsVue2
    ? new Set()
    : (reactive(new Set()) as any); // as any to avoid ref unwrapping madness

  // Backwards-compat with vue2 nonreactive sets.
  // Typed as any because vue ref unwrapping causes problems with a prop that is a maybe ref.
  /** @internal */
  _dirtyPropsVersion: any = IsVue2 ? ref(0) : undefined;

  /**
   * Returns true if the values of the savable data properties of this ViewModel
   * have changed since the last load, save, or the last time $isDirty was set to false.
   */
  public get $isDirty() {
    return this._isDirty.value;
  }
  public set $isDirty(val) {
    if (!val) {
      this._dirtyProps.clear();
      if (IsVue2 && this._dirtyProps.size) {
        this._dirtyPropsVersion.value++;
      }
      this._isDirty.value = false;
    } else {
      // When explicitly setting the whole model dirty,
      // we don't know which specific prop might be dirty,
      // so just set them all.
      for (const propName in this.$metadata.props) {
        this.$setPropDirty(propName as any);
      }
    }
  }

  public $setPropDirty(
    propName: PropNames<TModel["$metadata"]>,
    dirty = true,
    triggerAutosave = true
  ) {
    const propMeta = this.$metadata.props[propName];
    if (propMeta.dontSerialize) {
      return;
    }

    if (dirty) {
      this._dirtyProps.add(propName);
      if (IsVue2) this._dirtyPropsVersion.value++;
      this._isDirty.value = true;

      if (triggerAutosave && this._autoSaveState?.value?.active) {
        // If dirty, and autosave is enabled, queue an evaluation of autosave.
        this._autoSaveState.value.trigger?.();
      }
    } else {
      this._dirtyProps.delete(propName);
      if (IsVue2) this._dirtyPropsVersion.value++;
      if (!this._dirtyProps.size) {
        this._isDirty.value = false;
      }
    }
  }
  public $getPropDirty(propName: PropNames<TModel["$metadata"]>) {
    if (IsVue2) this._dirtyPropsVersion?.value;

    return this._dirtyProps.has(propName);
  }

  /** @internal */
  private _params: Ref<DataSourceParameters> = ref(new DataSourceParameters());

  /** The parameters that will be passed to `/get`, `/save`, and `/delete` calls. */
  public get $params(): DataSourceParameters {
    return this._params.value;
  }
  public set $params(val) {
    this._params.value = val;
  }

  /** Wrapper for `$params.dataSource` */
  public get $dataSource(): DataSourceParameters["dataSource"] {
    return this.$params.dataSource;
  }
  public set $dataSource(val) {
    this.$params.dataSource = val;
  }

  /** Wrapper for `$params.includes` */
  public get $includes() {
    return this.$params.includes;
  }
  public set $includes(val) {
    this.$params.includes = val;
  }

  /** An object whose values are booleans that specify whether a given validation rule should be ignored,
   * and whose keys are one of the following formats:
   *  - `"propName.ruleName"` - ignores the given rule on the given property.
   *  - `"propName.*"` - ignores rules of the given propName on all properties
   * @internal
   */
  private $ignoredRules: { [identifier: string]: boolean } | null = null;

  /**
   * A two-layer map, the first layer being property names and the second layer being rule identifiers,
   * of custom validation rules that should be applied to this viewmodel instance.
   * @internal
   */
  private $customRules: {
    [propName: string]: {
      [identifier: string]: (val: any) => true | string;
    };
  } | null = null;

  /**
   * Cached set of the effective rules for each property on the model.
   * Will be invalidated when custom rules and/or ignores are changed.
   * @internal
   */
  private _effectiveRules: {
    [propName: string]:
      | undefined
      | Array<((val: any) => true | string) & { ruleName: string }>;
  } | null = null;

  /** @internal */
  private get $effectiveRules() {
    let effectiveRules = this._effectiveRules;
    if (effectiveRules) return effectiveRules;

    effectiveRules = {};

    for (const propName in this.$metadata.props) {
      const prop = this.$metadata.props[propName];
      const custom = this.$customRules?.[propName];
      const propRules = [];

      if ("rules" in prop) {
        const ignored = this.$ignoredRules;
        const rules: any = prop.rules!;

        // Process metadata-provided rules
        for (const ruleName in rules!) {
          // Process ignores
          if (ignored) {
            if (
              ignored[`${propName}.${ruleName}`] ||
              ignored[`${propName}.*`]
            ) {
              continue;
            }
          }

          // If the prop has custom rules, and there is a custom rule
          // with the same identifier as a metadata-provided rule,
          // do not process the metadata-provided rule.
          if (custom && custom[ruleName]) {
            continue;
          }

          const ruleFn = rules[ruleName];
          ruleFn.ruleName = ruleName;
          propRules.push(ruleFn);
        }
      }

      // Process custom rules.
      if (custom) {
        for (const ruleName in custom) {
          const ruleFn = custom[ruleName];
          (ruleFn as any).ruleName = ruleName;
          propRules.push(ruleFn);
        }
      }

      if (propRules.length) {
        effectiveRules[propName] = propRules;
      }
    }

    return (this._effectiveRules = effectiveRules);
  }

  public $addRule(
    prop: string | Property,
    identifier: string,
    rule: (val: any) => true | string
  ) {
    const propName = typeof prop == "string" ? prop : prop.name;

    // Add this as a custom rule.
    // Because rules are keyed by propName and identifier,
    // the rule will not be duplicated.
    this.$customRules = {
      ...this.$customRules,
      [propName]: {
        ...this.$customRules?.[propName],
        [identifier]: rule,
      },
    };

    // Remove any ignore for this rule, if there is one:
    const ignoreSpec = `${propName}.${identifier}`;
    if (this.$ignoredRules && ignoreSpec in this.$ignoredRules) {
      let { [ignoreSpec]: removed, ...remainder } = this.$ignoredRules as any;
      this.$ignoredRules = remainder;
    }

    // Force recompute of effective rules.
    this._effectiveRules = null;
  }

  public $removeRule(prop: string | Property, identifier: string) {
    const propName = typeof prop == "string" ? prop : prop.name;

    // Remove any custom rule that may match this spec.
    const propRules = this.$customRules?.[propName] as any;
    if (propRules) {
      let { [identifier]: removed, ...remainder } = propRules;
      this.$customRules = {
        ...this.$customRules,
        [propName]: remainder,
      };
    }

    // Add an ignore to override any rules that are coming from metadata.
    this.$ignoredRules = {
      ...this.$ignoredRules,
      [`${propName}.${identifier}`]: true,
    };

    // Force recompute of effective rules.
    this._effectiveRules = null;
  }

  /** Returns an array of all applicable rules for the given property
    in accordance with:
    - The rules defined for the model's properties' metadata, 
    - Custom rules added by calling `$addRule`
    - Any rules that where ignored by calling `this.$removeRule`,*/
  public $getRules(prop: string | Property) {
    return this.$effectiveRules[typeof prop == "string" ? prop : prop.name];
  }

  /** Returns a generator that provides all error messages for the current model
    in accordance with:
    - The rules defined for the model's properties' metadata, 
    - Custom rules added by calling `$addRule`
    - Any rules that where ignored by calling `this.$removeRule`,
  */
  public *$getErrors(
    prop?: string | Property
  ): Generator<string, void, unknown> {
    if (prop) {
      const propName = typeof prop == "string" ? prop : prop.name;

      const effectiveRules = this.$effectiveRules[propName];
      if (!effectiveRules) return;

      for (const rule of effectiveRules) {
        const result = rule(this.$data[propName]);
        if (result !== true) yield result;
      }
    } else {
      for (const propName in this.$effectiveRules) {
        yield* this.$getErrors(propName);
      }
    }
  }

  /** True if `this.$getErrors()` is returning at least one error. */
  public get $hasError() {
    return !!this.$getErrors().next().value;
  }

  /**
   * A function for invoking the `/get` endpoint, and a set of properties about the state of the last call.
   */
  get $load() {
    const $load = this.$apiClient.$makeCaller("item", (c, id?: TPrimaryKey) => {
      const startTime = performance.now();

      return c
        .get(id != null ? id : this.$primaryKey, this.$params)
        .then((r) => {
          const result = r.data.object;
          if (result) {
            // We do `purgeUnsaved` (arg2) here, since $load() is always an explicit user action
            // that may be serving as a "reset" of local state.
            this.$loadFromModel(result, startTime, true);
          }
          return r;
        });
    });

    // Lazy getter technique - don't create the caller until/unless it is needed,
    // since creation of api callers is a little expensive.
    Object.defineProperty(this, "$load", { value: $load });

    return $load;
  }

  /** Whether or not to reload the ViewModel's `$data` with the response received from the server after a call to .$save(). */
  public $loadResponseFromSaves = true;

  /** Whether to save the whole object, or only properties which are dirty.
   * - `surgical` - save only properties that are flagged as dirty (default).
   * - `whole` - save all properties on the object.
   */
  public $saveMode: "surgical" | "whole" = "surgical";

  /** @internal */
  private _savingProps: Ref<ReadonlySet<string>> =
    ref<ReadonlySet<string>>(emptySet);

  /** When `$save.isLoading == true`, contains the properties of the model currently being saved by `$save` (including autosaves).
   *
   * Does not include non-dirty properties even if `$saveMode == 'whole'`.
   */
  public get $savingProps(): ReadonlySet<string> {
    return this._savingProps.value;
  }
  public set $savingProps(value: ReadonlySet<string>) {
    this._savingProps.value = value;
  }

  /**
   * A function for invoking the `/save` endpoint, and a set of properties about the state of the last call.
   */
  get $save() {
    const $save = this.$apiClient
      .$makeCaller("item", async (c, overrideProps?: Partial<TModel>) => {
        if (this.$hasError) {
          throw Error(joinErrors(this.$getErrors()));
        }

        // Capture the dirty props before we set $isDirty = false;
        const dirtyProps = [...this._dirtyProps];

        // Copy the dirty props into a list that we'll be mutating
        // into the list of ALL props that we would need to send
        // for surgical saves.
        const propsToSave: string[] = [...dirtyProps];

        // If we were passed any override props, send those too.
        // Use case of override props is changing some field
        // where we don't want the local UI to reflect that new value
        // until we know that value has been saved to the server.
        // A further example is saving some property that will have sever-determined effects
        // on other properties on the model where we don't want an inconsistent intermediate state.
        let data: TModel = this as any;
        if (overrideProps) {
          data = {
            ...this.$data,
            ...overrideProps,
            $metadata: this.$metadata,
          };
          propsToSave.push(...Object.keys(overrideProps));
        }

        // We always send the PK if it exists, regardless of dirty status or save mode.
        if (this.$primaryKey != null) {
          propsToSave.push(this.$metadata.keyProp.name);
        }

        this.$savingProps = new Set(propsToSave);

        // If doing surgical saves,
        // only save the props that are dirty and/or explicitly requested.
        const fields =
          this.$saveMode == "surgical" ? ([...this.$savingProps] as any) : null;

        // Before we make the save call, set isDirty = false.
        // This lets us detect changes that happen to the model while our save request is pending.
        // If the model is dirty when the request completes, we'll not load the response from the server.
        this.$isDirty = false;
        try {
          return await c.save(data, { ...this.$params, fields });
        } catch (e) {
          for (const prop of dirtyProps) {
            this.$setPropDirty(
              prop,
              true,
              // Don't re-trigger autosave on save failure.
              // Wait for next prop change to trigger it again.
              // Otherwise, if the wait timeout is zero,
              // the save will keep triggering as fast as possible.
              // Note that this could be a candidate for a user-customizable option
              // in the future.
              false
            );
          }
          this.$savingProps = emptySet;
          throw e;
        }
      })
      .onFulfilled(function (this: ViewModel) {
        if (!this.$save.result) {
          // Can't do anything useful if the save returned no data.
          return;
        }

        this.$savingProps = emptySet;
        if (!this.$loadResponseFromSaves) {
          // The PK *MUST* be loaded so that the PK returned by a creation save call
          // will be used by subsequent update calls.
          this.$primaryKey = (this.$save.result as Indexable<TModel>)[
            this.$metadata.keyProp.name
          ];
        } else {
          // Do NOT purgeUnsaved here (arg2), as this save may be one of many saves
          // occurring in a large object graph where there are unsaved objects that will be imminently saved.
          this.$loadFromModel(this.$save.result, performance.now());
          this.updateRelatedForeignKeysWithCurrentPrimaryKey();
        }
      });

    // Lazy getter technique - don't create the caller until/unless it is needed,
    // since creation of api callers is a little expensive.
    Object.defineProperty(this, "$save", { value: $save });

    return $save;
  }

  /**
   * A function for invoking the `/bulkSave` endpoint, and a set of properties about the state of the last call.
   *
   * A bulk save will save/delete this entity and all reachable relationships in a single round trip and database transaction.
   */
  get $bulkSave() {
    const $bulkSave = this.$apiClient.$makeCaller(
      "item",
      async (c, options?: BulkSaveOptions) => {
        const {
          items: itemsToSend,
          rawItems: dataToSend,
          errors,
          _allItems: dataByRef,
        } = this.$bulkSavePreview(options);

        if (errors.length) {
          // Somewhat user-friendly error: this could be shown in a c-loader-status
          // if a developer isn't eagerly checking validation before enabling a save button:
          throw Error(joinErrors(errors));
        }

        const ret = await c.bulkSave(
          { items: itemsToSend },
          { ...this.$params }
        );

        if (ret.data?.wasSuccessful) {
          // Load models with their new primary key so that instances can be uniquely
          // identified when loading them with the data returned by the client,
          // allowing the original ViewModel instances to be preserved instead of being replaced.
          // `refMap` maps `ref` values to the resulting primary key produced by the server.
          const refMap = ret.data.refMap;
          for (const ref in refMap) {
            const model = dataByRef.get(+ref)?.model;
            if (model) model.$primaryKey = refMap[ref];
          }

          const result = ret.data.object;
          if (result) {
            const age = performance.now();

            // `purgeUnsaved = true` here (arg3) since the bulk save should have covered the entire object graph.
            // Wiping out unsaved items will help developers discover bugs where their root model's data source
            // does not correctly include the whole object graph that they're saving (which is expected for bulk saves)
            this.$loadFromModel(result, age, true);

            const unloadedTypes = new Set(
              dataToSend
                .filter(
                  (d) =>
                    d.action == "save" &&
                    d.model._dataAge != age &&
                    // We currently don't have a good way to reload additionalRoots items.
                    !options?.additionalRoots?.includes(d.model)
                )
                .map((d) => d.model.$metadata.name)
            );

            if (unloadedTypes.size > 0) {
              console.warn(
                `One or more ${[...unloadedTypes.values()].join(
                  " and "
                )} items were saved by a bulk save, but were not returned by the response. The Data Source of the bulk save target may not be returning all entities.`
              );
            }
          }
        }

        return ret;
      }
    );

    // Lazy getter technique - don't create the caller until/unless it is needed,
    // since creation of api callers is a little expensive.
    Object.defineProperty(this, "$bulkSave", { value: $bulkSave });

    return $bulkSave;
  }

  /** Returns the payload that will be used for the `$bulkSave` operation.
   *
   * Useful for driving UI state like preemptively showing errors,
   * or determining if there are any objects with pending modifications.
   */
  public $bulkSavePreview(options?: BulkSaveOptions) {
    /** The models to traverse for relations in the next iteration of the outer loop. */
    let nextModels: (ViewModel | null)[] = [this];

    if (options?.additionalRoots) {
      nextModels.push(...options.additionalRoots);
    }

    const dataByRef = new Map<number, BulkSaveRequestRawItem>();

    const getData = (model: ViewModel) => {
      let ret = dataByRef.get(model.$stableId);
      if (!ret)
        dataByRef.set(
          model.$stableId,
          (ret = {
            model,
            metadata: model.$metadata,
            action: "none",
            isRoot: false,
            isEssential: false,
            visited: false,
            refs: {
              // The model's $stableId will be referenced by other objects.
              // It is recorded as the object's primary key ref value.
              [model.$metadata.keyProp.name]: model.$stableId,

              // Other foreign key names here will be added that reference
              // the $stableId of the principal end of the relationship
              // The server will use these values to link these two objects together.
            },
          })
        );
      return ret;
    };

    // Traverse all models reachable from `this`,
    // collecting those that need to be saved or deleted.
    while (nextModels.length) {
      const currentModels = nextModels;
      nextModels = [];

      for (const model of currentModels) {
        if (!model) continue;

        const data = getData(model);
        if (data.visited) continue;
        data.visited = true;

        const meta: ModelType = model.$metadata;

        if (model.$removedItems) {
          // `model.$removedItems` will contain items that were `.$remove()`d  while having `model` as a `$parent`.
          nextModels.push(...model.$removedItems);
        }

        data.isRoot = model == this;

        for (const propName in meta.props) {
          const prop = meta.props[propName];

          if (prop.role == "collectionNavigation") {
            const dependents = model.$data[prop.name];
            if (dependents) {
              nextModels.push(...dependents);
            }
          } else if (prop.role == "referenceNavigation") {
            let principal = model.$data[prop.name] as ViewModel | null;

            // If the prop is a reference navigation that has no foreign key,
            // then the ref will link the foreign key prop to the principal entity,
            // allowing the server to fixup the foreign key once the principal is created.
            if (
              // If the foreign key has a value then we don't need a ref.
              // Bail early.
              model.$data[prop.foreignKey.name] != null
            ) {
              nextModels.push(principal);
              continue;
            }

            const collection = model.$parentCollection;
            if (
              !principal &&
              collection?.$parent instanceof ViewModel &&
              collection.$metadata == prop.inverseNavigation
            ) {
              // The reference navigation property has no value,
              // and the foreign key has no value,
              // but the model is contained in a collection navigation property,
              // and that collection is the inverse navigation of this reference navigation,
              // so it must reference the parent of that collection.

              // This scenario enables adding a new item to a collection navigation
              // without setting either the foreign key or the nav prop on that new child.

              principal = collection.$parent;
            }

            nextModels.push(principal);

            if (
              principal &&
              !principal._isRemoved &&
              !model._isRemoved &&
              (model.$isDirty || !model._existsOnServer)
            ) {
              if (
                // The principal is not yet saved, but will be saved.
                (!principal._existsOnServer &&
                  options?.predicate?.(principal, "save") !== false) ||
                // The principal object already exists, but the FK isn't dirty.
                // This may mean the principal object was late loaded which bypasses FK fixup,
                // or it means that a blank, empty dependent object was added to the principal's collection nav.
                (principal._existsOnServer &&
                  !model.$getPropDirty(prop.foreignKey.name))
              ) {
                data.refs[prop.foreignKey.name] = principal.$stableId;
                getData(principal).isEssential = true;
              }
            }
          }
        }
      }
    }

    const dataToSend: BulkSaveRequestRawItem[] = [];
    const itemsToSend: BulkSaveRequestItem[] = [];
    let isDirty = false;
    const errors = [];
    for (const [_, data] of dataByRef) {
      const model = data.model;

      // Non-dirty, non-deleted items are sent as "none".
      // This exists so that the root item(that will be sent as the response
      // from the server) can be identified even if it isn't being modified.
      let action: BulkSaveRequestItem["action"] = "none";

      if (model._isRemoved) {
        action = model._existsOnServer
          ? "delete" // Delete items that have a PK are sent as a delete
          : "none"; // Do not send removed items that never had a PK.
      } else {
        // Save items that are dirty, or never saved, or have unresolved refs in the payload
        if (
          model.$isDirty ||
          !model._existsOnServer ||
          Object.entries(data.refs).some(([key, ref]) => {
            return key != model.$metadata.keyProp.name;
          })
        ) {
          action = "save";
        }
      }

      // Include the root item and any items being changed.
      if (action == "none" && !data.isRoot && !data.isEssential) {
        continue;
      }

      // Apply the user-supplied predicate to each item.
      if (action !== "none" && options?.predicate?.(model, action) === false) {
        continue;
      }

      data.action = action;
      dataToSend.push(data);

      const metadata = data.metadata;
      const props = metadata.props;

      if (action == "delete") {
        isDirty = true;
      } else if (action == "save") {
        isDirty = true;
        for (const [propName, rules] of Object.entries(model.$effectiveRules)) {
          const propMeta = props[propName];
          for (const rule of rules || []) {
            const result = rule((model as any)[propName]);
            if (result !== true) {
              if (
                rule.ruleName == "required" &&
                propMeta.role == "foreignKey" &&
                propName in data.refs
              ) {
                // We have to allow for missing foreign keys
                // when the foreign key is missing but has a `ref`
                // that will be fixed up on the server as part of the bulk save operation.
                // Skip the failure of this rule.
                continue;
              }

              data.errors ??= [];
              data.errors.push(result);
              errors.push(result);
            }
          }
        }
      }

      itemsToSend.push({
        type: metadata.name,
        action,
        refs: data.refs,
        root: data.isRoot ? true : undefined,
        data:
          action == "none" || action == "delete"
            ? // "none" and "delete" items only need their PK:
              mapToDtoFiltered(model, [metadata.keyProp.name])!
            : model.$saveMode == "surgical"
            ? mapToDtoFiltered(model, [
                ...model._dirtyProps,
                metadata.keyProp.name,
              ])!
            : mapToDto(model)!,
      });
    }

    return {
      /** True if there are any models with a pending save or delete. */
      isDirty,
      /** The actual data to be sent in the API request. */
      items: itemsToSend,
      /** Full representation of the items that will be sent in the bulk save request. */
      rawItems: dataToSend,
      /** Aggregation of all errors contained within `rawItems`. */
      errors,
      /** @internal */
      _allItems: dataByRef,
    };
  }

  /** @internal */
  private updateRelatedForeignKeysWithCurrentPrimaryKey() {
    const pkValue = this.$primaryKey;

    // Look through collection navigations.
    // Set the corresponding foreign key of all entities to the current PK value.
    for (const prop of Object.values(this.$metadata.props)) {
      if (prop.role != "collectionNavigation") continue;

      const value = (this as any)[prop.name];
      if (value?.length) {
        const fk = prop.foreignKey.name;
        for (const child of value) {
          child[fk] = pkValue;
        }
      }
    }

    if (this.$parent?.$metadata?.props) {
      const parent = this.$parent;
      for (const prop of Object.values(parent.$metadata.props) as Property[]) {
        if (prop.role != "referenceNavigation") continue;

        // The prop on the parent is a reference navigation.
        // If the value of the navigation is ourself,
        // update the foreign key on the $parent with our new PK.
        //@ts-expect-error undefined indexer
        const value = parent[prop.name];
        if (value === this) {
          //@ts-expect-error undefined indexer
          parent[prop.foreignKey.name] = pkValue;
        }
      }
    }
  }

  /** @internal */
  _dataAge = 0;

  /**
   * Loads data from the provided model into the current ViewModel,
   * and then clears the $isDirty flag if `isCleanData` is not given as `false`.
   *
   * Data is loaded in a surgical fashion that will preserve existing instances
   * of objects and arrays found on navigation properties.
   */
  public $loadFromModel(
    source: DeepPartial<TModel>,
    isCleanData: DataFreshness = true,
    purgeUnsaved: boolean = false
  ) {
    if (this.$isDirty && this._autoSaveState?.value?.active) {
      updateViewModelFromModel(
        this as any,
        source,
        true,
        isCleanData,
        false,
        true
      );
    } else {
      updateViewModelFromModel(
        this as any,
        source,
        false,
        isCleanData,
        purgeUnsaved,
        true
      );
      if (isCleanData) {
        this.$isDirty = false;
      }
    }
  }

  /**
   * Loads data from the provided model into the current ViewModel, and then clears $isDirty flags.
   *
   * Data is loaded in a surgical fashion that will preserve existing instances
   * of objects and arrays found on navigation properties.
   */
  public $loadCleanData(source: DeepPartial<TModel>, purgeUnsaved = false) {
    return this.$loadFromModel(source, true, purgeUnsaved);
  }

  /**
   * Loads data from the provided model into the current ViewModel.
   * Does not clear $isDirty flags.
   *
   * Data is loaded in a surgical fashion that will preserve existing instances
   * of objects and arrays found on navigation properties.
   */
  public $loadDirtyData(source: DeepPartial<TModel>) {
    return this.$loadFromModel(source, false, false);
  }

  /**
   * A function for invoking the `/delete` endpoint, and a set of properties about the state of the last call.
   */
  get $delete() {
    const $delete = this.$apiClient
      .$makeCaller("item", (c) => {
        if (this._existsOnServer) {
          return c.delete(this.$primaryKey, this.$params);
        } else {
          this._removeFromParentCollection();
        }
      })
      .onFulfilled(function (this: ViewModel) {
        this._removeFromParentCollection();
      });

    // Lazy getter technique - don't create the caller until/unless it is needed,
    // since creation of api callers is a little expensive.
    Object.defineProperty(this, "$delete", { value: $delete });

    return $delete;
  }

  /** @internal */
  private _removeFromParentCollection() {
    if (this.$parentCollection) {
      const idx = this.$parentCollection.indexOf(this);
      if (idx > -1) {
        const item = this.$parentCollection.splice(idx, 1)[0];
        return item;
      }
    }
  }

  /** @internal */
  private get _existsOnServer() {
    if (!this.$primaryKey) {
      return false;
    }

    if (
      this.$metadata.keyProp.createOnly &&
      this.$getPropDirty(this.$metadata.keyProp.name as any)
    ) {
      // PK is client-provided (not server generated), and is dirty.
      // Therefore, this is just the local state of the PK that has not yet been saved.
      return false;
    }

    return true;
  }

  /** Whether the item has been removed via `$remove()` and is pending for deletion in the next bulk save.
   * @internal
   * */
  _isRemoved = false;

  public get $isRemoved() {
    return this._isRemoved; // does this need to be reactive?
  }

  /** Mark this model for deletion in the next `$bulkSave` operation performed on an ancestor.
   *
   * If this item has a parent collection, it will be immediately removed from that collection.
   * */
  public $remove() {
    if (!this.$parent) {
      throw new Error(
        `Unable to remove ${this.$metadata.name}: item has no parent to be removed from.`
      );
    }

    this._isRemoved = true;

    this._removeFromParentCollection();
    if (this.$parent instanceof ViewModel) {
      (this.$parent.$removedItems ??= []).push(this);
    }
  }

  /** @internal Internal autosave state. */
  // Deliberately uninitialized ref to avoid allocations when nothing is listening.
  _autoSaveState?: Ref<AutoCallState<AutoSaveOptions<any>> | undefined>;

  /**
   * Starts auto-saving of the instance when changes to its savable data properties occur.
   * Only usable from Vue setup() or `script setup`. Otherwise, use $startAutoSave().
   * @param options Options to control how the auto-saving is performed.
   */
  public $useAutoSave(options: AutoSaveOptions<this> = {}) {
    const vue = getCurrentInstance()?.proxy;
    if (!vue)
      throw new Error(
        "$useAutoSave can only be used inside setup(). Consider using $startAutoSave if you're not using Vue composition API."
      );
    return this.$startAutoSave(vue, options);
  }

  /**
   * Starts auto-saving of the instance when changes to its savable data properties occur.
   * @param vue A Vue instance through which the lifecycle of the watcher will be managed.
   * @param options Options to control how the auto-saving is performed.
   */
  public $startAutoSave(vue: VueInstance, options: AutoSaveOptions<this> = {}) {
    let state = this._autoSaveState?.value;

    if (state?.active && state.options === options) {
      // If already active using the exact same options object, don't restart.
      // This prevents infinite recursion when setting up deep autosaves.
      return;
    }

    const {
      wait = 1000,
      predicate = undefined,
      debounce: debounceOptions,
    } = options;

    this.$stopAutoSave();

    state = new AutoCallState<AutoSaveOptions<any>>();
    state.options = options;

    if (this._autoSaveState) {
      this._autoSaveState.value = state;
    } else {
      this._autoSaveState = ref(state);
    }

    let ranOnce = false;

    const enqueueSave = debounce(
      () => {
        if (!state?.active) return;

        /*
        Try and save if:
          1) The model is dirty
          2) The model lacks a primary key, and we haven't yet tried to save it
            since autosave was enabled. We should only ever try to do this once
            in case the Behaviors on the server are for some reason not configured
            to return responses from saves. We also don't do this if $load has ever 
            been attempted, because if it is has then this means there's an expectation
            that the object does already exist on the server and might mean that
            $load(somePkValue) was called (and so if we did a save, it would create an 
            object with a new PK)
      */
        if (
          this.$isDirty ||
          (!ranOnce && !this.$primaryKey && this.$load.wasSuccessful === null)
        ) {
          if (this.$hasError || (predicate && !predicate(this))) {
            // There are validation errors, or a user-defined predicate failed.
            // Do nothing, and don't enqueue another attempt.
            // The next attempt will be enqueued the next time a change is made to the data.
            return;
          }

          if (this.$save.isLoading || this.$load.isLoading) {
            // Save already in progress, or model is currently loading.
            // Enqueue another attempt.
            enqueueSave();
            return;
          }

          // Everything should be good to go. Go forth and save!
          ranOnce = true;
          this.$save()
            // After the save finishes, attempt another autosave.
            // If the model has become dirty since the last save,
            // we need to save again.
            // This will happen if the state of the model changes while the save
            // is in-flight.
            .then(enqueueSave)
            // We need a catch block so all of this is testable.
            // Otherwise, jest will fail tests as soon as it sees an unhandled promise rejection.
            .catch(() => {});
        }
      },
      Math.max(1, wait),
      debounceOptions
    );

    let isPending = false;
    state.trigger = function () {
      if (isPending) return;
      isPending = true;
      // This MUST happen on next tick in case $isDirty was set to true automatically
      // and is about to be manually (or by $loadFromModel) set to false.
      vue.$nextTick(() => {
        isPending = false;
        enqueueSave();
      });
    };

    startAutoCall(state, vue, undefined, enqueueSave);
    state.trigger();

    if (options.deep) {
      for (const propName in this.$metadata.props) {
        const prop = this.$metadata.props[propName];
        if (prop.role == "collectionNavigation") {
          if ((this as any)[propName]) {
            for (const child of (this as any)[propName] as ViewModel[]) {
              child.$startAutoSave(vue, options);
            }
          }
        } else if (prop.role == "referenceNavigation") {
          ((this as any)[propName] as ViewModel)?.$startAutoSave(vue, options);
        }
      }
    }
  }

  /** Stops auto-saving if it is currently enabled. */
  public $stopAutoSave() {
    this._autoSaveState?.value?.cleanup?.();
  }

  /** Returns true if auto-saving is currently enabled. */
  public get $isAutoSaveEnabled() {
    // Initialize the ref if not already initialized so we can track future writes.
    if (!this._autoSaveState) {
      this._autoSaveState = ref();
      return false;
    }
    return this._autoSaveState?.value?.active;
  }

  /**
   * Returns a string representation of the object, or one of its properties, suitable for display.
   * @param prop If provided, specifies a property whose value will be displayed.
   * @param options Options for formatting the displayed value.
   * If omitted, the whole object will be represented.
   */
  public $display(
    prop?: PropertyOrName<TModel["$metadata"]>,
    options?: DisplayOptions
  ) {
    if (!prop) return modelDisplay(this, options);
    return propDisplay(this, prop, options);
  }

  /**
   * Creates a new instance of an item for the specified child model collection,
   * adds it to that collection, and returns the item.
   * @param prop The name of the collection property, or the metadata representing it.
   */
  public $addChild(
    prop:
      | ModelCollectionNavigationProperty
      | PropNames<TModel["$metadata"], ModelCollectionNavigationProperty>,
    initialDirtyData?: any
  ) {
    const propMeta = resolvePropMeta<ModelCollectionNavigationProperty>(
      this.$metadata,
      prop
    );
    var collection: Array<any> | undefined = (this as any as Indexable<TModel>)[
      propMeta.name
    ];

    if (!Array.isArray(collection)) {
      (this as any)[propMeta.name] = [];
      collection = (this as any)[propMeta.name] as any[];
    }

    if (propMeta.role == "collectionNavigation") {
      // The ViewModelCollection will handle creating a new ViewModel,
      // and setting $parent, $parentCollection.
      const newViewModel = collection[
        collection.push(mapToModel({}, propMeta.itemType.typeDef)) - 1
      ] as ViewModel;

      if (initialDirtyData) {
        newViewModel.$loadDirtyData(initialDirtyData);
      }

      //@ts-expect-error untyped indexer
      newViewModel[propMeta.foreignKey.name] = this.$primaryKey;
      // Populate the navigation property on the new child as well
      // so that navigation property fixup can work with bulk saves.
      if (propMeta.foreignKey.navigationProp) {
        //@ts-expect-error untyped indexer
        newViewModel[propMeta.foreignKey.navigationProp.name] = this;
      }

      return newViewModel;
    } else {
      throw "$addChild only adds to collections of model properties.";
    }
  }

  constructor(
    // The following MUST be declared in the constructor so its value will be available to property initializers.

    /** The metadata representing the type of data that this ViewModel handles. */
    public readonly $metadata: TModel["$metadata"],

    /** Instance of an API client for the model through which direct, stateless API requests may be made. */
    public readonly $apiClient: TApi,

    initialDirtyData?: DeepPartial<TModel> | null
  ) {
    this.$data = reactive(convertToModel({}, $metadata)) as any;

    Object.defineProperty(this, "$stableId", {
      enumerable: true, // Enumerable so visible in vue devtools
      configurable: false,
      value: nextStableId++,
      writable: false,
    });

    const ctor = this.constructor as any;

    if (initialDirtyData) {
      this.$loadDirtyData(initialDirtyData);
    } else {
      if (ctor.collectionProps !== false) {
        if (!ViewModelFactory.isInScope) {
          // Only initialize collections if we're not in a ViewModelFactory scope.
          // If we ARE in a scope, there's a guaranteed call to $loadFromModel.

          if (ctor.collectionProps === undefined) {
            ctor.collectionProps = Object.values($metadata.props).filter(
              (prop) =>
                prop.type == "collection" && prop.itemType.type == "model"
            );
          }
          for (const prop of ctor.collectionProps) {
            // Pass null directly through to the VM's setter.
            // The VM's setter will then populate the VM's data with an empty array rather than null.
            (this as any)[prop.name] = null;
          }
          if (!ctor.collectionProps) {
            ctor.collectionProps = false;
          }
        }
      }
    }

    if (ctor.hasPropDefaults !== false) {
      for (const prop of Object.values($metadata.props)) {
        if ("defaultValue" in prop) {
          ctor.hasPropDefaults ??= true;

          if (!initialDirtyData || !(prop.name in initialDirtyData)) {
            (this as any)[prop.name] = prop.defaultValue;
          }
        }
      }

      // Cache that this type doesn't have prop defaults so we don't
      // ever have to loop over the props looking for them on future instances.
      ctor.hasPropDefaults ??= false;
    }
  }
}

export interface BulkSaveRequestRawItem {
  model: ViewModel;
  metadata: ModelType;
  action: BulkSaveRequestItem["action"];
  refs: BulkSaveRequestItem["refs"] & {};
  isRoot: boolean;
  errors?: string[];
  /** @internal */
  visited: boolean;
  /** @internal */
  isEssential: boolean;
}

export abstract class ListViewModel<
  TModel extends Model<ModelType> = any,
  TApi extends ModelApiClient<TModel> = ModelApiClient<TModel>,
  TItem extends ViewModel<TModel, TApi> = ViewModel<TModel, TApi>
> {
  /** Make nonreactive with Vue, preventing ViewModel instance from being wrapped with a Proxy.
   * Instead, we make individual members reactive with `reactive`/`ref`.
   *
   * We have to do this because `reactive` doesn't play nice with prototyped objects.
   * Any sets to a setter on the ViewModel class will trigger the reactive proxy,
   * and since the setter is defined on the prototype and Vue checks hasOwnProperty
   * when determining if a field is new on an object, all setters trigger reactivity
   * even if the value didn't change.
   * @internal
   */
  readonly [ReactiveFlags_SKIP] = true;

  /** Static lookup of all generated ListViewModel types. */
  public static typeLookup: ListViewModelTypeLookup | null = null;

  /** @internal  */
  private _params = ref(new ListParameters());

  /** The parameters that will be passed to `/list` and `/count` calls. */
  public get $params(): ListParameters {
    return this._params.value;
  }
  public set $params(val) {
    this._params.value = val;
  }

  /** Wrapper for `$params.dataSource` */
  public get $dataSource(): ListParameters["dataSource"] {
    return this.$params.dataSource;
  }
  public set $dataSource(val) {
    this.$params.dataSource = val;
  }

  /** Wrapper for `$params.includes` */
  public get $includes() {
    return this.$params.includes;
  }
  public set $includes(val) {
    this.$params.includes = val;
  }

  /**
   * @internal
   */
  private _lightweight = false;

  /** The plain model items that have been loaded into this ListViewModel.
   * These instances do not reflect any changes made to the contents of `$items`.
   */
  public get $modelItems() {
    return this.$load.result || [];
  }

  /** Returns true if `$modelOnlyMode` has been enabled. */
  public get $modelOnlyMode(): boolean {
    return this._lightweight;
  }

  /**
   * Put the ListViewModel into a lightweight mode where `$items` is not populated with ViewModel instances.
   * Result can instead be read from `$modelItems`.
   *
   * This mode allows much better performance when loading large numbers of items, especially in read-only contexts.
   */
  public set $modelOnlyMode(val: boolean) {
    if (!val) {
      throw new Error("Model-only mode cannot be disabled once enabled.");
    }
    this._lightweight = true;
    this._items.value = undefined;
  }

  /**
   * The current set of items that have been loaded into this ListViewModel.
   * @internal
   */
  private _items = ref();

  public get $items(): ViewModelCollection<TItem, TModel> {
    let value = this._items.value;
    if (!value) {
      if (this._lightweight) {
        throw new Error(
          "The ListViewModel instance is in model-only mode. Items may only be retrieved from `.$modelItems`, not `.$items`."
        );
      }
      value = new ViewModelCollection(this.$metadata, this);

      // In order to avoid vue seeing that we mutated a `ref` in a getter,
      // replace the entire ref when doing this lazy initialization.
      // See test "$items initializer doesn't trigger reactivity".
      this._items = ref(value);

      if (IsVue2) {
        // bugfix: in vue2, since $items is wrapping over a `ref` and this is the getter
        // and should therefore act as a read of the ref, we need to force a read
        // of the ref to track a dependency on `_items` on behalf of whatever accessed `$items`.
        // This is only necessary in Vue2 because the ViewModelCollection instance won't be made
        // reactive until it is assigned into a reactive object (like a ref).
        // See test "$items is reactive when first usage is a read"
        this._items.value.length.toString();
      }
    }
    return value;
  }
  public set $items(val: TItem[]) {
    if (this._lightweight) {
      throw new Error(
        "The ListViewModel instance is in model-only mode. `.$items` must not be populated."
      );
    }

    if ((this._items.value as any) === val) return;

    const vmc = new ViewModelCollection(this.$metadata, this);
    if (val) vmc.push(...val);
    this._items.value = vmc;
  }

  /** True if the page set in $params.page is greater than 1 */
  public get $hasPreviousPage() {
    return (this.$params.page || 1) > 1;
  }
  /** True if the count retrieved from the last load indicates that there may be pages after the page set in $params.page */
  public get $hasNextPage() {
    // -1 is used to signal an unknown number of pages.
    if (this.$load.pageCount === -1) return true;

    return (this.$params.page || 1) < (this.$load.pageCount || 0);
  }

  /** Decrement the page parameter by 1 if there is a previous page. */
  public $previousPage() {
    if (this.$hasPreviousPage) this.$params.page = (this.$params.page || 1) - 1;
  }
  /** Increment the page parameter by 1 if there is a next page. */
  public $nextPage() {
    if (this.$hasNextPage) this.$params.page = (this.$params.page || 1) + 1;
  }

  public get $page() {
    return this.$params.page || 1;
  }
  public set $page(val) {
    this.$params.page = Math.max(1, Number(val));
  }

  public get $pageSize() {
    return this.$params.pageSize || 1;
  }
  public set $pageSize(val) {
    this.$params.pageSize = Number(val);
  }

  public get $pageCount() {
    return this.$load.pageCount;
  }

  /**
   * A function for invoking the `/load` endpoint, and a set of properties about the state of the last call.
   */
  get $load() {
    const $load = this.$apiClient.$makeCaller("list", (c) => {
      const startTime = performance.now();
      return c.list(this.$params).then((r) => {
        if (!this._lightweight) {
          const result = r.data.list;
          if (result) {
            this.$items = rebuildModelCollectionForViewModelCollection<
              TModel,
              TItem
            >(this.$metadata, this.$items, result, startTime, true);
          }
        }
        return r;
      });
    });

    // Lazy getter technique - don't create the caller until/unless it is needed,
    // since creation of api callers is a little expensive.
    Object.defineProperty(this, "$load", { value: $load });

    return $load;
  }

  /**
   * A function for invoking the `/count` endpoint, and a set of properties about the state of the last call.
   */
  get $count() {
    const $count = this.$apiClient.$makeCaller("item", (c) =>
      c.count(this.$params)
    );

    // Lazy getter technique - don't create the caller until/unless it is needed,
    // since creation of api callers is a little expensive.
    Object.defineProperty(this, "$count", { value: $count });

    return $count;
  }

  /** @internal Internal autoload state */
  private _autoLoadState = new AutoCallState();

  /**
   * Starts auto-loading of the list as changes to its parameters occur.
   * Only usable from Vue setup() or `script setup`. Otherwise, use $startAutoLoad().
   * @param options Options that control the auto-load behavior.
   */
  public $useAutoLoad(options: AutoLoadOptions<this> = {}) {
    const vue = getCurrentInstance()?.proxy;
    if (!vue)
      throw new Error(
        "$useAutoLoad can only be used inside setup(). Consider using $startAutoLoad if you're not using Vue composition API."
      );
    return this.$startAutoLoad(vue, options);
  }

  /**
   * Starts auto-loading of the list as changes to its parameters occur.
   * @param vue A Vue instance through which the lifecycle of the watcher will be managed.
   * @param options Options that control the auto-load behavior.
   */
  public $startAutoLoad(vue: VueInstance, options: AutoLoadOptions<this> = {}) {
    const {
      wait = 1000,
      predicate = undefined,
      debounce: debounceOptions,
    } = options;
    this.$stopAutoLoad();

    const enqueueLoad = debounce(
      () => {
        if (!this._autoLoadState.active) return;

        // Check the predicate again incase its state has changed while we were waiting for the debouncing timer.
        if (predicate && !predicate(this)) {
          return;
        }

        if (this.$load.isLoading && this.$load.concurrencyMode != "cancel") {
          // Load already in progress. Enqueue another attempt.
          enqueueLoad();
        } else {
          // No loads in progress, or concurrency is set to cancel - go for it.
          this.$load();
        }
      },
      wait,
      debounceOptions
    );

    const onChange = () => {
      if (predicate && !predicate(this)) {
        return;
      }
      enqueueLoad();
    };

    const watcher = vue.$watch(
      // Watch the stringified version of the params, since if we watch the object itself,
      // insignificant changes will incorrectly trigger reloads,
      // e.g. when c-admin-table remaps params from the querystring.
      () => JSON.stringify(mapParamsToDto(this.$params)),
      onChange
    );
    startAutoCall(this._autoLoadState, vue, watcher, enqueueLoad);

    if (options.immediate) {
      // Immediate load doesn't use `enqueueLoad` so that there's no delay.
      this.$load();
    }
  }

  /** Stops auto-loading if it is currently enabled. */
  public $stopAutoLoad() {
    this._autoLoadState.cleanup?.();
  }

  /** @internal Internal autosave state */
  private _autoSaveState = new AutoCallState();

  /**
   * Enables auto save for the items in the list.
   * Only usable from Vue setup() or `script setup`. Otherwise, use $startAutoSave().
   * @param options Options to control how the auto-saving is performed.
   */
  public $useAutoSave(options: AutoSaveOptions<this> = {}) {
    const vue = getCurrentInstance()?.proxy;
    if (!vue)
      throw new Error(
        "$useAutoSave can only be used inside setup(). Consider using $startAutoSave if you're not using Vue composition API."
      );
    return this.$startAutoSave(vue, options);
  }

  /**
   * Enables auto save for the items in the list.
   * @param vue A Vue instance through which the lifecycle of the watcher will be managed.
   * @param options Options to control how the auto-saving is performed.
   */
  public $startAutoSave(vue: VueInstance, options: AutoSaveOptions<this> = {}) {
    if (this._lightweight) {
      throw new Error("Autosave cannot be used with $modelOnlyMode enabled.");
    }

    let state = this._autoSaveState;

    if (state?.active && state.options === options) {
      // If already active using the exact same options object, don't restart.
      return;
    }

    this.$stopAutoSave();

    state = this._autoSaveState ??= new AutoCallState<AutoSaveOptions<any>>();
    state.options = options;
    state.vue = vue;

    const watcher = vue.$watch(
      () => [...this.$items.map((i) => i.$stableId)],
      () => {
        for (const item of this.$items) {
          item.$startAutoSave(state.vue!, state.options);
        }
      },
      { immediate: true, deep: true }
    );

    startAutoCall(state, vue, watcher);
  }

  /** Stops auto-saving if it is currently enabled. */
  public $stopAutoSave() {
    this._autoSaveState?.cleanup?.();
    for (const item of this.$items) {
      item.$stopAutoSave();
    }
  }

  /** Returns true if auto-saving is currently enabled. */
  public get $isAutoSaveEnabled() {
    return this._autoSaveState?.active;
  }

  constructor(
    // The following MUST be declared in the constructor so its value will be available to property initializers.

    /** The metadata representing the type of data that this ViewModel handles. */
    public readonly $metadata: TModel["$metadata"],

    /** Instance of an API client for the model through which direct, stateless API requests may be made. */
    public readonly $apiClient: TApi
  ) {
    markRaw(this);
  }
}

export class ServiceViewModel<
  TMeta extends Service = Service,
  TApi extends ServiceApiClient<TMeta> = ServiceApiClient<TMeta>
> {
  /** Make nonreactive with Vue, preventing ViewModel instance from being wrapped with a Proxy.
   * Instead, we make individual members reactive with `reactive`/`ref`.
   *
   * We have to do this because `reactive` doesn't play nice with prototyped objects.
   * Any sets to a setter on the ViewModel class will trigger the reactive proxy,
   * and since the setter is defined on the prototype and Vue checks hasOwnProperty
   * when determining if a field is new on an object, all setters trigger reactivity
   * even if the value didn't change.
   * @internal
   */
  readonly [ReactiveFlags_SKIP] = true;

  /** Static lookup of all generated ServiceViewModel types. */
  public static typeLookup: ServiceViewModelTypeLookup | null = null;

  constructor(
    /** The metadata representing the type of data that this ViewModel handles. */
    public readonly $metadata: TMeta,

    /** Instance of an API client for the model through which direct, stateless API requests may be made. */
    public readonly $apiClient: TApi
  ) {
    markRaw(this);
  }
}

/** Factory for creating new ViewModels from some initial data.
 *
 * For all ViewModels created recursively as a result of creating the root ViewModel,
 * the same ViewModel instance will be returned whenever the exact same `initialData` object is encountered.
 */
export class ViewModelFactory {
  private static current: ViewModelFactory | null = null;

  /** @internal */
  static get isInScope() {
    return !!this.current;
  }

  private map = new Map<any, ViewModel>();

  /** Ask the factory for a ViewModel for the given type and initial data.
   * The instance may be a brand new one, or may be already existing
   * if the same initialData has already been seen.
   */
  get(typeName: string, initialData: any) {
    const map = this.map;

    if (map.has(initialData)) {
      return map.get(initialData)!;
    }
    const vmCtor = ViewModel.typeLookup![typeName];
    const vm = new vmCtor() as unknown as ViewModel;
    map.set(initialData, vm);

    vm.$loadFromModel(initialData, this.isCleanData);

    return vm;
  }

  /** Provide a pre-existing instance to the factory. */
  set(initialData: any, vm: ViewModel) {
    this.map.set(initialData, vm);
  }

  private processed = new Map<any, Set<any>>();
  /** Determine if the given initialData was already mapped to `vm`. */
  shouldProcess(initialData: any, vm: ViewModel) {
    let targets = this.processed.get(initialData);
    if (!targets) {
      this.processed.set(initialData, (targets = new Set()));
    }
    if (targets.has(vm)) {
      return false;
    }
    targets.add(vm);
    return true;
  }

  public static scope<TRet>(
    action: (factory: ViewModelFactory) => TRet,
    isCleanData: DataFreshness
  ) {
    if (!ViewModelFactory.current) {
      // There is no current factory. Make a new one.
      ViewModelFactory.current = new ViewModelFactory(isCleanData);
      try {
        // Perform the action, and when we're done, destroy the factory.
        return action(ViewModelFactory.current);
      } finally {
        ViewModelFactory.current = null;
      }
    } else {
      // Perform the action using the already existing factory.
      return action(ViewModelFactory.current);
    }
  }

  public static get(
    typeName: string,
    initialData: any,
    isCleanData: DataFreshness
  ) {
    return ViewModelFactory.scope(function (factory) {
      return factory.get(typeName, initialData);
    }, isCleanData);
  }

  private constructor(private isCleanData: DataFreshness = true) {}
}

/** Gets a human-friendly description for ViewModelCollection error messages. */
function viewModelCollectionName($metadata: ModelCollectionValue | ModelType) {
  const collectedTypeMeta =
    $metadata.type == "model" ? $metadata : $metadata.itemType.typeDef;

  const str = `a collection of ${collectedTypeMeta.name}`;

  return $metadata.type == "model" ? str : `${$metadata.name} (${str})`;
}

function viewModelCollectionMapItems<T extends ViewModel, TModel extends Model>(
  items: (T | Partial<TModel>)[],
  vmc: ViewModelCollection<ViewModel, TModel>,
  isCleanData: boolean
) {
  const collectedTypeMeta =
    vmc.$metadata.type == "model"
      ? vmc.$metadata
      : vmc.$metadata.itemType.typeDef;

  return items.map((val) => {
    if (val == null) {
      throw Error(`Cannot push null to a collection of ViewModels.`);
    }

    if (typeof val !== "object") {
      throw Error(
        `Cannot push a non-object to ${viewModelCollectionName(vmc.$metadata)}`
      );
    }
    // Sanity check. Probably not crucial if this ends up causing issues. A warning would probably suffice too.
    else if ("$metadata" in val && val.$metadata != collectedTypeMeta) {
      throw Error(
        `Type mismatch - attempted to assign a ${
          val.$metadata.name
        } to ${viewModelCollectionName(vmc.$metadata)}`
      );
    }

    let viewModel;
    if (val instanceof ViewModel) {
      // Already a viewmodel. Do nothing
      viewModel = val;
    } else {
      // Incoming is a Model. Make a ViewModel from it.
      if (ViewModel.typeLookup === null) {
        throw Error(
          "Static `ViewModel.typeLookup` is not defined. It should get defined in viewmodels.g.ts."
        );
      }
      viewModel = val = ViewModelFactory.get(
        collectedTypeMeta.name,
        val,
        isCleanData
      ) as unknown as T & ViewModel;
    }

    // $parent and $parentCollection are intentionally private -
    // they're just for internal tracking of stuff
    // and probably shouldn't be used in custom code.
    // So, we'll cast to `any` so we can set them here.
    viewModel.$parent = vmc.$parent;
    viewModel.$parentCollection = vmc as any;

    // If deep autosave is active, propagate it to the ViewModel instance being attached to the object graph.
    const autoSaveState: AutoCallState<AutoSaveOptions<any>> = (
      vmc.$parent as any
    )._autoSaveState?.value;
    if (autoSaveState?.active && autoSaveState.options?.deep) {
      viewModel.$startAutoSave(autoSaveState.vue!, autoSaveState.options);
    }

    return viewModel;
  });
}

function resolveProto(obj: ViewModelCollection<any, any>): Array<any> {
  // Babel does some stupid nonsense where it will wrap our proto
  // in another proto. This breaks things if coalesce-vue is imported from source,
  // or if we were to at some point in the future emit a esnext version of coalesce-vue.
  const proto = Object.getPrototypeOf(obj);
  if (obj.push == proto.push) {
    // `proto` is the wrapper because it contains our own `push` (and other methods).
    // Go up one more level.
    return Object.getPrototypeOf(proto);
  }
  return proto;
}

export class ViewModelCollection<
  T extends ViewModel,
  TModel extends Model
> extends Array<T> {
  readonly $metadata!:
    | ModelCollectionValue
    | ModelCollectionNavigationProperty
    | ModelType;
  readonly $parent!: ViewModel | ListViewModel;

  $hasLoaded!: boolean;

  override push(...items: (T | Partial<TModel>)[]): number {
    // MUST evaluate the .map() before grabbing the .push() (Vue2 only limitation)
    // method from the proto. See test "newly loaded additional items are reactive".
    const viewModelItems = viewModelCollectionMapItems<T, TModel>(
      items,
      this,
      true
    );

    if (IsVue3) {
      return super.push(...viewModelItems);
    }

    return resolveProto(this).push.apply(this, viewModelItems);
  }

  override splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const viewModelItems: any[] = items
      ? viewModelCollectionMapItems(items, this, true)
      : items;

    if (IsVue3) {
      return super.splice(start, deleteCount as any, ...viewModelItems);
    }
    return resolveProto(this).splice.call(
      this,
      start,
      deleteCount as any,
      ...viewModelItems
    );
  }

  constructor(
    $metadata: ModelCollectionValue | ModelType,
    $parent: ViewModel | ListViewModel
  ) {
    super();
    Object.defineProperties(this, {
      // These properties need to be non-enumerable to avoid them from being looped over
      // during iteration of the array if `for ... in ` is used.
      // We also don't want Vue to bother making them reactive because it won't be beneficial.
      $metadata: {
        value: $metadata,
        enumerable: false,
        writable: false,
        configurable: false,
      },
      $parent: {
        value: $parent,
        enumerable: false,
        writable: false,
        configurable: false,
      },
      $hasLoaded: {
        value: false,
        enumerable: false,
        writable: true,
        configurable: false,
      },
    });

    if (IsVue2) {
      Object.defineProperties(this, {
        push: {
          value: ViewModelCollection.prototype.push,
          enumerable: false,
          writable: false,
          configurable: false,
        },
        splice: {
          value: ViewModelCollection.prototype.splice,
          enumerable: false,
          writable: false,
          configurable: false,
        },
      });
      return this;
    } else {
      // Force methods like .filter, .slice to produce plain arrays,
      // not new ViewModelCollection instances.
      // See test "$items.filter produces a plain array".
      Object.defineProperties(this, {
        constructor: {
          value: Array.constructor,
          enumerable: false,
          writable: false,
          configurable: false,
        },
      });

      return reactive(this) as this;
    }
  }
}

type DebounceOptions = {
  /** Time, in milliseconds, to delay. Passed as the second parameter to lodash's `debounce` function. */
  wait?: number;
  /** Additional options to pass to the third parameter of lodash's `debounce` function. */
  debounce?: DebounceSettings;
};

type AutoLoadOptions<TThis> = DebounceOptions & {
  /** A function that will be called before autoloading that can return false to prevent a load. */
  predicate?: (viewModel: TThis) => boolean;

  /** If true, an immediate initial load of the list will be performed. Otherwise, the initial auto-load of the list won't occur until the first change to its parameters occur. */
  immediate?: boolean;
};

type AutoSaveOptions<TThis> = DebounceOptions &
  (
    | {
        /** A function that will be called before autosaving that can return false to prevent a save. */
        predicate?: (viewModel: TThis) => boolean;

        /** If true, auto-saving will also be enabled for all view models that are
         * reachable from the navigation properties & collections of the current view model. */
        deep?: false;
      }
    | {
        /** A function that will be called before autosaving that can return false to prevent a save. */
        predicate?: (viewModel: ViewModel) => boolean;

        /** If true, auto-saving will also be enabled for all view models that are
         * reachable from the navigation properties & collections of the current view model. */
        deep: true;
      }
  );

export interface BulkSaveOptions {
  /** A predicate that will be applied to each modified model
   * to determine if it should be included in the bulk save operation.
   *
   * The predicate is applied before validation (`$hasError`), allowing
   * it to be used to skip over entities that have client validation errors
   * that would otherwise cause the entire bulk save operation to fail.
   * */
  predicate?: (viewModel: ViewModel, action: "save" | "delete") => boolean;

  /** Additional root items that will be traversed for items that need saving.
   * Use to add items that aren't attached to the target of the bulk save,
   * but are still desired to be saved during the same operation.
   */
  additionalRoots?: ViewModel[];
}

/**
 * Dynamically adds getter/setter properties to a class. These properties wrap the properties in its instances' $data objects.
 * @param ctor The class to add wrapper properties to
 * @param metadata The metadata describing the properties to add.
 */
export function defineProps<T extends new () => ViewModel>(
  ctor: T,
  metadata: ModelType
) {
  const props = Object.values(metadata.props);
  const descriptors = {} as PropertyDescriptorMap;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const propName = prop.name;

    const hasWatcherFlag = Symbol("watching collection for dirty " + propName);

    descriptors[propName] = {
      enumerable: true,
      configurable: true,
      get: function (this: InstanceType<T>) {
        return (this as any).$data[propName];
      },
      set:
        prop.type == "model"
          ? function (this: InstanceType<T>, incomingValue: any) {
              if (incomingValue != null) {
                if (typeof incomingValue !== "object") {
                  throw Error(
                    `Cannot assign a non-object to ${metadata.name}.${propName}`
                  );
                } else if ("$metadata" in incomingValue) {
                  if (incomingValue.$metadata.name != prop.typeDef.name) {
                    throw Error(
                      `Type mismatch - attempted to assign a ${incomingValue.$metadata.name} to ${metadata.name}.${propName}`
                    );
                  }
                }

                if (incomingValue instanceof ViewModel) {
                  // Already a viewmodel. Do nothing
                } else {
                  // Incoming is a Model. Make a ViewModel from it.
                  // This is require so that input components work if a component sets the navigation prop to a model instance.
                  incomingValue = ViewModelFactory.get(
                    prop.typeDef.name,
                    incomingValue,
                    !!incomingValue[prop.typeDef.keyProp.name] // Assume the data is clean if it has a PK
                  );
                }

                // If deep autosave is active, propagate it to the new ViewModel instance.
                const autoSaveState = this._autoSaveState?.value;
                if (autoSaveState?.active && autoSaveState.options?.deep) {
                  incomingValue.$startAutoSave(
                    autoSaveState.vue!,
                    autoSaveState.options
                  );
                }

                incomingValue.$parent = this;
              }

              (this as any).$data[propName] = incomingValue;

              // Set the foreign key using the PK of the incoming object.
              // This may end up being redundant if we're in the process
              // of copying the props of an object that already has the FK,
              // but it will help ensure 100% correctness.
              if (prop.role == "referenceNavigation") {
                // When setting an object, fix up the foreign key using the value pulled from the object
                // if it has a value.
                const incomingPk = incomingValue
                  ? incomingValue[prop.principalKey.name]
                  : null;

                // Set on `this`, not `$data`, in order to trigger $isDirty in the
                // setter function for the FK prop.
                (this as any)[prop.foreignKey.name] = incomingPk;

                if (incomingValue && incomingPk == null) {
                  // If the incoming principal model doesn't have a PK yet, mark the FK as dirty.
                  // Then, when a save is performed, `mapToDto` will discover and fixup the FK
                  // if the principal's PK has received a value in the interim.
                  this.$setPropDirty(prop.foreignKey.name);
                }
              }
            }
          : prop.type == "collection" && prop.itemType.type == "model"
          ? function (this: InstanceType<T>, incomingValue: any) {
              let hasLoaded = false;
              if (incomingValue == null) {
                // Usability niceness - make an empty array if the incoming is null.
                // This shouldn't have any adverse effects that I can think of.
                // This will cause the viewmodel collections to always be initialized with empty arrays
                incomingValue = [];
              } else if (!Array.isArray(incomingValue)) {
                throw Error(
                  `Cannot assign a non-array to ${metadata.name}.${propName}`
                );
              } else {
                hasLoaded = true;
              }

              const $data = (this as any).$data;
              const old = $data[propName];

              if (old === incomingValue) {
                // Setting same value. Do nothing.
                return;
              }

              const vmc = new ViewModelCollection(
                prop as ModelCollectionValue,
                this
              );
              // Mark the collection so that we can determine that it has been loaded,
              // versus a collection that was never loaded because the server never populated it.
              // This lets us tell if the collection is truly empty, or empty because it isn't loaded.
              vmc.$hasLoaded = hasLoaded;
              vmc.push(...incomingValue);
              $data[propName] = vmc;
            }
          : function (this: InstanceType<T>, incomingValue: any) {
              const $data = (this as any).$data;

              // Optimization: read old data from raw,
              // because we're just using it to avoid a set if we don't need to,
              // so we don't want to be wasting time on dependency tracking.
              const $dataRaw = toRaw($data);
              const old = $dataRaw[propName];

              // First, check strict equality. This will handle the 90% most common case.
              if (old === incomingValue) {
                return;
              }

              if (
                prop.type == "object" &&
                incomingValue != null &&
                !("$metadata" in incomingValue)
              ) {
                convertToModel(incomingValue, prop.typeDef);
              }

              // If strict equality fails, try to use valueOf() to compare.
              // valueOf() helps with Date instances that represent the same time value.
              // If either side is null, it is ok to set $isDirty, since we
              // know that if we got this far, BOTH sides aren't both null.
              if (old?.valueOf() !== incomingValue?.valueOf()) {
                $data[propName] = incomingValue;

                this.$setPropDirty(propName);

                // For collections of primitives,
                // we need to setup a watcher on the prop so that direct collection
                // mutations will also trigger the dirty flag.
                // Its OK that we only set this up in the setter
                // since there's no point in watching an empty collection.
                if (
                  prop.role == "value" &&
                  prop.type == "collection" &&
                  !prop.dontSerialize &&
                  !(this as any)[hasWatcherFlag]
                ) {
                  (this as any)[hasWatcherFlag] = true;
                  if (!watcherFinalizationRegistry) {
                    //@ts-expect-error
                    if (!window.__coalesce_warned_collection_watcher) {
                      //@ts-expect-error
                      window.__coalesce_warned_collection_watcher = true;
                      console.warn(
                        "Unable to setup dirty watcher for collection prop mutations because FinalizationRegistry is not available."
                      );
                    }
                  } else {
                    // NB: At the time of writing this code this does work to dispose the watcher
                    // when the VM instance is GC'd. HOWEVER, vue seems to currently be bad
                    // at removing refs to `script setup` data and is retaining references.

                    // Must capture a weak ref to `this` so that the effect of the watcher
                    // isn't preventing the viewmodel from being disposed.
                    const weakThis = new WeakRef(this);
                    watcherFinalizationRegistry.register(
                      this,
                      watch(
                        () => $data[propName],
                        () => weakThis.deref()?.$setPropDirty(propName),
                        { deep: true, flush: "sync" }
                      )
                    );
                  }
                }

                if (prop.role == "foreignKey" && prop.navigationProp) {
                  /*
                  If there's a navigation property for this FK,
                  we need to null it out if the current value of the 
                  navigation prop is non-null and the incoming value of the FK does not agree with the  PK on the value of the navigation prop.
                */
                  const currentObject = $dataRaw[prop.navigationProp.name];
                  if (
                    currentObject != null &&
                    incomingValue != currentObject[prop.principalKey.name]
                  ) {
                    // Set on `$data`, not `this`.
                    // We don't want to trigger the "model" setter
                    // since it basically does nothing when the value is null,
                    // and it would also attempt to perform fixup of the FK prop,
                    // but we're already doing just that.
                    $data[prop.navigationProp.name] = null;
                  }
                }
              }
            },
    };
  }

  Object.defineProperties(ctor.prototype, descriptors);
}

export interface ViewModelTypeLookup {
  [name: string]: new (initialData?: any) => ViewModel;
}
export interface ListViewModelTypeLookup {
  [name: string]: new () => ListViewModel<any, any, any>;
}
export interface ServiceViewModelTypeLookup {
  [name: string]: new () => ServiceViewModel;
}

export type ModelOf<T> = T extends ViewModel<infer TModel> ? TModel : never;

/** Do not export.
 *
 * Doesn't strictly return collections of ViewModels,
 * but instead expects the receiving setter of the array to be a ViewModelCollection.
 */
function rebuildModelCollectionForViewModelCollection<
  TModel extends Model<ModelType> = any,
  TItem extends ViewModel<TModel, any, any> = any
>(
  type: ModelType,
  currentValue: Array<TItem>,
  incomingValue: Array<any>,
  isCleanData: DataFreshness,
  purgeUnsaved: boolean
) {
  if (!Array.isArray(currentValue)) {
    currentValue = [];
  }

  let incomingLength = incomingValue.length;
  let currentLength = currentValue.length;

  // There are existing items. We need to surgically merge in the incoming items,
  // keeping existing ViewModels the same based on keys.
  const pkName = type.keyProp.name;
  const existingItemsMap = new Map<any, TItem>();
  const existingItemsWithoutPk = [];
  for (let i = 0; i < currentLength; i++) {
    const item = currentValue[i];
    const itemPk = item.$primaryKey;

    if (itemPk) {
      existingItemsMap.set(itemPk, item);
    } else {
      existingItemsWithoutPk.push(item);
    }
  }

  // Rebuild the currentValue array, using existing items when they exist,
  // otherwise using the incoming items.

  for (let i = 0; i < incomingLength; i++) {
    const incomingItem = incomingValue[i];
    const incomingItemPk = incomingItem[pkName];
    const existingItem = existingItemsMap.get(incomingItemPk);

    if (existingItem) {
      existingItem.$loadFromModel(incomingItem, isCleanData);

      if (currentValue[i] === existingItem) {
        // The existing item is not moving position. Do nothing.
      } else {
        // Replace the item currently at this position with the existing item.
        currentValue.splice(i, 1, existingItem);
      }
    } else {
      // No need to $loadFromModel on the incoming item.
      // The setter for the collection will transform its contents into ViewModels for us.

      if (currentValue[i]) {
        // There is something else already in the array at this position. Replace it.
        currentValue.splice(i, 1, incomingItem);
      } else {
        // Nothing in the current array at this position. Just stick it in.
        currentValue.push(incomingItem);
      }
    }
  }

  if (existingItemsWithoutPk.length && !purgeUnsaved) {
    // Add to the end of the collection any existing items that do not have primary keys.
    // This behavior exists to prevent losing items on the client
    // that may not yet be saved in the event that the parent of the collection
    // get reloaded from a save.
    // If this behavior is undesirable in a specific circumstance,
    // it is trivial to manually remove unsaved items after a .$save() is peformed.

    const existingItemsLength = existingItemsWithoutPk.length;
    for (let i = 0; i < existingItemsLength; i++) {
      const existingItem = existingItemsWithoutPk[i];
      const currentItem = currentValue[incomingLength];

      if (existingItem === currentItem) {
        // The existing item is not moving position. Do nothing.
      } else {
        // Replace the item currently at this position with the existing item.
        currentValue.splice(incomingLength, 1, existingItem);
      }

      incomingLength += 1;
    }
  }

  // If the new collection is shorter than the existing length,
  // remove the extra items.
  if (currentLength > incomingLength) {
    currentValue.splice(incomingLength, currentLength - incomingLength);
  }

  // Let the receiving ViewModelCollection handle the conversion of the contents
  // into ViewModel instances.
  return currentValue;
}

/**
 * Updates the target model with values from the source model.
 * @param target The viewmodel to be updated.
 * @param source The model whose values will be used to perform the update.
 * @param skipDirty If true, only non-dirty props, and related objects, will be updated.
 * Basic properties on target that are dirty will be skipped.
 * @param purgeUnsaved If true, unsaved items lingering in collections that are not in `source` will be removed.
 * @param skipStale If true, only props not actively being saved, and related objects, will be updated.
 * Basic properties on target that are currently being saved will be skipped.
 */
export function updateViewModelFromModel<
  TViewModel extends ViewModel<Model<ModelType>>
>(
  target: TViewModel,
  source: Indexable<{}>,
  skipDirty = false,
  isCleanData: DataFreshness = true,
  purgeUnsaved = false,
  skipStale = false
) {
  ViewModelFactory.scope(function (factory) {
    // Skip if we already applied this source to the target.
    if (!factory.shouldProcess(source, target)) {
      return;
    }

    // Add the root ViewModel to the factory
    // so that when existing ViewModels are being updated,
    // duplicate VM instances won't be created needlessly.

    // "Existing ViewModels" includes user-instantiated instances
    // (i.e. those not instantiated by code in this file).

    factory.set(source, target);

    const metadata = target.$metadata;

    // Sanity check. Probably not crucial if this ends up causing issues. A warning would probably suffice too.
    if ("$metadata" in source && source.$metadata != metadata) {
      throw Error(
        `Attempted to load a ${metadata.name} ViewModel with a ${source.$metadata.name} object.`
      );
    }

    // Optimization: read old data from raw,
    // because we're just using it to avoid a set if we don't need to,
    // so we don't want to be wasting time on dependency tracking.
    // We also want to skip the getter from defineProps for the same reason.
    const $data = (target as any).$data;
    const $dataRaw = toRaw($data);

    if (isCleanData) {
      // When loading clean data, remove any pending bulk deletes
      // because we should expect that any pending delete items are either:
      // 1) Already deleted and therefore no longer need to be contained in $removedItems, OR
      // 2) Not deleted and therefore present in the incoming data, which means we have two copies
      //    of the entity, each in a different state. If an interface is using bulk saves
      //    and performs a load of clean data (e.g. by calling `/load`),
      //    we assuming they're doing so to reset local state.
      delete target.$removedItems;
    }

    let incomingIsStale = false;
    if (typeof isCleanData == "number") {
      if (skipStale && isCleanData < target._dataAge) {
        console.log(
          `Skipped loading ${metadata.name} ${
            target.$primaryKey
          }: incoming data is ${(target._dataAge - isCleanData).toFixed(
            3
          )}ms older than the last known clean data.`
        );
        incomingIsStale = true;
      }
      target._dataAge = isCleanData;
    } else if (isCleanData) {
      target._dataAge = performance.now();
    }

    for (const prop of Object.values(metadata.props)) {
      const propName = prop.name as keyof typeof target & string;
      let incomingValue = source[propName];

      // Sanitize incomingValue to not be undefined (to not break Vue's reactivity),
      // since `source` isn't guaranteed to be a model and thus isn't guaranteed that
      // all properties are defined.
      if (incomingValue === undefined) incomingValue = null;

      switch (prop.role) {
        case "referenceNavigation":
          if (incomingValue) {
            const currentValue = $dataRaw[propName];
            if (
              currentValue == null ||
              currentValue[prop.typeDef.keyProp.name] !==
                incomingValue[prop.typeDef.keyProp.name]
            ) {
              // If the current value is null,
              // or if the current value has a different PK than the incoming value,
              // we should create a brand new object.

              if (skipStale && target.$savingProps.has(prop.foreignKey.name)) {
                // This is a pretty rare condition and might be unintuitive as to what happened, so log this.
                console.log(
                  `Skipped loading '${propName}' on ${metadata.name} ${target.$primaryKey}: property is actively saving.`
                );
              } else if (!incomingIsStale) {
                // The setter on the viewmodel will handle the conversion to a ViewModel.
                target[propName] = incomingValue;
              }
            } else {
              // `currentValue` is guaranteed to be a ViewModel by virtue of the
              // implementations of the setters for referenceNavigation properties on ViewModel instances.
              currentValue.$loadFromModel(
                incomingValue,
                isCleanData,
                purgeUnsaved
              );
            }

            // Check if target.$parent is the expected value of this navigation prop,
            // and if it is, update $parent. (The KO stack did this too).
            const parent = target.$parent;
            const newValue =
              currentValue ?? (target[propName] as any as ViewModel);
            if (
              parent instanceof ViewModel &&
              newValue &&
              parent.$metadata === newValue.$metadata &&
              newValue.$primaryKey === parent.$primaryKey &&
              parent !== newValue
            ) {
              parent.$loadFromModel(incomingValue, isCleanData, purgeUnsaved);
            }
          } else {
            // We allow the existing value of the navigation prop to stick around
            // if the server didn't send it back.
            // The setter handling for the foreign key will handle
            // clearing out the current object if it doesn't match the incoming FK.
            // This allows us to keep the existing navigation object
            // even if the server didn't respond with one.
            // However, if the FK has changed to a different value that no longer
            // agrees with the existing navigation object,
            // the FK setter will null the navigation to prevent an inconsistent data model.
          }
          break;
        case "collectionNavigation":
          const currentValue = $data[propName];

          if (incomingValue == null) {
            if (currentValue) {
              // No incoming collection was provided. Allow the existing collection to stick around.
              // Note that this case is different from the incoming value being an empty array,
              // which should be used to explicitly clear our the existing collection.
            } else {
              // Pass null directly through to the VM's setter.
              // The VM's setter will then populate the VM's data with an empty array rather than null.
              target[propName] = null as any;
            }
            break;
          }

          if (!Array.isArray(incomingValue)) {
            throw `Expected array for incoming value for ${metadata.name}.${prop.name}`;
          }

          const newCollection = rebuildModelCollectionForViewModelCollection(
            prop.itemType.typeDef,
            currentValue,
            incomingValue,
            isCleanData,
            purgeUnsaved
          ) as any;

          if (currentValue !== newCollection) {
            target[propName] = newCollection;
          }
          break;

        case "primaryKey":
          // Always update the PK, even if skipDirty is true.
          if ($dataRaw[propName] !== incomingValue) {
            target[propName] = incomingValue;
          }
          break;

        default:
          // We check against the current value here for a minor perf increase -
          // Even though this is redundant with the ViewModel's setters,
          // it avoids calling into the setter if we don't have to,
          // and handles the vast majority of cases. Using $dataRaw also avoids unnecessary reactivity.
          if ($dataRaw[propName] === incomingValue) {
            break;
          }

          if (prop.role == "foreignKey") {
            if (
              incomingValue == null &&
              prop.navigationProp &&
              source[prop.navigationProp.name]
            ) {
              // A value for the navigation property was provided,
              // but a foreign key was not. Do not set the FK to null,
              // since depending on the order of property iteration, doing so might
              // null out the navigation property if the navigation property was already set.
              break;
            }
          }

          if (skipStale && target.$savingProps.has(propName)) {
            // This is a pretty rare condition and might be unintuitive as to what happened, so log this.
            console.log(
              `Skipped loading '${propName}' on ${metadata.name} ${target.$primaryKey}: property is actively saving.`
            );
          } else if (skipDirty && target.$getPropDirty(propName)) {
            // Do nothing. We've historically never logged here, so we'll continue not logging for now.
            // This scenario usually happens if the user is just rapidly inputting into one field, e.g. a text field.
          } else if (!incomingIsStale) {
            target[propName] = incomingValue;
          }
          break;
      }
    }
  }, isCleanData);
}

/* Internal members/helpers */

class AutoCallState<TOptions = any> {
  active: boolean = false;
  cleanup: Function | null = null;

  // Note: these can't be properly typed because Vue ref unwrapping blows everything up.
  vue: any | null = null;
  hooked = new WeakSet<any>();

  options: TOptions | null = null;
  trigger: (() => void) | null = null;

  constructor() {
    // Seal to prevent unnecessary reactivity
    return Object.seal(this);
  }
}

function startAutoCall(
  state: AutoCallState,
  vue: VueInstance,
  watcher?: () => void,
  debouncer?: Cancelable
) {
  if (!state.hooked.has(vue)) {
    state.hooked.add(vue);
    onBeforeUnmount(
      // Only cleanup if the component instance on the state is the owner of the hook.
      // Since we can't cleanup hooks in vue3, this hook may be firing for a component
      // that no longer owns this autocall state, in which case it should be ignored.
      () => state.vue === vue && state.cleanup?.(),
      getInternalInstance(vue)
    );
  }

  state.vue = vue;
  state.cleanup = () => {
    if (!state.active) return;

    // Destroy the watcher
    watcher?.();

    // Cancel the debouncing timer if there is one.
    debouncer?.cancel();

    state.active = false;

    // cleanup for GC
    state.vue = null;
    state.cleanup = null;
  };
  state.active = true;
}

function joinErrors(errors: Iterable<string>) {
  return [...errors].map((e) => e.replace(/\.$/, "")).join(", ") + ".";
}

const watcherFinalizationRegistry =
  typeof FinalizationRegistry !== "undefined"
    ? new FinalizationRegistry<WatchStopHandle>((heldValue) => {
        heldValue();
      })
    : undefined;

//@ts-expect-error: only exists in vue3, but not vue2.
declare module "@vue/reactivity" {
  export interface RefUnwrapBailTypes {
    // Prevent Vue's type helpers from brutalizing coalesce view models,
    // which are manually marked to skip reactivity (ReactiveFlags_SKIP)
    // and therefore are never unwrapped anyway.
    coalesceViewModels: ViewModel | ListViewModel | ServiceViewModel;
  }
}

// The vue2 version of this interface:
declare module "vue" {
  // If we don't also declare GlobalComponents here,
  // then all component intellisense breaks for vue2.
  // I have absolutely no idea why.
  export interface GlobalComponents {}

  export interface RefUnwrapBailTypes {
    coalesceViewModels: ViewModel | ListViewModel | ServiceViewModel;
  }
}
