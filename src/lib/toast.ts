/* 轻量全局提示队列：替代 Naive UI 的 useMessage（React 版，模块级 store） */
import { useSyncExternalStore } from 'react'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastItem {
  id: number
  text: string
  type: ToastType
  leaving: boolean
}

let items: ToastItem[] = []
let seq = 0
const listeners = new Set<() => void>()

function emit(): void {
  items = [...items]
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): ToastItem[] {
  return items
}

export function dismissToast(id: number): void {
  const target = items.find((item) => item.id === id)
  if (!target || target.leaving) return
  /* 先标记 leaving 触发淡出动画，160ms 后再真正移除 */
  items = items.map((item) => (item.id === id ? { ...item, leaving: true } : item))
  emit()
  window.setTimeout(() => {
    items = items.filter((item) => item.id !== id)
    emit()
  }, 160)
}

export function toast(text: string, type: ToastType = 'info', duration = 2200): void {
  const id = ++seq
  items = [...items, { id, text, type, leaving: false }]
  emit()
  window.setTimeout(() => dismissToast(id), duration)
}

export function useToast(): { toasts: ToastItem[]; toast: typeof toast; dismissToast: typeof dismissToast } {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { toasts, toast, dismissToast }
}
