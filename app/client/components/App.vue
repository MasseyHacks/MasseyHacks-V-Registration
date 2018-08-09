<template>
    <div id="app">
        <!-- Common elements -->
        <ul v-if="loggedIn">
            <li>
                <router-link v-if="loggedIn" to="/logout">Log out</router-link>
            </li>

            <li  v-if="AuthService.isAuthorized('verified')">
                <router-link to="/application">Application</router-link>
            </li>
            <li v-if="AuthService.isAuthorized('checkin')">
                <router-link to="/checkin">Check In</router-link>
            </li>
            <li v-if="AuthService.isAuthorized('admin')">
                <router-link to="/organizer">Organizer</router-link>
            </li>
            <li v-if="AuthService.isAuthorized('owner')">
                <router-link to="/owner">Owner</router-link>
            </li>
            <li v-if="user.status.admitted">
                <router-link to="/confirmation">Confirmation</router-link>
            </li>
            <li>
                <router-link to="/dashboard">Dashboard</router-link>
            </li>
        </ul>

        <!-- Router injects stuff in here -->
        <template v-if="$route.matched.length">
            <transition :name="transitionName">
                <router-view class="child-view"></router-view>
            </transition>
        </template>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session     from '../src/Session'

    export default {
        beforeRouteUpdate (to, from, next) {
            const toDepth = to.path.split('/').length
            const fromDepth = from.path.split('/').length
            this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
            next()
        },
        data() {
            return {
                user: Session.getUser(),
                settings: Session.getSettings(),
                loggedIn: Session.loggedIn(),
                AuthService: AuthService,
                transitionName: 'slide-left'
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
                AuthService.loginWithToken(Session.getToken())
            }
        }
    }
</script>
