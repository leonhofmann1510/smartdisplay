<script setup lang="ts">
import DatetimeWidget from '@/components/widgets/DatetimeWidget.vue';
import InfoWidget from '@/components/widgets/InfoWidget.vue';
import WeatherWidget from '@/components/widgets/WeatherWidget.vue';
</script>

<template>
  <div class="h-screen grid grid-rows-4 grid-cols-8 gap-4 p-4 bg-slate-100">
    <DatetimeWidget />
    <InfoWidget />
    <WeatherWidget />
  </div>
</template>

<style scoped></style>
