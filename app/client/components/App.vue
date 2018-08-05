<template>
    <div id="app">
        <h1>MasseyHacks | Platform Internal Services</h1>

        <!-- Common elements -->
        <ul v-if="loggedIn">
            <li>
                <router-link v-if="loggedIn" to="/logout">Log out</router-link>
            </li>

            <li  v-if="user.permissions.level >= 1">
                <router-link to="/application">Application</router-link>
            </li>
            <li v-if="user.permissions.level >= 2">
                <router-link to="/checkin">Check In</router-link>
            </li>
            <li v-if="user.permissions.level >= 3">
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
            <router-view></router-view>
        </template>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session     from '../src/Session'

    export default {
        data() {
            return {
                user: Session.getUser(),
                loggedIn: Session.loggedIn(),
                AuthService: AuthService
            }
        },
        created() {
            AuthService.updateLoginState = state => {
                this.user = Session.getUser()
                this.loggedIn = state
            }
        }
    }
</script>
