<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
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
          <h1 class="text-xl font-semibold text-gray-800">Music</h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-4">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-gray-600">Music page - Coming soon</p>
      </div>
    </div>
  </div>
</template>
