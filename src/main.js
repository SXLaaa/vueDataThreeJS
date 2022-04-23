import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vueParticles from 'vue-particles'
import Vcomp from './components/index'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

import '@/assets/styles/base.scss'
import '@/assets/styles/common.scss'
import '@/assets/iconfont/iconfont.css'

Vue.use(vueParticles)
Vue.use(Vcomp)

Vue.config.productionTip = false

import Video from 'video.js'
import 'video.js/dist/video-js.css'
Vue.prototype.$video = Video

import {getToken} from './utils/userToken'
var whiteList = ['/login','/home']
router.beforeEach(async (to,from,next) => {
	const token  = getToken()
	if(token){
		if(to.path === '/login'){
			next({path:'/home'}) // 跳转根路由
		}else{
			next()
		}
	}else{
		let index = whiteList.indexOf(to.path)
		if(index !== -1){
			next()
		}else{
			next("/login")
		}
	}
})
    
router.afterEach(() => {

})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
