<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';
import type { IApiResponse } from '../../../../shared/models/IApiResponse';
import { useApi } from '@/composables/useApi';
import Widget from '@/components/widgets/Widget.vue';

const { getPlaylist } = useApi();

const playlist: Ref<IApiResponse<string[]> | null> = ref(null);
const currentTrack: Ref<string | null> = ref(null);
const isTrackPlaying = ref(false);
const audio = new Audio();

const currentTrackTitle = computed(
  () => currentTrack.value ? currentTrack.value.substring(0, currentTrack.value.lastIndexOf('.')) : '[no track selected]'
);

const onTrackSelected = (title: string) => {
  if (isTrackPlaying.value) {
    audio.pause();
    isTrackPlaying.value = false;
  }
  currentTrack.value = title;
  audio.src = `${import.meta.env.VITE_PUBLICURL}/audio/playlist/${title}`;
};

const onPlayPause = () => {
  if (!currentTrack.value) {
    isTrackPlaying.value = false;
    return;
  }
  if (isTrackPlaying.value) {
    audio.pause();
    isTrackPlaying.value = false;
  }
  else {
    audio.play();
    isTrackPlaying.value = true;
  }
};

onMounted(() => {
  getPlaylist().then(res => playlist.value = res);
});
</script>

<template>
  <Widget
    :grid-from-row="1"
    :grid-from-col="3"
    :grid-to-row="1"
    :grid-to-col="6"
  >
    <div class="flex h-full">
      <div class="flex flex-col justify-between flex-1/2 p-4 bg-slate-50">
        <div class="h-25 flex items-center bg-slate-100">
          <div class="w-25 h-25 p-4 bg-slate-200 rounded-xl">
            <div
              class="w-full h-full flex items-center justify-center border-4 border-white rounded-full cursor-pointer"
              @click="onPlayPause"  
            >
              <IconMdiPlayArrow v-if="!isTrackPlaying" class="h-10 w-10 text-white" />
              <IconMdiPause v-else class="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 class="px-4 text-2xl font-bold">{{ currentTrackTitle }}</h1>
        </div>
        <div class="h-15 flex items-center">
          <div class="w-15 h-15 flex items-center justify-center bg-blue-400 rounded-full cursor-pointer">
            <IconMdiChevronLeft class="w-10 h-10 text-white" />
          </div>
          <div class="w-[calc(100%-7.5rem)] h-5 px-4">
            <div class="h-full rounded-full bg-slate-200"></div>
          </div>
          <div class="w-15 h-15 flex items-center justify-center bg-blue-400 rounded-full cursor-pointer">
            <IconMdiChevronRight class="w-10 h-10 text-white" />
          </div>
        </div>
      </div>
      <div class="flex-1/2 p-4">
        <ul v-if="playlist" class="h-full overflow-scroll">
          <li
            v-for="title in playlist.data"
            :key="title"
            class="p-4 border-b border-slate-300 transition-colors cursor-pointer last:border-none hover:bg-blue-50"
            @click="onTrackSelected(title)"  
          >
            {{ title.substring(0, title.lastIndexOf('.')) }}
          </li>
        </ul>
      </div>
    </div>
  </Widget>
</template>
