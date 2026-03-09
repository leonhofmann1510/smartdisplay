<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IWeatherResponse } from '@/../../shared/models/IWeatherResponse';
import WeatherIcon from '@/components/WeatherIcon.vue';
import FitText from '../FitText.vue';

const { getWeather } = useApi();
const weather = ref<IWeatherResponse | null>(null);

getWeather().then(v => weather.value = v).catch(console.error);
</script>

<template>
  <div class="flex items-center h-full gap-2">
    <div class="w-[40%] aspect-square">
      <WeatherIcon
        v-if="weather"
        :code="weather.weatherCode"
        :is-day="!!weather.isDay"
      />
    </div>
    <div class="w-[60%] flex flex-col h-full">
      <div class="h-full">
        <FitText class="font-bold text-slate-800">{{ weather?.temperature ?? '—' }}°C</FitText>
      </div>
      <div class="h-full">
        <FitText class="text-slate-400">{{ weather?.windspeed ?? '—' }} km/h</FitText>
      </div>
    </div>
  </div>
</template>
