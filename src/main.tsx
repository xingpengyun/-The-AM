import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initTheme } from './lib/theme'
import AppRoutes from './router'
import './styles/tailwind.css'
import './styles/base.css'
import './styles/extra.css'

/* 首帧渲染前落主题，避免刷新时先亮后暗 */
initTheme()

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)
