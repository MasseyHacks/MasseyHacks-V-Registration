<template>
    <div id="app">
        <h1>MasseyHacks | Platform Internal Services</h1>
        <ul v-if="loggedIn">
            <li>
                <router-link v-if="loggedIn" to="/logout">Log out</router-link>
                <router-link v-if="!loggedIn" to="/login">Log in</router-link>
            </li>
            <li>
                <router-link to="/register">Register</router-link>
            </li>
            <li>
                <router-link to="/organizer">Organizer</router-link>
            </li>
            <li>
                <router-link to="/owner">Owner</router-link>
            </li>
            <li>
                <router-link to="/confirmation">Confirmations</router-link>
            </li>
            <li>
                <router-link to="/application">Application</router-link>
            </li>
            <li>
                <router-link to="/dashboard">Dashboard</router-link>
                (authenticated)
            </li>
        </ul>
        <template v-if="$route.matched.length">
            <router-view></router-view>
        </template>
        <template v-else>
            <p>You are logged {{ loggedIn ? 'in' : 'out' }}</p>
        </template>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session     from '../src/Session'

    export default {
        data () {
            return {
                loggedIn: Session.loggedIn()
            }
        },
        created() {
            AuthService.updateLoginState = state => {
                this.loggedIn = state
            }
        }
    }
</script>
