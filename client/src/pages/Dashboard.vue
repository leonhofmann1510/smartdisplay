<script setup lang="ts">
import { Music, Settings, Calendar, ListTodo, CloudSun, Pencil } from 'lucide-vue-next';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';

const { getBasicInfo } = useApi();
const basicInfo: Ref<IBasicInfo | null> = ref(null);
getBasicInfo()
  .then(value => basicInfo.value = value).catch(e => console.log(e));
</script>

<template>
  <div class="flex items-center justify-center w-full min-h-screen flex-col px-4">
    
    <!-- Header -->
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold">
      Dashboard
    </h1>
    <p class="mb-10 sm:mb-16 text-sm sm:text-base text-gray-600">
      Smart Display {{ basicInfo?.version }}
    </p>

    <!-- Grid container -->
    <div class="w-full md:w-3/4 lg:w-1/2">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">

        <!-- Settings -->
        <div class="bg-blue-300 rounded-2xl aspect-square sm:aspect-[4/3] hover:scale-[1.02] transition">
          <RouterLink class="flex items-center justify-center h-full flex-col gap-2 p-3" :to="{ name: 'draw' }">
            <Settings class="text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            <h1 class="text-white text-lg sm:text-xl lg:text-2xl text-center">
              Settings
            </h1>
          </RouterLink>
        </div>

        <!-- Music -->
        <div class="bg-blue-300 rounded-2xl aspect-square sm:aspect-[4/3] hover:scale-[1.02] transition">
          <RouterLink class="flex items-center justify-center h-full flex-col gap-2 p-3" :to="{ name: 'draw' }">
            <Music class="text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            <h1 class="text-white text-lg sm:text-xl lg:text-2xl text-center">
              Music
            </h1>
          </RouterLink>
        </div>

        <!-- Calendar -->
        <div class="bg-blue-300 rounded-2xl aspect-square sm:aspect-[4/3] hover:scale-[1.02] transition">
          <RouterLink class="flex items-center justify-center h-full flex-col gap-2 p-3" :to="{ name: 'draw' }">
            <Calendar class="text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            <h1 class="text-white text-lg sm:text-xl lg:text-2xl text-center">
              Calendar
            </h1>
          </RouterLink>
        </div>

        <!-- To-Dos -->
        <div class="bg-blue-300 rounded-2xl aspect-square sm:aspect-[4/3] hover:scale-[1.02] transition">
          <RouterLink class="flex items-center justify-center h-full flex-col gap-2 p-3" :to="{ name: 'draw' }">
            <ListTodo class="text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            <h1 class="text-white text-lg sm:text-xl lg:text-2xl text-center">
              To-Dos
            </h1>
          </RouterLink>
        </div>

        <!-- Weather -->
        <div class="bg-blue-300 rounded-2xl aspect-square sm:aspect-[4/3] hover:scale-[1.02] transition">
          <RouterLink class="flex items-center justify-center h-full flex-col gap-2 p-3" :to="{ name: 'draw' }">
            <CloudSun class="text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            <h1 class="text-white text-lg sm:text-xl lg:text-2xl text-center">
              Weather
            </h1>
          </RouterLink>
        </div>

        <!-- Draw -->
        <div class="bg-blue-300 rounded-2xl aspect-square sm:aspect-[4/3] hover:scale-[1.02] transition">
          <RouterLink class="flex items-center justify-center h-full flex-col gap-2 p-3" :to="{ name: 'draw' }">
            <Pencil class="text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            <h1 class="text-white text-lg sm:text-xl lg:text-2xl text-center">
              Draw
            </h1>
          </RouterLink>
        </div>

      </div>
    </div>

  </div>
</template>