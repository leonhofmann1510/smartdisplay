<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

import Widget from '@/components/widgets/Widget.vue';

const h = ref<number>();
const m = ref<number>();
const s = ref<number>();

let interval: number;

onMounted(() => {
  interval = setInterval(() => {
    const now = Date.now();
    s.value = Math.floor(now / 1000) % 60;
    m.value = Math.floor(now / (1000 * 60)) % 60;
    h.value = Math.floor(now / (1000 * 60 * 60)) % 24;
  }, 1000);
});

onBeforeUnmount(() => clearInterval(interval));
</script>

<template>
  <Widget
    :grid-from-row="1"
    :grid-from-col="1"
    :grid-to-row="2"
    :grid-to-col="3"
  >
    <div>{{ h }}:{{ m }}:{{ s }}</div>
  </Widget>
</template>