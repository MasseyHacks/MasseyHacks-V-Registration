import Vue from 'vue'
import VueRouter from 'vue-router'
import swal from 'sweetalert'

import auth from './auth'
import App from '../components/App.vue'
import Dashboard from '../components/Dashboard.vue'
import Login from '../components/Login.vue'

Vue.use(VueRouter)

function requireAuth (to, from, next) {
    swal("U NEED AUTH!!!");

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
   base: __dirname,
   routes: [
       {
           path: '/dashboard',
           component: Dashboard,
           beforeEnter: requireAuth
       },
       {
           path: '/login',
           component: Login
       },
       { path: '/logout',
           beforeEnter (to, from, next) {
               auth.logout()
               next('/')
           }
       }
   ]
});

new Vue({
   el: '#app',
   router,
   render: h => h(App)
});