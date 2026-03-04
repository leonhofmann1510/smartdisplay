<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  gridFromRow: number,
  gridToRow: number,
  gridFromCol: number,
  gridToCol: number
}>();

const cssStyles = computed(() => ({
  'grid-area': `${props.gridFromRow} / ${props.gridFromCol} / ${props.gridToRow + 1} / ${props.gridToCol + 1}`
}));
</script>

<template>
  <div :style="cssStyles" class="bg-white shadow-xl rounded-xl @container">
    <slot />
  </div>
</template>
