import { reactive } from 'vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastItem {
  id: number
  text: string
  type: ToastType
}

/* 轻量全局提示队列：替代 Naive UI 的 useMessage */
const state = reactive<{ items: ToastItem[] }>({ items: [] })
let seq = 0

export function dismissToast(id: number): void {
  const index = state.items.findIndex((item) => item.id === id)
  if (index >= 0) state.items.splice(index, 1)
}

export function toast(text: string, type: ToastType = 'info', duration = 2200): void {
  const id = ++seq
  state.items.push({ id, text, type })
  window.setTimeout(() => dismissToast(id), duration)
}

export function useToast() {
  return { toasts: state.items, toast, dismissToast }
}
