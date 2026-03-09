<script setup lang="ts">
import DatetimeWidget from '@/components/widgets/DatetimeWidget.vue';
import InfoWidget from '@/components/widgets/InfoWidget.vue';
import WeatherWidget from '@/components/widgets/WeatherWidget.vue';
import Widget from './components/widgets/Widget.vue';
import InsiprationWidget from './components/widgets/InsiprationWidget.vue';
</script>

<template>
  <div class="h-screen grid grid-rows-4 grid-cols-8 gap-4 p-4 bg-slate-100">

    <Widget
      :grid-from-row="2"
      :grid-from-col="3"
      :grid-to-row="3"
      :grid-to-col="6"
    ><DatetimeWidget /></Widget>

    <!-- <Widget
      :grid-from-row="4"
      :grid-from-col="7"
      :grid-to-row="4"
      :grid-to-col="8"
    ><InfoWidget /></Widget> -->
    
    <Widget
      :grid-from-row="1"
      :grid-from-col="3"
      :grid-to-row="1"
      :grid-to-col="6"
    ><WeatherWidget /></Widget>

    <Widget
      :grid-from-row="4"
      :grid-from-col="3"
      :grid-to-row="4"
      :grid-to-col="6"
    ><InsiprationWidget :cycle-length="30"/></Widget>
  </div>
</template>

<style scoped></style>
