<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import type { IArt } from '@/../../shared/models/IArt';
import { useApi } from '@/composables/useApi';
import FitText from '../FitText.vue';

const props = defineProps<{
	cycleLength: number
}>();

const width: Ref<number, number> = ref(0);
const art = ref<IArt | null>(null);
let timer: number = 0;

async function changeArt() {
	const { getRandomArt } = useApi();
	art.value = await getRandomArt();
}

onMounted(() => {
	changeArt().catch(console.error);

	timer = setInterval(() => {
		if (width.value < 100) {
			width.value = width.value + 1 / props.cycleLength;
		} else {
			width.value = 0;
			changeArt().catch(console.error);
		}
	}, 10);
});

onUnmounted(() => {
	clearInterval(timer);
});
</script>

<template>
	<div class="h-2.5 rounded-full bg-black" :style="{ width: width + '%' }"></div>
	<div class="flex flex-col h-[calc(100%-10px)] px-4 pt-2 pb-3 gap-2">
		<div class="h-[70%] w-full overflow-hidden rounded-lg bg-slate-100">
			<img
				v-if="art?.image"
				:src="art.image"
				:alt="art.title || 'Artwork image'"
				class="h-full w-full object-cover"
			/>
			<div v-else class="flex items-center justify-center h-full text-slate-400 text-sm">
				No artwork image available
			</div>
		</div>

		<div class="h-[30%] flex flex-col gap-1 overflow-hidden">
			<div class="h-[30%]">
				<FitText class="font-bold text-slate-800">{{ art?.title || 'Untitled artwork' }}</FitText>
			</div>
			<div class="h-[20%]">
				<FitText class="text-slate-500">{{ art?.artist || 'Unknown artist' }}</FitText>
			</div>
			<div class="h-[50%]">
				<FitText multiline class="text-slate-600">{{ art?.description || 'No description available.' }}</FitText>
			</div>
		</div>
	</div>
</template>