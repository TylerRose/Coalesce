<template>
  <v-card class="c-admin-methods" v-if="methods.length">
    <v-toolbar
      class="c-admin-methods--toolbar"
      density="compact"
      :color="color"
    >
      <v-toolbar-title style="flex: 0 1 auto"> Actions </v-toolbar-title>

      <v-divider class="mx-4 my-0" vertical></v-divider>

      <v-toolbar-title v-if="'$primaryKey' in viewModel">
        <c-display :model="viewModel"></c-display>
      </v-toolbar-title>
    </v-toolbar>
    <v-expansion-panels class="c-methods">
      <v-expansion-panel
        v-for="method in methods"
        :key="method.name"
        :class="'method-' + method.name"
      >
        <v-expansion-panel-title>
          <div>{{ method.displayName }}</div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <c-admin-method
            :model="model"
            :for="method"
            :autoReloadModel="autoReloadModel"
          >
          </c-admin-method>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  ViewModel,
  ModelType,
  ListViewModel,
  HiddenAreas,
  ServiceViewModel,
} from "coalesce-vue";
import { PropType } from "vue";

type AnyViewModel = ViewModel | ListViewModel | ServiceViewModel;

export default defineComponent({
  name: "c-admin-methods",

  props: {
    model: {
      required: true,
      type: Object as PropType<AnyViewModel>,
    },
    area: {
      required: false,
      type: Number as PropType<HiddenAreas>,
    },
    color: { required: false, type: String, default: null },
    autoReloadModel: { required: false, type: Boolean, default: false },
  },

  computed: {
    viewModel(): AnyViewModel {
      if (this.model instanceof ViewModel) return this.model;
      if (this.model instanceof ListViewModel) return this.model;
      if (this.model instanceof ServiceViewModel) return this.model;
      throw Error(
        "c-method: prop `model` is required, and must be a ViewModel."
      );
    },

    metadata() {
      return this.viewModel.$metadata as ModelType;
    },

    isStatic() {
      return this.viewModel instanceof ListViewModel;
    },

    methods() {
      if (this.viewModel instanceof ViewModel && !this.viewModel.$primaryKey) {
        return [];
      }

      return Object.values(this.metadata.methods).filter(
        (m) =>
          !!m.isStatic == this.isStatic &&
          (!this.area || ((m.hidden || 0) & this.area) == 0)
      );
    },
  },
});
</script>

<style lang="scss"></style>
