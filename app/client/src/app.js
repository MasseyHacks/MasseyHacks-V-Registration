import Vue from 'vue'
import VueRouter from 'vue-router'
import swal from 'sweetalert2'

import Session from './Session'
import AuthService from './AuthService'
import App from '../components/App.vue'
import Dashboard from '../components/Dashboard.vue'
import Login from '../components/Login.vue'

Vue.use(VueRouter)

function requireAuth (to, from, next) {
    if (!Session.loggedIn()) {
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
           component: Login,
           beforeEnter (to, from, next) {
               if (Session.loggedIn()) {
                   next('/')
               } else {
                   next()
               }
           }
       },
       {
           path: '/logout',
           beforeEnter (to, from, next) {
               swal({
                   title: "Just to be safe",
                   text: "Are you sure you want to logout?",
                   type: "warning",
                   showCancelButton: true,
                   confirmButtonColor: "#DD6B55",
                   confirmButtonText: "Logout"
               }).then(result => {
                   if (result.value) {
                       AuthService.logout()
                       next('/')
                   }
               });
           }
       }
   ]
});

new Vue({
   el: '#app',
   router,
   render: h => h(App)
});