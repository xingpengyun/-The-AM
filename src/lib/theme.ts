import { useSyncExternalStore } from 'react'

/*
 * 深浅主题：切换根节点的 data-theme 与 .dark 类，
 * 两套令牌都定义在 CSS 里，组件不需要感知具体色值。
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bonbon.theme.v1'

const listeners = new Set<() => void>()
let current: Theme = 'light'
let initialized = false

function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

function apply(next: Theme): void {
  current = next
  const root = document.documentElement
  root.dataset.theme = next
  root.classList.toggle('dark', next === 'dark')
  root.style.colorScheme = next
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function initTheme(): void {
  if (initialized) return
  initialized = true
  apply(readSaved() ?? 'light')
  /* 多标签页同步 */
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    const next = event.newValue === 'dark' ? 'dark' : 'light'
    if (next === current) return
    apply(next)
    emit()
  })
}

export function getTheme(): Theme {
  return current
}

export function setTheme(next: Theme): void {
  if (next === current) return
  apply(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* 隐私模式下忽略写入失败 */
  }
  emit()
}

export function toggleTheme(): void {
  setTheme(current === 'dark' ? 'light' : 'dark')
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light')
}
