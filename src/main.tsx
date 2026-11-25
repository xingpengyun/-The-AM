import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './router'
import './styles/tailwind.css'
import './styles/base.css'
import './styles/extra.css'

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)
