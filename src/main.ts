import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import router from './router'
import store from './store'
import { useGlobalStore } from './store/global'

import App from './App.vue'
import 'easymde/dist/easymde.min.css'

const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(store)
app.use(pinia)
const globalStore = useGlobalStore()
axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? '/' : 'http://api.vikingship.xyz/api/'
axios.interceptors.request.use(config => {
  // store.commit('setLoading', true)
  // store.commit('setError', { status: false, message: '' })
  globalStore.setLoading(true)
  globalStore.setError({ status: false, message: '' })
  return config
})

axios.interceptors.response.use(config => {
  setTimeout(() => {
    // store.commit('setLoading', false)
    globalStore.loading = false
  }, 1000)
  return config
}, e => {
  const { error } = e.response.data
  globalStore.error = { status: true, message: error }
  globalStore.loading = false
  // store.commit('setError', { status: true, message: error })
  // store.commit('setLoading', false)
  return Promise.reject(e.response.data)
})
app.mount('#app')
