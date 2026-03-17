import type { Ref } from 'vue';
import { ref, computed, onBeforeUnmount } from 'vue';
import type { ITrack } from '@/../../shared/models/ITrack';
import type { ITrackState } from '@/../../shared/models/ITrackState';
import { io } from 'socket.io-client';

export const useMusic = () => {
  const audio = new Audio();

  const currentTrack: Ref<ITrack | null> = ref(null);
  const nextTrack: Ref<ITrack | null> = ref(null);
  const trackTime: Ref<number> = ref(0);

  const currentTrackTitle = computed(() => currentTrack.value ? currentTrack.value.title : '[no track selected]');
  const trackTimeRelative = computed(() => {
    if (!currentTrack.value)
      return 0;
    
    return trackTime.value / audio.duration * 100;
  });
  const trackTimeCounter = computed(() => {
    return `${Math.floor(trackTime.value / 60)}:${(trackTime.value % 60).toString().padStart(2, '0')}`
  });

  const onAudioLoadedData = () => {
    console.log('Loaded', audio.src);
    audio.currentTime = trackTime.value;
    audio.play();
  };

  const onAudioTimeUpdate = () => {
    trackTime.value = Math.floor(audio.currentTime);
  };

  audio.addEventListener('loadeddata', onAudioLoadedData);
  audio.addEventListener('timeupdate', onAudioTimeUpdate);

  const socket = io('ws://localhost:8080');
  socket.on('connect', () => {
    console.log('websocket connected!');
  });
  socket.on('trackStateChange', message => {
    const trackState: ITrackState = JSON.parse(message);

    // trackTime changed
    if (currentTrack.value && currentTrack.value.title === trackState.currentTrack!.title) {
      trackTime.value = trackState.trackTime;
      return;
    }

    currentTrack.value = trackState.currentTrack;
    nextTrack.value = trackState.nextTrack;
    trackTime.value = trackState.trackTime;
    
    audio.src = 'http://localhost:3000/' + currentTrack.value!.audioUrl;
    
  });

  onBeforeUnmount(() => {
    audio.removeEventListener('loadeddata', onAudioLoadedData);
    audio.removeEventListener('timeupdate', onAudioTimeUpdate);
  });

  return {
    currentTrack,
    nextTrack,
    trackTime,
    currentTrackTitle,
    trackTimeRelative,
    trackTimeCounter
  };
};
