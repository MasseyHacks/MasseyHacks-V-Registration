import Vue            from 'vue'
import VueRouter      from 'vue-router'
import swal           from 'sweetalert2'
import $              from 'jquery'

import Session        from './Session'
import AuthService    from './AuthService'

import App            from '../components/App.vue'

import Login          from '../components/Login.vue'
import Register       from '../components/Register.vue'
import Reset          from '../components/Reset.vue'
import Verify         from '../components/Verify.vue'

import Dashboard      from '../components/Dashboard.vue'
import Organizer      from '../components/Organizer.vue'
import Owner          from '../components/Owner.vue'
import Checkin        from '../components/Checkin.vue'
import Statistics     from '../components/Statistics.vue'
import Application    from '../components/Application.vue'
import Confirmation   from '../components/Confirmation.vue'
import Error          from '../components/Error.vue'
import PasswordChange from '../components/PasswordChange.vue'

import Raven          from 'raven-js'
import RavenVue       from 'raven-js/plugins/vue'

$.ajax({
    type: 'GET',
    url: '/api/settings',
    async: false,
    success: data => {
        Session.setSettings(data)
    },
    error: data => {
        Raven.captureMessage(JSON.stringify(data))
    }
});

Raven
    .config(CLIENT_RAVEN_KEY) //Sub in key with webpack
    .addPlugin(RavenVue, Vue)
    .install();

Vue.use(VueRouter)

function requireAuth (to, from, next) {
    if (!Session.loggedIn()) {
        next({
            path: '/login',
            query: {
                redirect: to.fullPath
            }
        })
    } else {
        next()
    }
}

function isAuthorized (to, from, next) {
    var authorized = true

    for (var key in to.meta) {
        if (!Session.getUser() || !to['meta'][key] in Session.getUser()[key] || !Session.getUser()[key][to['meta'][key]]) {
            authorized = false
            break
        }
    }

    //to.meta.permission in Session.getUser()['permissions'] && Session.getUser()['permissions'][to.meta.permission]

    if (authorized) {
        next()
    } else if (!Session.loggedIn()) {
        next({
            path: '/login',
            query: {
                redirect: to.fullPath
            }
        })
    } else {
        next({
            path: '/error',
            query: {
                error: 'You don\'t have permission to access this page.'
            }
        })
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
           path: '/password',
           component: PasswordChange,
           beforeEnter: requireAuth
       },
       {
           path: '/application',
           component: Application,
           beforeEnter: isAuthorized,
           meta: {
               permissions: 'verified'
           }
       },
       {
           path: '/confirmation',
           component: Confirmation,
           beforeEnter: isAuthorized,
           meta: {
               permissions: 'verified',
               status: 'admitted'
           }
       },
       {
           path: '/checkin',
           component: Checkin,
           beforeEnter: isAuthorized,
           meta: {
               permissions: 'checkin'
           }
       },
       {
           path: '/organizer',
           component: Organizer,
           beforeEnter: isAuthorized,
           meta: {
               permissions: 'admin'
           },
           children: [
               {
                   path: 'statistics', component: Statistics
               },
               {
                   path: 'users', component: Dashboard
               },
               {
                   path: 'review', component: Checkin
               }
           ]
       },
       {
           path: '/owner',
           component: Owner,
           beforeEnter:  isAuthorized,
           meta: {
               permissions: 'owner'
           },
           children: [
               {
                   path: '/settings', component: Login
               },
               {
                   path: '/log', component: Login
               }
           ]
       },
       {
           path: '/register',
           component: Register
       },
       {
           path: '/login',
           component: Login
       },
       {
           path: '/logout',
           beforeEnter (to, from, next) {
               swal({
                   title: 'Just to be safe',
                   text: 'Are you sure you want to logout?',
                   type: 'warning',
                   showCancelButton: true,
                   confirmButtonColor: '#DD6B55',
                   confirmButtonText: 'Logout'
               }).then(result => {
                   if (result.value) {
                       AuthService.logout()
                       next('/login')
                   }
               });
           }
       },
       {
           path: '/verify/:token',
           component: Verify,
           props: true
       },
       {
           path: '/reset/:token',
           component: Reset,
           props: true
       },
       {
           path: '/reset',
           component: Reset
       },
       {
           path: '/error',
           component: Error
       },
       {
           path: '*',
           beforeEnter (to, from, next) {
               next({
                   path: '/error',
                   query: {
                       error: 'Page not found.'
                   }
               })
           }
       }

   ]
});

new Vue({
   el: '#app',
   router,
   render: h => h(App)
});