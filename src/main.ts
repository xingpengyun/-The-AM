import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import './styles/tailwind.css'
import './styles/base.css'
import './styles/extra.css'

const app = createApp(App)

app.use(router)
app.use(MotionPlugin)
app.mount('#app')
