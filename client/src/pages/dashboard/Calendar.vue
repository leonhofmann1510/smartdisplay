<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Check, X } from 'lucide-vue-next';
import { io, Socket } from 'socket.io-client';
import { useApi } from '@/composables/useApi';
import type { ICalendarEvent } from '@/../../shared/models/ICalendarEvent';

const APIURL = import.meta.env.VITE_APIURL as string;
const SOCKET_URL = APIURL.replace(/\/api$/, '');

const { getCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useApi();

const events = ref<ICalendarEvent[]>([]);
const currentDate = ref(new Date());
const showAddForm = ref(false);
const newEventName = ref('');
const newEventDate = ref('');
const newEventEndDate = ref('');
const editingId = ref<string | null>(null);
const editingName = ref('');
const editingDate = ref('');
const editingEndDate = ref('');
const isLoading = ref(false);
let socket: Socket | null = null;

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthName = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const daysInMonth = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  
  const days: { date: Date; isCurrentMonth: boolean; events: ICalendarEvent[] }[] = [];
  
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false, events: [] });
  }
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateForCompare(date);
    const dayEvents = events.value.filter(e => {
      const end = e.endDate ?? e.date;
      return dateStr >= e.date && dateStr <= end;
    });
    days.push({ date, isCurrentMonth: true, events: dayEvents });
  }
  
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false, events: [] });
  }
  
  return days;
});

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const formatDateForCompare = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatDateRange = (event: ICalendarEvent): string => {
  if (!event.endDate || event.endDate === event.date) return formatDisplayDate(event.date);
  return `${formatDisplayDate(event.date)} – ${formatDisplayDate(event.endDate)}`;
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

const loadEvents = async () => {
  events.value = await getCalendarEvents();
};

const handleAddEvent = async () => {
  if (!newEventName.value.trim() || !newEventDate.value || isLoading.value) return;
  if (newEventEndDate.value && newEventEndDate.value < newEventDate.value) return;
  isLoading.value = true;
  try {
    await addCalendarEvent(newEventName.value.trim(), newEventDate.value, newEventEndDate.value || undefined);
    newEventName.value = '';
    newEventDate.value = '';
    newEventEndDate.value = '';
    showAddForm.value = false;
  } finally {
    isLoading.value = false;
  }
};

const startEdit = (event: ICalendarEvent) => {
  editingId.value = event.id;
  editingName.value = event.name;
  editingDate.value = event.date;
  editingEndDate.value = event.endDate ?? '';
};

const cancelEdit = () => {
  editingId.value = null;
  editingName.value = '';
  editingDate.value = '';
  editingEndDate.value = '';
};

const handleUpdateEvent = async () => {
  if (!editingId.value || !editingName.value.trim() || !editingDate.value || isLoading.value) return;
  isLoading.value = true;
  try {
    await updateCalendarEvent(editingId.value, editingName.value.trim(), editingDate.value, editingEndDate.value || undefined);
    cancelEdit();
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteEvent = async (id: string) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await deleteCalendarEvent(id);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadEvents();
  socket = io(SOCKET_URL);
  socket.on('calendarChange', (newEvents: ICalendarEvent[]) => {
    events.value = newEvents;
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
  <div class="min-h-screen bg-slate-100">
    <!-- Header -->
    <div class="sticky top-0 bg-white shadow-sm z-10">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4">
          <RouterLink 
            :to="{ name: 'dashboard' }" 
            class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </RouterLink>
          <h1 class="text-xl font-semibold text-gray-800">Calendar</h1>
          <button
            @click="showAddForm = !showAddForm"
            class="ml-auto p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-4">
      <!-- Add Event Form -->
      <div v-if="showAddForm" class="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h3 class="font-medium text-gray-700 mb-3">Add Event</h3>
        <form @submit.prevent="handleAddEvent" class="space-y-3">
          <input
            v-model="newEventName"
            type="text"
            placeholder="Event name"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="text-xs text-gray-500 mb-1 block">Start date</label>
              <input
                v-model="newEventDate"
                type="date"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div class="flex-1">
              <label class="text-xs text-gray-500 mb-1 block">End date (optional)</label>
              <input
                v-model="newEventEndDate"
                type="date"
                :min="newEventDate"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              class="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
              :disabled="!newEventName.trim() || !newEventDate || isLoading"
            >
              Add Event
            </button>
            <button
              type="button"
              @click="showAddForm = false"
              class="px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Calendar Grid -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <!-- Month Navigation -->
        <div class="flex items-center justify-between p-4 border-b">
          <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronLeft class="w-5 h-5 text-gray-600" />
          </button>
          <span class="font-medium text-gray-800">{{ monthName }}</span>
          <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronRight class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <!-- Day Headers -->
        <div class="grid grid-cols-7 border-b">
          <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day" 
               class="py-2 text-center text-xs font-medium text-gray-500">
            {{ day }}
          </div>
        </div>
        
        <!-- Calendar Days -->
        <div class="grid grid-cols-7">
          <div 
            v-for="(day, index) in daysInMonth" 
            :key="index"
            :class="[
              'min-h-[60px] sm:min-h-[80px] p-1 border-b border-r text-center relative',
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
              isToday(day.date) ? 'bg-blue-50' : ''
            ]"
          >
            <span :class="[
              'text-sm',
              day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400',
              isToday(day.date) ? 'font-bold text-blue-600' : ''
            ]">
              {{ day.date.getDate() }}
            </span>
            <div v-if="day.events.length > 0" class="mt-1">
              <div 
                v-for="event in day.events.slice(0, 2)" 
                :key="event.id"
                class="text-xs bg-blue-100 text-blue-700 rounded px-1 py-0.5 truncate mb-0.5"
              >
                {{ event.name }}
              </div>
              <div v-if="day.events.length > 2" class="text-xs text-gray-400">
                +{{ day.events.length - 2 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Events List -->
      <div class="bg-white rounded-xl shadow-sm">
        <h3 class="font-medium text-gray-700 p-4 border-b">All Events</h3>
        
        <div v-if="sortedEvents.length === 0" class="p-4 text-center text-gray-400">
          No events scheduled
        </div>
        
        <ul v-else>
          <li 
            v-for="event in sortedEvents" 
            :key="event.id"
            class="p-4 border-b last:border-0"
          >
            <!-- Edit Mode -->
            <div v-if="editingId === event.id" class="space-y-2">
              <input
                v-model="editingName"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div class="flex gap-2">
                <input
                  v-model="editingDate"
                  type="date"
                  class="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  v-model="editingEndDate"
                  type="date"
                  :min="editingDate"
                  placeholder="End date"
                  class="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="handleUpdateEvent"
                  class="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                  :disabled="isLoading"
                >
                  <Check class="w-5 h-5" />
                </button>
                <button
                  @click="cancelEdit"
                  class="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <!-- View Mode -->
            <div v-else class="flex items-center gap-3">
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded whitespace-nowrap">
                {{ formatDateRange(event) }}
              </span>
              <span class="flex-1 text-gray-700">{{ event.name }}</span>
              <button
                @click="startEdit(event)"
                class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
              >
                <Pencil class="w-4 h-4" />
              </button>
              <button
                @click="handleDeleteEvent(event.id)"
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                :disabled="isLoading"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
