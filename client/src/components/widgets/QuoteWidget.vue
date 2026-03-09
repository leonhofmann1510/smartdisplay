<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import type { IQuote } from '../../../../shared/models/IQuote';
import { useApi } from '@/composables/useApi';
import FitText from '../FitText.vue';

const props = defineProps<{
  cycleLength: number
}>();

const width: Ref<number, number> = ref(0);
let timer: number = 0;

onMounted(() => {
  changeQuote();

  timer = setInterval(() => {
    if (width.value < 100) {
      width.value = width.value + 1 / props.cycleLength;
    } else {
      width.value = 0;
      changeQuote();
    }
  }, 10)
})

const quote = ref<IQuote | null>();

async function changeQuote() {
  const { getRandomQuote } = useApi();
  quote.value = await getRandomQuote();
}

onUnmounted(() => {
  clearInterval(timer);
})
</script>

<template>
  <div class="h-[3%] rounded-full bg-black" :style="{ width: width + '%' }"></div>
  <div class="flex flex-col h-[97%] px-6 pt-2 pb-4">
    <div class="flex-1 flex flex-col gap-1 pt-3">
      <div class="flex-4">
        <FitText multiline class="font-bold">{{ quote?.text }}</FitText>
      </div>
      <div class="flex-1">
        <FitText class="text-slate-500">— {{ quote?.person }}</FitText>
      </div>
    </div>
  </div>
</template>