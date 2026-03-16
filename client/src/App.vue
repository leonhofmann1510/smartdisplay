<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { IWidget } from '../../shared/models/IWidget';
import type { IPosition } from '../../shared/models/IPosition';
import Widget from './components/widgets/Widget.vue';
import { useApi } from './composables/useApi';

const { getWidgets, setWidgets } = useApi();
const loadedWidgets = ref<IWidget[] | null>();

const getAllWidgets = async () => {
  loadedWidgets.value = await getWidgets();
};

const setWidget = async (id: string, position: IPosition) => {
  if (!loadedWidgets.value) return
  const widget = loadedWidgets.value.find(w => w.id === id)
  if (!widget) return
  widget.props.position = position
  await setWidgets(loadedWidgets.value)
}

onMounted(async () => {
  await getAllWidgets();
});

</script>

<template>
  <div class="h-screen grid grid-rows-4 grid-cols-8 gap-4 p-4 bg-slate-100">

    <template v-if="loadedWidgets">
      <Widget
        v-for="({ componentName, props, id }) in loadedWidgets"
        :key="id"
        :id="id"
        v-bind="props.position"
        @set-widget="setWidget"
      >
        <component :is="componentName" v-bind="props.specific" />
      </Widget>
    </template>

  </div>
</template>

<style scoped></style>