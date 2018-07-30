import Vue from 'vue'
import VueRouter from 'vue-router'
import swal from 'sweetalert'
import $ from 'jquery'

$(document).ready(() => {
    swal("Hello!");
});


Vue.use(VueRouter)

console.log('Hello there!! test!!!');

//import auth from './auth'
import App from './App.vue'
//import About from 'components/About.vue'
import Dashboard from './Dashboard.vue'
import Login from './Login.vue'



function requireAuth (to, from, next) {
    if (!auth.loggedIn()) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
    } else {
        next()
    }
}

const router = new VueRouter({
   mode: 'history',
   base: '/',
   routers: [
       {
          path: '/dashboard',
          component: Dashboard,
          beforeEnter: requireAuth
       },
       {
          path: '/login',
          component: Login
       },
       {
          path: '/logout',
           beforeEnter (to, from, next) {
              auth.logout()
              next('/')
           }
       }
   ]
});

new Vue({
   el: '#vue-app',
   router,
   render: h => h(App)
});