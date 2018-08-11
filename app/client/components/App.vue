<template>
    <div id="app">
        <!-- Common elements -->
        <div id="main-sidebar" v-if="loggedIn">
            <ul>
                <li>
                    <router-link to="/dashboard" tag="a"><button class="menu-button">Dashboard</button></router-link>
                </li>
                <li v-if="user.permissions.verified">
                    <router-link to="/application" tag="a"><button class="menu-button">Application</button></router-link>
                </li>
                <li v-if="user.status.admitted">
                    <router-link to="/confirmation" tag="a"><button class="menu-button">Confirmation</button></router-link>
                </li>
                <li v-if="user.permissions.checkin">
                    <router-link to="/checkin" tag="a"><button class="menu-button">Check In</button></router-link>
                </li>
                <li v-if="user.permissions.admin">
                    <router-link to="/organizer" tag="a"><button class="menu-button">Organizer</button></router-link>
                </li>
                <li v-if="user.permissions.owner">
                    <router-link to="/owner" tag="a"><button class="menu-button">Owner</button></router-link>
                </li>
                <li v-if="user.permissions.developer">
                    <router-link to="/owner" tag="a"><button class="menu-button">Owner</button></router-link>
                </li>
                <li>
                    <router-link to="/password" tag="a"><button class="menu-button">Change PW</button></router-link>
                </li>
                <li>
                    <router-link v-if="loggedIn" to="/logout" tag="a"><button class="menu-button">Logout</button></router-link>
                </li>

            </ul>
        </div>

        <!-- Router injects stuff in here -->
        <div id="app-view">
            <template v-if="$route.matched.length">
                <transition :name="transitionName">
                    <router-view class="child-view"></router-view>
                </transition>
            </template>
        </div>
    </div>
</template>

<script>
    import AuthService  from '../src/AuthService'
    import Session      from '../src/Session'
    import BootstrapVue from 'bootstrap-vue'
    import ApiService   from '../src/ApiService.js'

    export default {
        beforeRouteUpdate (to, from, next) {
            const pageLayout = ['dashboard', 'application', 'confirmation', 'team', 'checkin', 'organizer', 'owner', 'developer', 'password']

            const toPath = to.path.split('/')
            const fromPath = from.path.split('/')

            console.log('dasd', toPath, fromPath)
            console.log('Hello there')

            const toDepth = pageLayout.indexOf(toPath[toPath.length - 1])
            const fromDepth = pageLayout.indexOf(fromPath[toPath.length - 1])
            this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
            next()
        },
        data() {
            return {
                user: Session.getUser(),
                settings: Session.getSettings(),
                loggedIn: Session.loggedIn(),
                AuthService: AuthService,
                transitionName: 'slide-left',
                ApiService: ApiService
            }
        },
        created() {
            AuthService.updateLoginState = state => {
                this.user = Session.getUser()
                this.loggedIn = state

                console.log('Setting state to', state)

                if (!state) {
                    this.$router.replace('/login')
                }
            }

            // Login with token if it exists
            if (Session.loggedIn()) {
                AuthService.loginWithToken()
            }
        }
    }
</script>
