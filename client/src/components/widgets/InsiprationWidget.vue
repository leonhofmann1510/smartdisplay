<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import type { IQuote } from '../../../../shared/models/IQuote';
import { useApi } from '@/composables/useApi';

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
  <div class="h-[5%] rounded-t-xl bg-black" :style="{width: width+'%'}"></div>
  <div class="flex justify-center items-center h-[95%]">
    <div>
      <p class="text-[5cqmin] text-center font-bold leading-none">{{ quote?.text }}</p>
      <p class="text-[2cqmin] text-center">said by {{ quote?.person }}</p>
    </div>
  </div>
</template>