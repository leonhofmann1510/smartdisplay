<script setup lang="ts">
import { Music, Settings, Calendar, ListTodo, CloudSun, Pencil } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const route = useRoute();

</script>

<template>
  <!-- Top bar wrapper -->
  <div class="w-full flex justify-center fixed top-0 left-0 z-50 p-2 bg-white/70 backdrop-blur">

    <!-- Menu container -->
    <div class="flex flex-wrap sm:flex-nowrap justify-center gap-2 w-full max-w-4xl">

      <!-- Settings -->
      <div
        class="flex-1 min-w-[70px] sm:min-w-0 max-w-[90px] sm:max-w-none bg-blue-400 rounded-2xl aspect-square hover:scale-[1.05] transition"
        :class="{ 'scale-[1.05]': route.name === 'settings' }"
      >
        <RouterLink class="flex items-center justify-center h-full flex-col gap-1 p-2" :to="{ name: 'settings' }">
          <Settings class="text-white w-4 h-4 sm:w-6 sm:h-6" />
          <h1 class="text-white text-[10px] sm:text-sm text-center">
            Settings
          </h1>
        </RouterLink>
      </div>

      <!-- Music -->
      <div
        class="flex-1 min-w-[70px] sm:min-w-0 max-w-[90px] sm:max-w-none bg-blue-400 rounded-2xl aspect-square hover:scale-[1.05] transition"
        :class="{ 'scale-[1.05]': route.name === 'music' }"
      >
        <RouterLink class="flex items-center justify-center h-full flex-col gap-1 p-2" :to="{ name: 'music' }">
          <Music class="text-white w-4 h-4 sm:w-6 sm:h-6" />
          <h1 class="text-white text-[10px] sm:text-sm text-center">
            Music
          </h1>
        </RouterLink>
      </div>

      <!-- Calendar -->
      <div
        class="flex-1 min-w-[70px] sm:min-w-0 max-w-[90px] sm:max-w-none bg-blue-400 rounded-2xl aspect-square hover:scale-[1.05] transition"
        :class="{ 'scale-[1.05]': route.name === 'calendar' }"
      >
        <RouterLink class="flex items-center justify-center h-full flex-col gap-1 p-2" :to="{ name: 'calendar' }">
          <Calendar class="text-white w-4 h-4 sm:w-6 sm:h-6" />
          <h1 class="text-white text-[10px] sm:text-sm text-center">
            Calendar
          </h1>
        </RouterLink>
      </div>

      <!-- To-Dos -->
      <div
        class="flex-1 min-w-[70px] sm:min-w-0 max-w-[90px] sm:max-w-none bg-blue-400 rounded-2xl aspect-square hover:scale-[1.05] transition"
        :class="{ 'scale-[1.05]': route.name === 'todos' }"
      >
        <RouterLink class="flex items-center justify-center h-full flex-col gap-1 p-2" :to="{ name: 'todos' }">
          <ListTodo class="text-white w-4 h-4 sm:w-6 sm:h-6" />
          <h1 class="text-white text-[10px] sm:text-sm text-center">
            To-Dos
          </h1>
        </RouterLink>
      </div>

      <!-- Weather -->
      <div
        class="flex-1 min-w-[70px] sm:min-w-0 max-w-[90px] sm:max-w-none bg-blue-400 rounded-2xl aspect-square hover:scale-[1.05] transition"
        :class="{ 'scale-[1.05]': route.name === 'weather' }"
      >
        <RouterLink class="flex items-center justify-center h-full flex-col gap-1 p-2" :to="{ name: 'weather' }">
          <CloudSun class="text-white w-4 h-4 sm:w-6 sm:h-6" />
          <h1 class="text-white text-[10px] sm:text-sm text-center">
            Weather
          </h1>
        </RouterLink>
      </div>

      <!-- Draw -->
      <div
        class="flex-1 min-w-[70px] sm:min-w-0 max-w-[90px] sm:max-w-none bg-blue-400 rounded-2xl aspect-square hover:scale-[1.05] transition"
        :class="{ 'scale-[1.05]': route.name === 'draw' }"
      >
        <RouterLink class="flex items-center justify-center h-full flex-col gap-1 p-2" :to="{ name: 'draw' }">
          <Pencil class="text-white w-4 h-4 sm:w-6 sm:h-6" />
          <h1 class="text-white text-[10px] sm:text-sm text-center">
            Draw
          </h1>
        </RouterLink>
      </div>

    </div>
  </div>
</template>