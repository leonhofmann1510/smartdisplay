<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FitText from '../FitText.vue';

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
  <div class="flex h-full flex-col items-center justify-center px-6 py-4 gap-1">
    <div class="w-full h-[58%]">
      <FitText class="font-bold">{{ time }}</FitText>
    </div>
    <div class="w-full h-[32%]">
      <FitText>{{ date }}</FitText>
    </div>
  </div>
</template>
