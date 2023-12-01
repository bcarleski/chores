import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3GoogleLogin from 'vue3-google-login'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(Vue3GoogleLogin, { clientId: '577830859602-6mae1vrb7k170adij2174a8jogo94t3h.apps.googleusercontent.com' })

app.mount('#app')
