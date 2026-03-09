<script setup lang="ts">
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
  <div class="h-full w-full flex justify-center items-center">
    <p class="text-center text-[8cqw]">Currently running {{ basicInfo?.title }} v{{ basicInfo?.version }}</p>
  </div>
</template>
1