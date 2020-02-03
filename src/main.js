import Vue from 'vue'
import App from './App.vue'
import store from './store'
import HighchartsVue from 'highcharts-vue'

import GoogleMap from './components/GoogleMap.vue'  

Vue.component('GoogleMap', GoogleMap);  

Vue.use(HighchartsVue)

Vue.filter('round', function (value, decimals) {
  if (!value) {
    value = 0
  }

  if (!decimals) {
    decimals = 0
  }

  value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return value
})

Vue.config.productionTip = false

window.vm = {}
new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
