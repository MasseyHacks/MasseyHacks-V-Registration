import Vue          from 'vue'
import VueRouter    from 'vue-router'
import swal         from 'sweetalert2'

import Session      from './Session'
import AuthService  from './AuthService'
import App          from '../components/App.vue'
import Dashboard    from '../components/Dashboard.vue'
import Login        from '../components/Login.vue'
import Register     from '../components/Register.vue'
import PageNotFound from '../components/PageNotFound.vue'

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

function requireNoAuth (to, from, next) {
    if (Session.loggedIn()) {
        next('/')
    } else {
        next()
    }
}

const router = new VueRouter({
   mode: 'history',
   base: __dirname,
   routes: [
       {
           path: '/',
           beforeEnter (to, from, next) {
               if (Session.loggedIn()) {
                   next('/dashboard')
               } else {
                   next('/login')
               }
           }
       },
       {
           path: '/dashboard',
           component: Dashboard,
           beforeEnter: requireAuth
       },
       {
           path: '/register',
           component: Register,
           beforeEnter: requireNoAuth
       },
       {
           path: '/login',
           component: Login,
           beforeEnter: requireNoAuth
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
                       next('/login')
                   }
               });
           }
       },
       {
           path: '*',
           component: PageNotFound
       }

   ]
});

new Vue({
   el: '#app',
   router,
   render: h => h(App)
});