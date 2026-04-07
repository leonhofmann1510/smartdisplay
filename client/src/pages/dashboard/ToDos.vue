<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, Send, Pencil, Trash2, Check, X } from 'lucide-vue-next';
import { io, Socket } from 'socket.io-client';
import { useApi } from '@/composables/useApi';
import type { ITodo } from '@/../../shared/models/ITodo';

const APIURL = import.meta.env.VITE_APIURL as string;
const SOCKET_URL = APIURL.replace(/\/api$/, '');

const { getTodos, addTodo, updateTodo, deleteTodo } = useApi();

const todos = ref<ITodo[]>([]);
const newTodoText = ref('');
const editingId = ref<string | null>(null);
const editingText = ref('');
const isLoading = ref(false);
let socket: Socket | null = null;

const loadTodos = async () => {
  todos.value = await getTodos();
};

const handleAdd = async () => {
  if (!newTodoText.value.trim() || isLoading.value) return;
  isLoading.value = true;
  try {
    await addTodo(newTodoText.value.trim());
    newTodoText.value = '';
  } finally {
    isLoading.value = false;
  }
};

const startEdit = (todo: ITodo) => {
  editingId.value = todo.id;
  editingText.value = todo.text;
};

const cancelEdit = () => {
  editingId.value = null;
  editingText.value = '';
};

const handleUpdate = async () => {
  if (!editingId.value || !editingText.value.trim() || isLoading.value) return;
  isLoading.value = true;
  try {
    await updateTodo(editingId.value, editingText.value.trim());
    cancelEdit();
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await deleteTodo(id);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadTodos();
  socket = io(SOCKET_URL);
  socket.on('todosChange', (newTodos: ITodo[]) => {
    todos.value = newTodos;
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
        <div class="flex items-center gap-4 mb-4">
          <RouterLink 
            :to="{ name: 'dashboard' }" 
            class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </RouterLink>
          <h1 class="text-xl font-semibold text-gray-800">To-Do List</h1>
        </div>
        
        <!-- Add Todo Form -->
        <form @submit.prevent="handleAdd" class="flex gap-2">
          <input
            v-model="newTodoText"
            type="text"
            placeholder="Add a new todo..."
            class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
            :disabled="!newTodoText.trim() || isLoading"
          >
            <Send class="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>

    <!-- Todo List -->
    <div class="max-w-2xl mx-auto px-4 py-4">
      <div v-if="todos.length === 0" class="text-center py-12 text-gray-400">
        No todos yet. Add one above!
      </div>
      
      <ul v-else class="space-y-2">
        <li 
          v-for="todo in todos" 
          :key="todo.id"
          class="bg-white rounded-xl p-4 shadow-sm"
        >
          <!-- Edit Mode -->
          <div v-if="editingId === todo.id" class="flex gap-2">
            <input
              v-model="editingText"
              type="text"
              class="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              @keyup.enter="handleUpdate"
              @keyup.escape="cancelEdit"
            />
            <button
              @click="handleUpdate"
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
          
          <!-- View Mode -->
          <div v-else class="flex items-center gap-3">
            <span class="flex-1 text-gray-700">{{ todo.text }}</span>
            <button
              @click="startEdit(todo)"
              class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="handleDelete(todo.id)"
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
</template>
