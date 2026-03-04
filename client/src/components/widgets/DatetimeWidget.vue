<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

import Widget from '@/components/widgets/Widget.vue';

const time = ref('');
const date = ref('');

const update = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  date.value = now.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

let interval: number;

onMounted(() => {
  update();
  interval = setInterval(update, 1000);
});

onBeforeUnmount(() => clearInterval(interval));
</script>

<template>
  <Widget
    :grid-from-row="1"
    :grid-from-col="1"
    :grid-to-row="1"
    :grid-to-col="2"
  >
    <div class="flex justify-center items-center h-full">
      <div>
        <p class="text-[18cqw] text-center font-bold leading-none">{{ time }}</p>
        <p class="text-[9cqw] text-center">{{ date }}</p>
      </div>
    </div>
  </Widget>
</template>