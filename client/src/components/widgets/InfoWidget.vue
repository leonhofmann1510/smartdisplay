<script setup lang="ts">
import type { Ref } from 'vue';
import { ref, onMounted } from 'vue';
import Widget from '@/components/widgets/Widget.vue';

let response: Ref<{ title: string, version: string } | null> = ref(null);

onMounted(async () => {
  const request = await fetch(`${import.meta.env.VITE_APIURL}/api/widget/basicInfo`);
  const json = await request.json();
  console.log(json);
  response.value = json.data;
});
</script>

<template>
  <Widget
    :grid-from-row="1"
    :grid-from-col="3"
    :grid-to-row="2"
    :grid-to-col="4"
  >
    <div v-if="response">
      {{ response.title }} | {{ response.version }}
    </div>
  </Widget>
</template>
