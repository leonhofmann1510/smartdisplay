<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

// ─── Props & Grid State ───────────────────────────────────────────────────────

const props = defineProps<{
  gridFromRow: number;
  gridToRow: number;
  gridFromCol: number;
  gridToCol: number;
}>();

const gridFromRow = ref(props.gridFromRow);
const gridFromCol = ref(props.gridFromCol);
const gridToRow = ref(props.gridToRow);
const gridToCol = ref(props.gridToCol);

const cssStyles = computed(() => ({
  'grid-area': `${gridFromRow.value} / ${gridFromCol.value} / ${gridToRow.value + 1} / ${gridToCol.value + 1}`,
}));

// ─── Tile Dimensions ──────────────────────────────────────────────────────────

const widgetDiv = ref<HTMLDivElement | null>(null);
const width = ref(0);
const height = ref(0);
const tileWidth = ref(0);
const tileHeight = ref(0);
const colGap = ref(0);
const rowGap = ref(0);

const updateTileDimensions = () => {
  if (!widgetDiv.value?.parentElement) return;
  const style = window.getComputedStyle(widgetDiv.value.parentElement);
  colGap.value = parseFloat(style.columnGap) || 0;
  rowGap.value = parseFloat(style.rowGap) || 0;

  const colSpan = gridToCol.value - gridFromCol.value + 1;
  const rowSpan = gridToRow.value - gridFromRow.value + 1;
  tileWidth.value = (widgetDiv.value.offsetWidth - (colSpan - 1) * colGap.value) / colSpan;
  tileHeight.value = (widgetDiv.value.offsetHeight - (rowSpan - 1) * rowGap.value) / rowSpan;
};

onMounted(() => {
  if (widgetDiv.value) {
    width.value = widgetDiv.value.offsetWidth;
    height.value = widgetDiv.value.offsetHeight;
  }
  updateTileDimensions();
  window.addEventListener('resize', updateTileDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTileDimensions);
});

// ─── Dragging ─────────────────────────────────────────────────────────────────

let dragStartX = 0;
let dragStartY = 0;
let dragStartFromCol = 0;
let dragStartFromRow = 0;
let dragTargetFromCol = 0;
let dragTargetFromRow = 0;

const dragPreview = ref<{ left: string; top: string; width: string; height: string } | null>(null);

const startDrag = (event: MouseEvent) => {
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartFromCol = gridFromCol.value;
  dragStartFromRow = gridFromRow.value;
  dragTargetFromCol = gridFromCol.value;
  dragTargetFromRow = gridFromRow.value;

  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
  window.addEventListener('mouseleave', stopDrag);
};

const drag = (event: MouseEvent) => {
  const deltaCol = Math.round((event.clientX - dragStartX) / (tileWidth.value + colGap.value));
  const deltaRow = Math.round((event.clientY - dragStartY) / (tileHeight.value + rowGap.value));

  const colSpan = gridToCol.value - gridFromCol.value;
  const rowSpan = gridToRow.value - gridFromRow.value;

  dragTargetFromCol = Math.max(1, Math.min(8 - colSpan, dragStartFromCol + deltaCol));
  dragTargetFromRow = Math.max(1, Math.min(4 - rowSpan, dragStartFromRow + deltaRow));

  const gridContainer = widgetDiv.value?.parentElement;
  if (!gridContainer) return;

  const containerRect = gridContainer.getBoundingClientRect();
  const containerStyle = window.getComputedStyle(gridContainer);
  const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
  const paddingTop = parseFloat(containerStyle.paddingTop) || 0;

  dragPreview.value = {
    left: `${containerRect.left + paddingLeft + (dragTargetFromCol - 1) * (tileWidth.value + colGap.value)}px`,
    top: `${containerRect.top + paddingTop + (dragTargetFromRow - 1) * (tileHeight.value + rowGap.value)}px`,
    width: `${tileWidth.value * (colSpan + 1) + colSpan * colGap.value}px`,
    height: `${tileHeight.value * (rowSpan + 1) + rowSpan * rowGap.value}px`,
  };
};

