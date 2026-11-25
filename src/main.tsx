import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './router'
import './styles/tailwind.css'
import './styles/base.css'
import './styles/extra.css'

/*
 * three r187 将 THREE.Clock 标记为弃用，但当前最新的 @react-three/fiber 9.8.2
 * 仍在内部创建 new THREE.Clock()，属于上游已知提示，不影响功能。
 * 这里只过滤这一条精确匹配的提示，其余警告照常输出。
 */
const originalWarn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
    return
  }
  originalWarn(...args)
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)
