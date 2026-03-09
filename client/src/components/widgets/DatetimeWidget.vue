<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

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
  <div class="flex justify-center items-center h-full">
    <div>
      <p class="text-[18cqmin] text-center font-bold leading-none">{{ time }}</p>
      <p class="text-[6cqmin] text-center">{{ date }}</p>
    </div>
  </div>
</template>