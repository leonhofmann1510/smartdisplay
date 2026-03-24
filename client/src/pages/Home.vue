<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { IWidget } from '@/../../shared/models/IWidget';
import Widget from '@/components/widgets/Widget.vue';
import { useApi } from '@/composables/useApi';
import { useWidgetSocket } from '@/composables/useWidgetSocket';

const { getWidgets } = useApi();
const loadedWidgets = ref<IWidget[] | null>();

const getAllWidgets = async () => {
  loadedWidgets.value = await getWidgets();
};

// Listen for real-time widget updates from dashboard editor
useWidgetSocket((widgets) => {
  loadedWidgets.value = widgets;
});

onMounted(async () => {
  await getAllWidgets();
});

</script>

<template>
  <div class="h-full grid grid-rows-4 grid-cols-8 gap-4 p-4 bg-slate-100">

    <template v-if="loadedWidgets">
      <Widget
        v-for="({ componentName, props, id }) in loadedWidgets"
        :key="id"
        :id="id"
        :editable="false"
        v-bind="props.position"
      >
        <component :is="componentName" v-bind="props.specific" />
      </Widget>
    </template>

  </div>
</template>
