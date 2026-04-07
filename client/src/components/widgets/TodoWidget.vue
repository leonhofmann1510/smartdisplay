<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { io, Socket } from 'socket.io-client';
import type { ITodo } from '@/../../shared/models/ITodo';
import type { IApiResponse } from '@/../../shared/models/IApiResponse';

const APIURL = import.meta.env.VITE_APIURL as string;
const SOCKET_URL = APIURL.replace(/\/api$/, '');

const todos = ref<ITodo[]>([]);
let socket: Socket | null = null;

const loadTodos = async () => {
  try {
    const response = await fetch(`${APIURL}/todo/list`);
    const data: IApiResponse<ITodo[]> = await response.json();
    todos.value = (data.data ?? []).slice(0, 5);
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
};

onMounted(() => {
  loadTodos();
  socket = io(SOCKET_URL);
  socket.on('todosChange', (newTodos: ITodo[]) => {
    todos.value = newTodos.slice(0, 5);
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
      <h3 class="font-semibold text-gray-700">To-Do</h3>
    </div>
    
    <div v-if="todos.length === 0" class="flex-1 flex items-center justify-center text-gray-400 text-sm">
      No todos yet
    </div>
    
    <ul v-else class="flex-1 overflow-hidden space-y-2">
      <li 
        v-for="todo in todos" 
        :key="todo.id"
        class="text-sm text-gray-600 truncate py-1 border-b border-gray-100 last:border-0"
      >
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>
