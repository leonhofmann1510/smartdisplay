<script setup lang="ts">
import { useMusic } from '@/composables/useMusic';

const { currentTrack, nextTrack, trackTime, currentTrackTitle, trackTimeRelative, trackTimeCounter } = useMusic();
</script>

<template>
  <div class="h-full flex flex-col justify-between">
    <div class="flex p-4 border-b border-slate-500">
      <div class="w-28 h-28 bg-slate-300 rounded-xl overflow-hidden">
        <img v-if="currentTrack" :src="'http://localhost:3000/' + currentTrack.coverUrl" class="w-full h-full" /> 
      </div>
      <div class="flex flex-col justify-between w-[calc(100%-7rem)] p-4">
        <h1 class="text-xl font-bold">{{ currentTrackTitle }}</h1>
        <template v-if="currentTrack">
          <div>{{ currentTrack.artist }}</div>
          <div class="text-sm text-slate-700 font-mono">{{ trackTimeCounter }} / 3:20</div>
        </template>
      </div>
    </div>
    <div class="p-4">
      <div class="w-full h-2 bg-slate-300 rounded-full overflow-hidden">
        <div class="w-full h-full bg-blue-300" :style="{ width: `${trackTimeRelative}%` }"></div>
      </div>
      <div v-if="nextTrack" class="flex justify-between mt-2 text-xs text-slate-700">
        <div class="font-bold">Next Track in Queue:</div>
        <div class="">{{ nextTrack.title }}</div>
      </div>
    </div>
  </div>

</template>
