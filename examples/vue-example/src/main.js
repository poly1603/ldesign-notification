import { createApp } from 'vue'
import { NotificationPlugin } from '@ldesign/notification/vue'
import '@ldesign/notification/styles'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 注册 Notification Plugin
app.use(NotificationPlugin, {
  config: {
    defaultPosition: 'top-right',
    defaultDuration: 3000
  }
})

app.mount('#app')

