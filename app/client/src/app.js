import Vue          from 'vue'
import VueRouter    from 'vue-router'
import swal         from 'sweetalert2'

import Session      from './Session'
import AuthService  from './AuthService'

import App          from '../components/App.vue'

import Login        from '../components/Login.vue'
import Register     from '../components/Register.vue'
import Reset        from '../components/Reset.vue'

import Dashboard    from '../components/Dashboard.vue'
import Error        from '../components/Error.vue'

Vue.use(VueRouter)

// Login with token if it exists
if (Session.loggedIn()) {
    AuthService.loginWithToken(Session.getToken())
}

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
    } else if (Session.getUser() && Session.getUser().permissions.level >= authCondition) {
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
           component: Dashboard,
           beforeEnter: isVerified
       },
       {
           path: '/confirmation',
           component: Dashboard,
           beforeEnter: isVerified
       },
       {
           path: '/checkin',
           component: Dashboard,
           beforeEnter: isCheckin
       },
       {
           path: '/organizer',
           component: Dashboard,
           beforeEnter: isAdmin
       },
       {
           path: '/owner',
           component: Dashboard,
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
           path: '/reset/:token',
           component: Reset,
           props: true,
           beforeEnter: requireNoAuth
       },
       {
           path: '/reset',
           component: Reset,
           beforeEnter: requireNoAuth
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