import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import App from './App.vue'
import createRouter from './router'
import createStore from './store'

Vue.config.productionTip = false

export function createApp() {
  const router = createRouter()
  const store = createStore()

  // 同步路由状态(route state)到 store
  sync(store, router)

  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })

  return { app, router, store }
}
