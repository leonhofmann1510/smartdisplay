<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ITrackState } from '@/../../shared/models/ITrackState'
import { useApi } from '@/composables/useApi'
import FitText from '../FitText.vue'

const { getMusicState, postMusicAction, syncTrackTime } = useApi()

const APIURL = import.meta.env.VITE_APIURL
const baseUrl = APIURL.replace('/api', '')

const state = ref<ITrackState | null>(null)
const trackTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const currentTrackUrl = ref('')

const audio = new Audio()
let pollTimer: number = 0
let syncTimer: number = 0

const currentTitle = computed(() => state.value?.currentTrack?.title ?? 'No track')
const currentArtist = computed(() => state.value?.currentTrack?.artist ?? '')

const coverSrc = computed(() => {
  if (!state.value?.currentTrack) return ''
  const url = state.value.currentTrack.coverUrl
  if (url.startsWith('/api/')) return baseUrl + url
  return baseUrl + '/' + url
})

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (trackTime.value / duration.value) * 100
})

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const timeDisplay = computed(() => formatTime(trackTime.value))
const durationDisplay = computed(() => formatTime(duration.value))

const loadState = async () => {
  try {
    const s = await getMusicState()
    state.value = s

    if (s.currentTrack) {
      const newUrl = s.currentTrack.audioUrl
      if (currentTrackUrl.value !== newUrl) {
        currentTrackUrl.value = newUrl
        audio.src = baseUrl + '/' + newUrl
      }
      if (s.isPlaying && audio.paused) {
        audio.play().catch(() => {})
      } else if (!s.isPlaying && !audio.paused) {
        audio.pause()
      }
      isPlaying.value = s.isPlaying
      if (s.currentTrack.duration) {
        duration.value = s.currentTrack.duration
      }
    }
  } catch (e) {
    console.error('Failed to load music state', e)
  }
}

const play = async () => {
  const s = await postMusicAction({ action: 'play' })
  state.value = s
  isPlaying.value = true
  audio.play().catch(() => {})
}

const pause = async () => {
  const s = await postMusicAction({ action: 'pause' })
  state.value = s
  isPlaying.value = false
  audio.pause()
}

const next = async () => {
  audio.pause()
  const s = await postMusicAction({ action: 'next' })
  state.value = s
  isPlaying.value = s.isPlaying
  trackTime.value = 0
  if (s.currentTrack) {
    currentTrackUrl.value = s.currentTrack.audioUrl
    audio.src = baseUrl + '/' + s.currentTrack.audioUrl
    if (s.isPlaying) audio.play().catch(() => {})
  }
}

const prev = async () => {
  audio.pause()
  const s = await postMusicAction({ action: 'prev' })
  state.value = s
  isPlaying.value = s.isPlaying
  trackTime.value = 0
  if (s.currentTrack) {
    currentTrackUrl.value = s.currentTrack.audioUrl
    audio.src = baseUrl + '/' + s.currentTrack.audioUrl
    if (s.isPlaying) audio.play().catch(() => {})
  }
}

audio.addEventListener('timeupdate', () => {
  trackTime.value = audio.currentTime
})

audio.addEventListener('loadedmetadata', () => {
  if (audio.duration && isFinite(audio.duration)) {
    duration.value = audio.duration
  }
})

audio.addEventListener('ended', () => {
  next()
})

onMounted(() => {
  loadState()
  pollTimer = setInterval(loadState, 10000)
  syncTimer = setInterval(() => {
    if (isPlaying.value) {
      syncTrackTime(Math.floor(audio.currentTime)).catch(() => {})
    }
  }, 5000)
})

onUnmounted(() => {
  clearInterval(pollTimer)
  clearInterval(syncTimer)
  audio.pause()
  audio.src = ''
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Track Info -->
    <div class="flex gap-3 p-3 flex-1 min-h-0">
      <div class="aspect-square h-full rounded-lg overflow-hidden bg-slate-200 shrink-0">
        <img v-if="coverSrc" :src="coverSrc" class="w-full h-full object-cover" />
      </div>
      <div class="flex flex-col justify-center gap-1 min-w-0 flex-1">
        <div class="h-[40%]">
          <FitText class="font-bold text-slate-800">{{ currentTitle }}</FitText>
        </div>
        <div v-if="currentArtist" class="h-[30%]">
          <FitText class="text-slate-500">{{ currentArtist }}</FitText>
        </div>
        <div class="h-[20%]">
          <FitText class="font-mono text-slate-400">{{ timeDisplay }} / {{ durationDisplay }}</FitText>
        </div>
      </div>
    </div>

    <!-- Progress -->
    <div class="px-3 pb-3 flex flex-col gap-2">
      <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div class="h-full bg-slate-800 transition-all duration-300" :style="{ width: `${progressPercent}%` }"></div>
      </div>

      
      <div class="flex items-center justify-center gap-4">
        <button @click="prev" class="text-slate-500 hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V7.19c0-1.44-1.555-2.342-2.805-1.628L12 9.54V7.19c0-1.44-1.555-2.342-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
          </svg>
        </button>

        <button v-if="!isPlaying" @click="play" class="text-slate-700 hover:text-slate-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
        </button>

        <button v-else @click="pause" class="text-slate-700 hover:text-slate-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
            <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
          </svg>
        </button>

        <button @click="next" class="text-slate-500 hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.688v6.624c0 1.44 1.555 2.342 2.805 1.629L12 13.471v2.34c0 1.44 1.555 2.342 2.805 1.629l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 5.347 12 6.249 12 7.688v2.34L5.055 7.06Z" />
          </svg>
        </button>
      </div>
     

      <div v-if="state?.nextTrack" class="flex justify-between text-xs text-slate-400">
        <span>Next:</span>
        <span>{{ state.nextTrack.title }}</span>
      </div>
    </div>
  </div>
</template>
