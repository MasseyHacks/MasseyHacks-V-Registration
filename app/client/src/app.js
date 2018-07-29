import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

console.log('Hello there!! test!!!');

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
          path: '/dashboard'
       },
       {
          path: '/login',
          component: Login
       },
       {
          path: '/logout',
           beforeEnter (to, from, next) {
              next('/');
           }
       }
   ]
});

new Vue({
   el: '#vue-app',
   router,
   render: h => h(App)
});