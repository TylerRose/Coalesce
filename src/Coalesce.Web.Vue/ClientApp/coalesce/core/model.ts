
import * as moment from 'moment';
import { ClassType, IHaveMetadata, ModelType, Property, ExternalType, CollectableType, PropNames, resolvePropMeta } from "./metadata";

/**
 * Represents a model with metadata information.
 */
export interface Model<TMeta extends ClassType> extends IHaveMetadata {
    readonly $metadata: TMeta;
    [k: string]: any | null | undefined
}

/**
 * Transforms a given object with data properties into a valid implemenation of TModel.
 * This function mutates its input and all descendent properties of its input - it does not map to a new object.
 * @param object The object with data properties that should be converted to a TModel
 * @param metadata The metadata describing the TModel that is desired
 */
export function convertToModel<TMeta extends ClassType, TModel extends Model<TMeta>>(object: {[k: string]: any}, metadata: TMeta): TModel {
    if (!object) return object;

    const hydrated = Object.assign(object, { $metadata: metadata }) as TModel;
    
    for (const propName in metadata.props) {
        const propMeta = metadata.props[propName];
        const propVal = hydrated[propName];
        if (!(propName in hydrated) || propVal === undefined) {
            // All propertes that are not defined need to be declared
            // so that Vue's reactivity system can discover them.
            // Null is a valid type for all model properties (or at least generated models). Undefined is not.
            hydrated[propName] = null
        } else if (propVal === null) {
            // Incoming value was explicit null. Nothing to be done.
        } else {
            switch (propMeta.type) {
                case "date": 
                    // https://codepen.io/anon/pen/PQVNxQ
                    // This is consistently 20x faster than letting moment parse our date.
                    // Since we know all our incoming dates are going to be ISO 8601, this is safe.
                    // Tested for parsing correctness on Firefox, Chrome, and IE 11.
                    var momentInstance = moment(new Date(propVal));
                    if (!momentInstance.isValid()) {
                        throw `Recieved unparsable date: ${propVal}`;
                    }
                    hydrated[propName] = momentInstance;    
                    break;    
                case "model":
                case "object":
                    convertToModel(propVal, propMeta.typeDef)
                    break;
                case "collection":
                    const typeDef = propMeta.typeDef;
                    if (Array.isArray(propVal) 
                        && typeof(typeDef) == 'object' 
                        && (typeDef.type == "model" || typeDef.type == "object"))
                    {
                        propVal.forEach((item: any) => convertToModel(item, typeDef));
                    }
                    break;
            }
        }
    }
    return object as TModel;
}

export function mapToDto<T extends Model<ClassType>>(object: T): any {
    var dto: { [k: string]: any } = {};
    for (const propName in object.$metadata.props) {
        const propMeta = object.$metadata.props[propName];

        var value = object[propName];
        switch (propMeta.type) {
            case "date":
                if (moment.isMoment(value)) {
                    value = value.toISOString(); // TODO: pass keepOffset property for DateTimeOffset, and not DateTime.
                } else if (value) {
                    value = value.toString();
                }
            case "string":
            case "number":
            case "boolean":
            case "enum":
                value = value || null;    
                break;
            default:
                value = undefined;
        }

        if (value !== undefined) {
            dto[propName] = value;
        }
    }
    return dto;
}

/**
 * Given a non-collection value and its type's metadata, 
 * return a string representation of the value suitable for display.
 */
// Intentionally not exported - this is a helper for the other display functions.
function getDisplayForType(type: CollectableType, value: any): string | null {
    if (value == null) return value;

    switch (type) {
        case "date":
        case "number":
        case "boolean":
        case "string":
            return value.toLocaleString()
    }
    switch (type.type) {
        case "enum":
            const enumData = type.valueLookup[value];
            if (!enumData) return null;
            return enumData.displayName;
        case "model":
        case "object":
            return modelDisplay(value);
    }
}


/**
 * Given a model instance, return a string representation of the instance suitable for display.
 * @param item The model instance to return a string representation of
 */
export function modelDisplay<T extends Model<TMeta>, TMeta extends ClassType>(item: T): string | null {
    const modelMeta = item.$metadata
    if (!modelMeta) {
        throw `Item passed to modelDisplay(item) is missing its $metadata property`
    }
    if (modelMeta.displayProp)
        return propDisplay(item, modelMeta.displayProp);
    else {
        // https://stackoverflow.com/a/46908358 - stringify only first-level properties.
        try {
            return JSON.stringify(item, function (k, v) { return k ? "" + v : v; });
        } catch {
            return item.toLocaleString();
        }
    }
}

/**
 * Given a model instance and a descriptor of a property on the instance,
 * return a string representation of the property suitable for display.
 * @param item An instance of the model that holds the property to be displayed
 * @param prop The property to be displayed - either the name of a property or a property metadata object.
 */
export function propDisplay<T extends Model<TMeta>, TMeta extends ClassType>(item: T, prop: Property | PropNames<TMeta>) {
    const propMeta = resolvePropMeta(item.$metadata, prop);

    var value = item[propMeta.name];

    switch (propMeta.type) {
        case "enum":
        case "model":
        case "object":
            return getDisplayForType(propMeta.typeDef, value);
        case "collection":
            if (!value) {
                value = [];
            }
            if (!Array.isArray(value)){
                throw `Value for collection ${propMeta.name} was not an array`
            }

            // Is this what we want? I think so - its the cleanest option.
            // Perhaps an prop that controls this would be best.
            if (value.length == 0) return "";
            // TODO: a prop that controls this number would also be good.
            if (value.length <= 5) {
                let collectedType = propMeta.typeDef
                return (value)
                    .map<string>(childItem => {
                        var display = getDisplayForType(collectedType, childItem);
                        if (display === null) display = '???' // TODO: what should this be for un-displayable members of a collection?
                        return display;
                    })
                    .join(", ")
            }
            return value.length.toLocaleString();
        default:
            return getDisplayForType(propMeta.type, value);
    }
}


// type HydratedModel<T extends Model> = {
//     [P in keyof T]?: DeepTransport<T[P]>;
// } & IHaveMetadata


// e.g. 

/*

type DeepTransport<T> = 
    T extends any[] ? DeepTransportArray<T[number]> :
    T extends Date ? string :
    T extends object ? DeepTransportObject<T> :
    T;
interface DeepTransportArray<T> extends Array<DeepTransport<T>> {}
type DeepTransportObject<T> = { [P in keyof T]?: DeepTransport<T[P]>; };


export type Transport<T> = DeepTransport<Pick<T, Exclude<keyof T, keyof IHaveMetadata>>>



    type CaseTransport = Transport<Case>
    var a: CaseTransport;

*/