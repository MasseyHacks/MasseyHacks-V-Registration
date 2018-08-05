import Vue          from 'vue'
import VueRouter    from 'vue-router'
import swal         from 'sweetalert2'
import $            from 'jquery'

import Session      from './Session'
import AuthService  from './AuthService'

import App          from '../components/App.vue'

import Login        from '../components/Login.vue'
import Register     from '../components/Register.vue'
import Reset        from '../components/Reset.vue'
import Verify       from '../components/Verify.vue'

import Dashboard    from '../components/Dashboard.vue'
import Organizer    from '../components/Organizer.vue'
import Owner        from '../components/Owner.vue'
import Checkin      from '../components/Checkin.vue'
import Application  from '../components/Application.vue'
import Confirmation from '../components/Confirmation.vue'
import Error        from '../components/Error.vue'

import Raven        from 'raven-js';
import RavenVue     from 'raven-js/plugins/vue';

Raven
    .config('https://4847023082204ef8b35b1ea961567902@sentry.io/1256194')
    .addPlugin(RavenVue, Vue)
    .install();

Vue.use(VueRouter)

// Login with token if it exists
if (Session.loggedIn()) {
    AuthService.loginWithToken(Session.getToken())
}

$.ajax({
    type: 'GET',
    url: '/api/settings',
    success: data => {
        Session.setSettings(data)
    },
    error: data => {
        Raven.captureMessage(JSON.stringify(data))
    }
});


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

function requireNoAuth (to, from, next) {
    if (Session.loggedIn()) {
        next('/')
    } else {
        next()
    }
}

function isAuthorized (to, from, next, authCondition) {
    if (!Session.loggedIn()) {
        next({
            path: '/login',
            query: {
                redirect: to.fullPath
            }
        })
    } else if (Session.getUser() && Session.s.getUser().permissions.level >= authCondition) {
        next()
    } else {
        next({
            path: '/error',
            query: {
                error: "You don't have permission to access this page."
            }
        })
    }
}

/*
function isAdmitted (to, from, next) {
    if (!Session.loggedIn()) {
        next({
            path: '/login',
            query: {
                redirect: to.fullPath
            }
        })
    } else if (Session.getUser() && Session.getUser().status.admitted) {
        next()
    } else {
        next({
            path: '/dashboard',
            query: {
                error: "Access Denied"
            }
        })
    }
}*/

function isVerified (to, from, next) {
    isAuthorized(to, from, next, 1)
}

function isCheckin (to, from, next) {
    isAuthorized(to, from, next, 2)
}

function isAdmin (to, from, next) {
    isAuthorized(to, from, next, 3)
}

function isReviewer (to, from, next) {
    isAuthorized(to, from, next, 4)
}

function isAdmin (to, from, next) {
    isAuthorized(to, from, next, 5)
}

function isOwner (to, from, next) {
    isAuthorized(to, from, next, 6)
}

function isDeveloper (to, from, next) {
    isAuthorized(to, from, next, 7)
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
           path: '/application',
           component: Application,
           beforeEnter: isVerified
       },
       {
           path: '/confirmation',
           component: Confirmation,
           beforeEnter: isVerified
       },
       {
           path: '/checkin',
           component: Checkin,
           beforeEnter: isCheckin
       },
       {
           path: '/organizer',
           component: Organizer,
           beforeEnter: isAdmin
       },
       {
           path: '/owner',
           component: Owner,
           beforeEnter: isOwner
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
                       error: "Page not found."
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