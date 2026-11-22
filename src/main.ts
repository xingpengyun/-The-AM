import { createApp, type Component } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import {
  NAlert,
  NAvatar,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCheckbox,
  NConfigProvider,
  NDropdown,
  NForm,
  NFormItem,
  NInput,
  NMessageProvider,
  NModal,
  NTooltip
} from 'naive-ui'
import App from './App.vue'
import router from './router'
import './styles/base.css'
import './styles/extra.css'

const app = createApp(App)

/* 保留原型张的 Naive UI 用法：按组件名全局注册 */
const naiveComponents: Record<string, Component> = {
  NConfigProvider,
  NMessageProvider,
  NInput,
  NButton,
  NForm,
  NFormItem,
  NCheckbox,
  NAlert,
  NAvatar,
  NBreadcrumb,
  NBreadcrumbItem,
  NDropdown,
  NModal,
  NTooltip
}

Object.entries(naiveComponents).forEach(([name, component]) => {
  app.component(name, component)
})

app.use(router)
app.use(MotionPlugin)
app.mount('#app')
