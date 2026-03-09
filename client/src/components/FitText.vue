<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  multiline?: boolean
  minSize?: number
  maxSize?: number
}>(), {
  multiline: false,
  minSize: 8,
  maxSize: 400,
})

defineOptions({ inheritAttrs: false })

const wrapperRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const fontSize = ref(16)

const fit = () => {
  const wrapper = wrapperRef.value
  const text = textRef.value
  if (!wrapper || !text) return

  // Measure from parent directly — avoids h-full resolution failures on
  // flex items where height:100% resolves to auto (content height).
  const parent = wrapper.parentElement
  if (!parent) return

  const cs = getComputedStyle(parent)
  const aw = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
  const ah = parent.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
  if (!aw || !ah) return

  // Explicitly pin wrapper dimensions so overflow:hidden actually clips.
  wrapper.style.width = aw + 'px'
  wrapper.style.height = ah + 'px'

  let lo = props.minSize
  let hi = props.maxSize

  if (props.multiline) {
    text.style.width = aw + 'px'
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1
      text.style.fontSize = mid + 'px'
      if (text.offsetHeight > ah) hi = mid
      else lo = mid
    }
  } else {
    text.style.width = 'auto'
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1
      text.style.fontSize = mid + 'px'
      if (text.offsetWidth > aw || text.offsetHeight > ah) hi = mid
      else lo = mid
    }
  }

  fontSize.value = lo
  text.style.fontSize = lo + 'px'
}

let ro: ResizeObserver | null = null
let mo: MutationObserver | null = null

onMounted(() => {
  const parent = wrapperRef.value?.parentElement
  if (parent) {
    ro = new ResizeObserver(fit)
    ro.observe(parent)
  }
  if (textRef.value) {
    mo = new MutationObserver(fit)
    mo.observe(textRef.value, { childList: true, subtree: true, characterData: true })
  }
  fit()
})

onUnmounted(() => {
  ro?.disconnect()
  mo?.disconnect()
})
</script>

<template>
  <div ref="wrapperRef" class="overflow-hidden flex items-center justify-center">
    <span
      ref="textRef"
      v-bind="$attrs"
      :style="{ fontSize: `${fontSize}px` }"
      class="block text-center leading-tight"
      :class="{ 'whitespace-nowrap': !multiline }"
    >
      <slot />
    </span>
  </div>
</template>
