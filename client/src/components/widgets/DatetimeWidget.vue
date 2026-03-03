<script setup lang="ts">
import Widget from '@/components/widgets/Widget.vue';
</script>

<template>
  <Widget
    :grid-from-row="1"
    :grid-from-col="1"
    :grid-to-row="2"
    :grid-to-col="3"
  >
    Hello World
  </Widget>
</template>