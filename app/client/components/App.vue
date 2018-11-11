<template>
    <div id="app">

        <div id="nav-main" v-if="loggedIn">
            <div style="height: 50%"></div>
            <div class="vertical-centered">

                <ul class="container">
                    <li>
                        <img src="/logo/logo-white.svg" width="auto" height="50px" style="margin-left: 40px">
                    </li>
                    <li>
                        <router-link to="/dashboard" tag="a">Dashboard</router-link>
                    </li>
                    <li v-if="user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                        <router-link to="/application" tag="a">Application</router-link>
                    </li>
                    <li v-if="user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                        <router-link to="/team" tag="a">Team</router-link>
                    </li>
                    <li v-if="user.status.admitted && (user.permissions.developer || !user.permissions.admin)">
                        <router-link to="/confirmation" tag="a">Confirmation</router-link>
                    </li>
                    <li v-if="user.permissions.checkin">
                        <router-link to="/checkin" tag="a">Check In</router-link>
                    </li>
                    <li v-if="user.permissions.admin">
                        <router-link to="/organizer" tag="a">Organizer</router-link>
                    </li>
                    <li v-if="user.permissions.owner">
                        <router-link to="/owner" tag="a">Owner</router-link>
                    </li>
                    <li v-if="user.permissions.developer">
                        <router-link to="/developer" tag="a">Developer</router-link>
                    </li>
                    <li>
                        <router-link to="/password" tag="a">Change Password</router-link>
                    </li>
                    <li>
                        <router-link v-if="loggedIn" to="/logout" tag="a">Logout</router-link>
                    </li>

                </ul>
            </div>
        </div>

        <!-- Router injects stuff in here -->
        <div id="app-view"> <!--v-bind:class="{'app-view-logged-in' : loggedIn}">-->

            <!--
            <template v-if="$route.matched.length">

            </template>-->

            <transition :name="$parent.transition">
                <router-view class="child-view"></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session from '../src/Session'
    import ApiService from '../src/ApiService.js'
    import $ from 'jquery'

    export default {
        data() {
            return {
                user: Session.getUser(),
                settings: Session.getSettings(),
                loggedIn: Session.loggedIn(),
                AuthService: AuthService,
                ApiService: ApiService,
                Alerts: [{}]
            }
        },
        created() {
            AuthService.updateLoginState = (state, message) => {
                this.user = Session.getUser();
                this.loggedIn = state;

                console.log('Setting state to', state, message);

                if (!state) {
                    console.log('?message=' + encodeURIComponent(message));

                    if (message) {
                        this.$router.push({path: '/login', query: {message: message}})
                    } else {
                        this.$router.push({path: '/login'})
                    }
                }
            }
        },
        methods: {
            toggleSidebar() {
                $('main-sidebar').css('left: 0')
            }
        }
    }
</script>
