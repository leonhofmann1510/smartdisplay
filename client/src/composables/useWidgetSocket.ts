import { ref, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { IWidget } from '@/../../shared/models/IWidget'

const APIURL = import.meta.env.VITE_APIURL as string
// Extract base URL (remove /api suffix if present)
const SOCKET_URL = APIURL.replace(/\/api$/, '')

let socket: Socket | null = null
let refCount = 0

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL)
    socket.on('connect', () => {
      console.log('Widget socket connected')
    })
    socket.on('disconnect', () => {
      console.log('Widget socket disconnected')
    })
  }
  return socket
}

export const useWidgetSocket = (onWidgetsChange: (widgets: IWidget[]) => void) => {
  const connected = ref(false)
  const sock = getSocket()
  refCount++

  const handleWidgetsChange = (widgets: IWidget[]) => {
    onWidgetsChange(widgets)
  }

  sock.on('widgetsChange', handleWidgetsChange)
  sock.on('connect', () => { connected.value = true })
  sock.on('disconnect', () => { connected.value = false })

  connected.value = sock.connected

  onUnmounted(() => {
    sock.off('widgetsChange', handleWidgetsChange)
    refCount--
    if (refCount === 0 && socket) {
      socket.disconnect()
      socket = null
    }
  })

  return { connected }
}
