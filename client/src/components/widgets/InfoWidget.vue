<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';
import Widget from '@/components/widgets/Widget.vue';

const { getBasicInfo } = useApi();
const basicInfo: Ref<IBasicInfo | null> = ref(null);
getBasicInfo()
  .then(value => basicInfo.value = value).catch(e => console.log(e));
</script>

<template>
  <Widget
    :grid-from-row="1"
    :grid-from-col="3"
    :grid-to-row="2"
    :grid-to-col="4"
  >
    {{ basicInfo?.title }} | {{ basicInfo?.version }}
  </Widget>
</template>
1