<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FitText from './FitText.vue';

const time = ref('');
const date = ref('');

const update = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString('en-EN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  date.value = now.toLocaleDateString('en-EN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

let interval: number;

onMounted(() => {
  update();
  interval = setInterval(update, 1000);
});

onBeforeUnmount(() => clearInterval(interval));
</script>

<template>
  <div class="flex flex-col h-full px-6 py-4">
    <div class="flex-3 w-full">
      <FitText class="font-bold">{{ time }}</FitText>
    </div>
    <div class="flex-1 w-full">
      <FitText>{{ date }}</FitText>
    </div>
  </div>
</template>