const stopDrag = () => {
  document.body.style.userSelect = '';
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('mouseleave', stopDrag);

  const colSpan = gridToCol.value - gridFromCol.value;
  const rowSpan = gridToRow.value - gridFromRow.value;

  gridFromCol.value = dragTargetFromCol;
  gridToCol.value = dragTargetFromCol + colSpan;
  gridFromRow.value = dragTargetFromRow;
  gridToRow.value = dragTargetFromRow + rowSpan;

  dragPreview.value = null;
};

// ─── Resizing ─────────────────────────────────────────────────────────────────

let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;

const resizePreview = ref({ width: '0px', height: '0px' });

const startResize = (event: MouseEvent) => {
  resizeStartX = event.clientX;
  resizeStartY = event.clientY;
  resizeStartWidth = width.value;
  resizeStartHeight = height.value;

  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
  window.addEventListener('mouseleave', stopResize);
};

const resize = (event: MouseEvent) => {
  width.value = resizeStartWidth + (event.clientX - resizeStartX);
  height.value = resizeStartHeight + (event.clientY - resizeStartY);

  const newColSpan = Math.floor((width.value + colGap.value) / (tileWidth.value + colGap.value));
  const newRowSpan = Math.floor((height.value + rowGap.value) / (tileHeight.value + rowGap.value));

  if (newColSpan > 0 && newRowSpan > 0 && newColSpan <= 8 && newRowSpan <= 4) {
    resizePreview.value = {
      width: `${tileWidth.value * newColSpan + (newColSpan - 1) * colGap.value}px`,
      height: `${tileHeight.value * newRowSpan + (newRowSpan - 1) * rowGap.value}px`,
    };
  } else {
    resizePreview.value = { width: '0px', height: '0px' };
  }
};

const stopResize = () => {
  document.body.style.userSelect = '';
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
  window.removeEventListener('mouseleave', stopResize);

  const newColSpan = Math.floor((width.value + colGap.value) / (tileWidth.value + colGap.value));
  const newRowSpan = Math.floor((height.value + rowGap.value) / (tileHeight.value + rowGap.value));

  if (newColSpan > 0 && gridFromCol.value + newColSpan - 1 <= 8)
    gridToCol.value = gridFromCol.value + newColSpan - 1;

  if (newRowSpan > 0 && gridFromRow.value + newRowSpan - 1 <= 4)
    gridToRow.value = gridFromRow.value + newRowSpan - 1;

  const colSpan = gridToCol.value - gridFromCol.value + 1;
  const rowSpan = gridToRow.value - gridFromRow.value + 1;
  width.value = tileWidth.value * colSpan + (colSpan - 1) * colGap.value;
  height.value = tileHeight.value * rowSpan + (rowSpan - 1) * rowGap.value;

  resizePreview.value = { width: '0px', height: '0px' };
};
</script>

<template>
  <div ref="widgetDiv" :style="cssStyles" class="bg-white shadow-xl rounded-xl @container relative">

    <!-- Drag handle -->
    <div
      class="w-8 h-2 bg-gray-300 rounded-full absolute top-1.5 left-1/2 -translate-x-1/2 z-20 cursor-move"
      @mousedown.prevent="startDrag"
    />

    <!-- Resize handle -->
    <div
      id="resize"
      class="bg-red w-[10px] h-[10px] absolute right-0 bottom-0 z-20 hover:cursor-nw-resize"
      @mousedown="startResize"
    />

    <!-- Resize preview overlay -->
    <div :style="resizePreview" class="absolute opacity-20 rounded-xl z-50 bg-red-500 top-0 left-0" />

    <slot />

    <!-- Drag preview overlay (teleported to body to escape stacking context) -->
    <Teleport to="body">
      <div
        v-if="dragPreview"
        :style="{ ...dragPreview, position: 'fixed', zIndex: '50', borderRadius: '0.75rem', backgroundColor: 'var(--color-red-500)', opacity: '0.2', pointerEvents: 'none' }"
      />
    </Teleport>

  </div>
</template>
