import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import {
  NAvatar,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NConfigProvider,
  NDataTable,
  NDatePicker,
  NDrawer,
  NDrawerContent,
  NDropdown,
  NInput,
  NMessageProvider,
  NSelect,
  NTag,
  NTooltip
} from 'naive-ui'
import App from './App.vue'
import router from './router'
import './styles/base.css'
import './styles/extra.css'

const app = createApp(App)

/* 保留原型张的 Naive UI 用法：按组件名全局注册 */
const naiveComponents = {
  NConfigProvider,
  NMessageProvider,
  NInput,
  NButton,
  NSelect,
  NDatePicker,
  NDataTable,
  NTag,
  NAvatar,
  NDropdown,
  NBreadcrumb,
  NBreadcrumbItem,
  NTooltip,
  NDrawer,
  NDrawerContent
}

Object.entries(naiveComponents).forEach(([name, component]) => {
  app.component(name, component)
})

app.use(router)
app.use(MotionPlugin)
app.mount('#app')
