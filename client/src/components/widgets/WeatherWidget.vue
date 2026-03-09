<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IWeatherResponse } from '@/../../shared/models/IWeatherResponse';
import WeatherIcon from '@/components/widgets/WeatherIcon.vue';

const { getWeather } = useApi();
const weather = ref<IWeatherResponse | null>(null);

getWeather().then(v => weather.value = v).catch(console.error);
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-center gap-[5cqw] flex-1">
      <div class="w-[20cqmin] shrink-0">
        <WeatherIcon
          v-if="weather"
          :code="weather.weatherCode"
          :is-day="!!weather.isDay"
        />
      </div>
      <div class="flex flex-col gap-[2cqw]">
        <p class="text-[10cqmin] font-bold leading-none text-slate-800">
          {{ weather?.temperature ?? '—' }}°C
        </p>
        <p class="text-[8cqmin] text-slate-400 leading-none">
          {{ weather?.windspeed ?? '—' }} km/h
        </p>
      </div>
    </div>
  </div>
</template>
