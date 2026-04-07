<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { io, Socket } from 'socket.io-client';
import type { ICalendarEvent } from '@/../../shared/models/ICalendarEvent';
import type { IApiResponse } from '@/../../shared/models/IApiResponse';

const APIURL = import.meta.env.VITE_APIURL as string;
const SOCKET_URL = APIURL.replace(/\/api$/, '');

const events = ref<ICalendarEvent[]>([]);
let socket: Socket | null = null;

const loadThisWeekEvents = async () => {
  try {
    const response = await fetch(`${APIURL}/calendar/thisweek`);
    const data: IApiResponse<ICalendarEvent[]> = await response.json();
    events.value = data.data ?? [];
  } catch (error) {
    console.error('Failed to load events:', error);
  }
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

onMounted(() => {
  loadThisWeekEvents();
  socket = io(SOCKET_URL);
  socket.on('calendarChange', () => {
    loadThisWeekEvents();
  });
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});
</script>

<template>
  <div class="flex h-full flex-col p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-gray-700">This Week</h3>
    </div>
    
    <div v-if="events.length === 0" class="flex-1 flex items-center justify-center text-gray-400 text-sm">
      No events this week
    </div>
    
    <ul v-else class="flex-1 overflow-hidden space-y-2">
      <li 
        v-for="event in events" 
        :key="event.id"
        class="flex items-center gap-2 text-sm py-1 border-b border-gray-100 last:border-0"
      >
        <span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded whitespace-nowrap">
          {{ formatDate(event.date) }}
        </span>
        <span class="text-gray-600 truncate">{{ event.name }}</span>
      </li>
    </ul>
  </div>
</template>
