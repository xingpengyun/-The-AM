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
  const next: Theme = current === 'dark' ? 'light' : 'dark'

  /* 不支持 View Transitions 或用户偏好减少动效时，直接切换 */
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => {
      finished: Promise<void>
    }
  }
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTheme(next)
    return
  }

  /* 动效原点取主题按钮中心，旧画面向该点收拢 */
  const rect = document.querySelector<HTMLElement>('.theme-toggle')?.getBoundingClientRect()
  const root = document.documentElement
  root.style.setProperty('--theme-origin-x', `${rect ? rect.left + rect.width / 2 : window.innerWidth - 48}px`)
  root.style.setProperty('--theme-origin-y', `${rect ? rect.top + rect.height / 2 : 36}px`)
  root.classList.add('theme-switching')

  try {
    const transition = doc.startViewTransition(() => setTheme(next))
    void transition.finished
      .catch(() => {})
      .finally(() => root.classList.remove('theme-switching'))
  } catch {
    root.classList.remove('theme-switching')
    setTheme(next)
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light')
}
