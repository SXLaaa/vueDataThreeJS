import Vue from 'vue'
import Vuex from 'vuex'
import dataType from './modules/dataType'
import module2 from './modules/module2'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    dataType, module2
  }
})
