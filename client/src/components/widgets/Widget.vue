<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  gridFromRow: number,
  gridToRow: number,
  gridFromCol: number,
  gridToCol: number
}>();

const cssStyles = computed(() => ({
  'grid-area': `${props.gridFromRow} / ${props.gridFromCol} / ${props.gridToRow} / ${props.gridToCol}`
}));
</script>

<template>
  <div :style="cssStyles" class="bg-white shadow-xl rounded-xl">
    <slot />
  </div>
</template>
