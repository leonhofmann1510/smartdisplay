<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight, Clock, CloudSun, Image, Info, MessageSquareQuote, Music } from 'lucide-vue-next'
import type { IWidget } from '@/../../shared/models/IWidget'
import type { IPosition } from '@/../../shared/models/IPosition'
import Widget from '@/components/widgets/Widget.vue'
import QuickMenu from '@/components/QuickMenu.vue'
import { useApi } from '@/composables/useApi'

const { getWidgets, setWidgets } = useApi()
const loadedWidgets = ref<IWidget[]>([])
const sidebarOpen = ref(true)

const widgetTemplates = [
  { componentName: 'DatetimeWidget', label: 'Date & Time', icon: Clock },
  { componentName: 'WeatherWidget', label: 'Weather', icon: CloudSun },
  { componentName: 'QuoteWidget', label: 'Quote', icon: MessageSquareQuote },
  { componentName: 'ArtWidget', label: 'Art', icon: Image },
  { componentName: 'MusicWidget', label: 'Music', icon: Music },
  { componentName: 'InfoWidget', label: 'Info', icon: Info },
]

const getAllWidgets = async () => {
  loadedWidgets.value = await getWidgets()
}

const setWidget = async (id: string, position: IPosition) => {
  const widget = loadedWidgets.value.find(w => w.id === id)
  if (!widget) return
  widget.props.position = position
  await setWidgets(loadedWidgets.value)
}

const deleteWidget = async (id: string) => {
  loadedWidgets.value = loadedWidgets.value.filter(w => w.id !== id)
  await setWidgets(loadedWidgets.value)
}

const generateId = () => Date.now().toString()

// Drag from sidebar
const draggedTemplate = ref<typeof widgetTemplates[0] | null>(null)
const dropPreview = ref<{ left: string; top: string; width: string; height: string } | null>(null)
const gridRef = ref<HTMLDivElement | null>(null)

const onDragStart = (template: typeof widgetTemplates[0]) => {
  draggedTemplate.value = template
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (!draggedTemplate.value || !gridRef.value) return

  const rect = gridRef.value.getBoundingClientRect()
  const style = window.getComputedStyle(gridRef.value)
  const paddingLeft = parseFloat(style.paddingLeft)
  const paddingTop = parseFloat(style.paddingTop)
  const gap = parseFloat(style.gap) || 16

  const gridWidth = rect.width - paddingLeft * 2
  const gridHeight = rect.height - paddingTop * 2
  const tileWidth = (gridWidth - gap * 7) / 8
  const tileHeight = (gridHeight - gap * 3) / 4

  const x = e.clientX - rect.left - paddingLeft
  const y = e.clientY - rect.top - paddingTop

  const col = Math.max(1, Math.min(8, Math.floor(x / (tileWidth + gap)) + 1))
  const row = Math.max(1, Math.min(4, Math.floor(y / (tileHeight + gap)) + 1))

  dropPreview.value = {
    left: `${paddingLeft + (col - 1) * (tileWidth + gap)}px`,
    top: `${paddingTop + (row - 1) * (tileHeight + gap)}px`,
    width: `${tileWidth}px`,
    height: `${tileHeight}px`,
  }
}

const onDragLeave = () => {
  dropPreview.value = null
}

const onDrop = async (e: DragEvent) => {
  e.preventDefault()
  if (!draggedTemplate.value || !gridRef.value) return

  const rect = gridRef.value.getBoundingClientRect()
  const style = window.getComputedStyle(gridRef.value)
  const paddingLeft = parseFloat(style.paddingLeft)
  const paddingTop = parseFloat(style.paddingTop)
  const gap = parseFloat(style.gap) || 16

  const gridWidth = rect.width - paddingLeft * 2
  const gridHeight = rect.height - paddingTop * 2
  const tileWidth = (gridWidth - gap * 7) / 8
  const tileHeight = (gridHeight - gap * 3) / 4

  const x = e.clientX - rect.left - paddingLeft
  const y = e.clientY - rect.top - paddingTop

  const col = Math.max(1, Math.min(8, Math.floor(x / (tileWidth + gap)) + 1))
  const row = Math.max(1, Math.min(4, Math.floor(y / (tileHeight + gap)) + 1))

  const newWidget: IWidget = {
    componentName: draggedTemplate.value.componentName,
    id: generateId(),
    props: {
      position: {
        gridFromCol: col,
        gridToCol: col,
        gridFromRow: row,
        gridToRow: row,
      },
      specific: {},
    },
  }

  loadedWidgets.value.push(newWidget)
  await setWidgets(loadedWidgets.value)

  draggedTemplate.value = null
  dropPreview.value = null
}

const onDragEnd = () => {
  draggedTemplate.value = null
  dropPreview.value = null
}

onMounted(async () => {
  await getAllWidgets()
})
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-100 pt-34">
    <QuickMenu />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside
        :class="[
          'bg-white shadow-lg transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-12'
        ]"
      >
        <!-- Toggle button -->
        <button
          class="p-3 hover:bg-gray-100 flex items-center justify-center"
          @click="sidebarOpen = !sidebarOpen"
        >
          <ChevronLeft v-if="sidebarOpen" class="w-5 h-5" />
          <ChevronRight v-else class="w-5 h-5" />
        </button>

        <!-- Widget templates -->
        <div v-if="sidebarOpen" class="flex-1 overflow-y-auto p-3 space-y-2">
          <h2 class="text-sm font-semibold text-gray-600 mb-3">Widgets</h2>
          <div
            v-for="template in widgetTemplates"
            :key="template.componentName"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 transition"
            draggable="true"
            @dragstart="onDragStart(template)"
            @dragend="onDragEnd"
          >
            <component :is="template.icon" class="w-5 h-5 text-blue-500" />
            <span class="text-sm font-medium">{{ template.label }}</span>
          </div>
        </div>
      </aside>

      <!-- Widget Grid -->
      <main class="flex-1 p-4 overflow-hidden">
        <div
          ref="gridRef"
          class="h-full grid grid-rows-4 grid-cols-8 gap-4 p-4 bg-slate-200 rounded-xl relative"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <Widget
            v-for="({ componentName, props, id }) in loadedWidgets"
            :key="id"
            :id="id"
            :editable="true"
            v-bind="props.position"
            @set-widget="setWidget"
            @delete-widget="deleteWidget"
          >
            <component :is="componentName" v-bind="props.specific" />
          </Widget>

          <!-- Drop preview -->
          <div
            v-if="dropPreview"
            :style="dropPreview"
            class="absolute bg-red-500 opacity-20 rounded-xl pointer-events-none"
          />
        </div>
      </main>
    </div>
  </div>
</template>
