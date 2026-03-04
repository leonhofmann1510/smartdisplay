<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IWeatherResponse } from '@/../../shared/models/IWeatherResponse';
import Widget from '@/components/widgets/Widget.vue';
import WeatherIcon from '@/components/widgets/WeatherIcon.vue';

const { getWeather } = useApi();
const weather = ref<IWeatherResponse | null>(null);

getWeather().then(v => weather.value = v).catch(console.error);
</script>

<template>
  <Widget
    :grid-from-row="2"
    :grid-from-col="3"
    :grid-to-row="3"
    :grid-to-col="6"
  >
    <div class="flex flex-col h-full">
      <div class="flex items-center gap-[5cqw] flex-1">
        <div class="w-[38cqw] h-[38cqw] shrink-0">
          <WeatherIcon
            v-if="weather"
            :code="weather.weatherCode"
            :is-day="!!weather.isDay"
          />
        </div>
        <div class="flex flex-col gap-[2cqw]">
          <p class="text-[18cqw] font-bold leading-none text-slate-800">
            {{ weather?.temperature ?? '—' }}°C
          </p>
          <p class="text-[7cqw] text-slate-400 leading-none">
            {{ weather?.windspeed ?? '—' }} km/h
          </p>
        </div>
      </div>
    </div>
  </Widget>
</template>
