<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ code: number; isDay: boolean }>();

type Icon = 'sun' | 'moon' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

const icon = computed((): Icon => {
  const c = props.code;
  if (c === 0)  return props.isDay ? 'sun' : 'moon';
  if (c <= 2)   return props.isDay ? 'partly-cloudy' : 'moon';
  if (c === 3)  return 'cloudy';
  if (c <= 48)  return 'fog';
  if (c <= 55)  return 'drizzle';
  if (c <= 65)  return 'rain';
  if (c <= 77)  return 'snow';
  if (c <= 82)  return 'rain';
  if (c <= 86)  return 'snow';
  return 'storm';
});
</script>

<template>
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
    <defs>
      <mask id="wx-moon-mask">
        <rect width="64" height="64" fill="white"/>
        <circle cx="42" cy="25" r="19" fill="black"/>
      </mask>
    </defs>

    <!-- SUN -->
    <template v-if="icon === 'sun'">
      <circle cx="32" cy="32" r="11" fill="#FBBF24"/>
      <g stroke="#FBBF24" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="5"  x2="32" y2="13"/>
        <line x1="32" y1="51" x2="32" y2="59"/>
        <line x1="5"  y1="32" x2="13" y2="32"/>
        <line x1="51" y1="32" x2="59" y2="32"/>
        <line x1="12.8" y1="12.8" x2="18.8" y2="18.8"/>
        <line x1="45.2" y1="45.2" x2="51.2" y2="51.2"/>
        <line x1="51.2" y1="12.8" x2="45.2" y2="18.8"/>
        <line x1="18.8" y1="45.2" x2="12.8" y2="51.2"/>
      </g>
    </template>

    <!-- MOON -->
    <template v-else-if="icon === 'moon'">
      <circle cx="30" cy="33" r="22" fill="#94A3B8" mask="url(#wx-moon-mask)"/>
    </template>

    <!-- PARTLY CLOUDY -->
    <template v-else-if="icon === 'partly-cloudy'">
      <!-- small sun top-left -->
      <circle cx="19" cy="21" r="9" fill="#FBBF24"/>
      <g stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round">
        <line x1="19" y1="6"  x2="19" y2="12"/>
        <line x1="4"  y1="21" x2="10" y2="21"/>
        <line x1="8.6"  y1="10.6" x2="12.9" y2="14.9"/>
        <line x1="29.4" y1="10.6" x2="25.1" y2="14.9"/>
      </g>
      <!-- cloud overlapping bottom-right -->
      <path d="M52 42 Q58 42 58 36 Q58 29 51 28 Q50 19 41 19 Q33 19 31 27 Q26 27 24 32 Q22 38 26 42 Z" fill="#94A3B8"/>
    </template>

    <!-- CLOUDY -->
    <template v-else-if="icon === 'cloudy'">
      <path d="M52 44 Q60 44 60 37 Q60 29 52 28 Q51 18 41 18 Q32 18 30 26 Q24 26 22 32 Q20 40 26 44 Z" fill="#94A3B8"/>
    </template>

    <!-- FOG -->
    <template v-else-if="icon === 'fog'">
      <g stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round">
        <line x1="10" y1="17" x2="54" y2="17"/>
        <line x1="14" y1="27" x2="50" y2="27"/>
        <line x1="10" y1="37" x2="54" y2="37"/>
        <line x1="14" y1="47" x2="50" y2="47"/>
      </g>
    </template>

    <!-- DRIZZLE -->
    <template v-else-if="icon === 'drizzle'">
      <path d="M48 34 Q55 34 55 28 Q55 21 47 20 Q46 12 37 12 Q29 12 27 20 Q22 20 20 25 Q18 31 22 34 Z" fill="#94A3B8"/>
      <g stroke="#93C5FD" stroke-width="2.5" stroke-linecap="round">
        <line x1="25" y1="43" x2="23" y2="51"/>
        <line x1="35" y1="43" x2="33" y2="51"/>
        <line x1="45" y1="43" x2="43" y2="51"/>
      </g>
    </template>

    <!-- RAIN -->
    <template v-else-if="icon === 'rain'">
      <path d="M48 32 Q55 32 55 26 Q55 19 47 18 Q46 10 37 10 Q29 10 27 18 Q22 18 20 23 Q18 29 22 32 Z" fill="#64748B"/>
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="21" y1="41" x2="18" y2="53"/>
        <line x1="31" y1="41" x2="28" y2="53"/>
        <line x1="41" y1="41" x2="38" y2="53"/>
        <line x1="51" y1="41" x2="48" y2="53"/>
      </g>
    </template>

    <!-- SNOW -->
    <template v-else-if="icon === 'snow'">
      <path d="M48 32 Q55 32 55 26 Q55 19 47 18 Q46 10 37 10 Q29 10 27 18 Q22 18 20 23 Q18 29 22 32 Z" fill="#94A3B8"/>
      <g fill="#BAE6FD">
        <circle cx="22" cy="45" r="3"/>
        <circle cx="33" cy="45" r="3"/>
        <circle cx="44" cy="45" r="3"/>
        <circle cx="27" cy="55" r="3"/>
        <circle cx="38" cy="55" r="3"/>
      </g>
    </template>

    <!-- STORM -->
    <template v-else-if="icon === 'storm'">
      <path d="M48 30 Q55 30 55 24 Q55 17 47 16 Q46 8 37 8 Q29 8 27 16 Q22 16 20 21 Q18 27 22 30 Z" fill="#475569"/>
      <path d="M34 34 L25 50 H33 L30 62 L46 46 H38 L43 34 Z" fill="#FDE047"/>
    </template>
  </svg>
</template>
