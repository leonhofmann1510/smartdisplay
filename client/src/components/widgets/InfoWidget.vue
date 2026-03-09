<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';
import FitText from './FitText.vue';

const { getBasicInfo } = useApi();
const basicInfo: Ref<IBasicInfo | null> = ref(null);
getBasicInfo()
  .then(value => basicInfo.value = value).catch(e => console.log(e));
</script>

<template>
  <div class="h-full px-6 py-4">
    <FitText>Currently running {{ basicInfo?.title }} v{{ basicInfo?.version }}</FitText>
  </div>
</template>