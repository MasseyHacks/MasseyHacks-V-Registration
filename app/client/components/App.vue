<template>
    <div id="app">

        <!-- Common elements -->
        <div id="main-sidebar" v-if="loggedIn">
             <!--<img src="/logo/logo.svg" width="250" height="250"> -->
             <ul>
                <li>
                    <router-link to="/dashboard" tag="a"><button class="menu-button">Dashboard</button></router-link>
                </li>
                <li v-if="user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                    <router-link to="/application" tag="a"><button class="menu-button">Application</button></router-link>
                </li>
                 <li v-if="user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                     <router-link to="/team" tag="a"><button class="menu-button">Team</button></router-link>
                 </li>
                <li v-if="user.status.admitted && (user.permissions.developer || !user.permissions.admin)">
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
                    <router-link to="/developer" tag="a"><button class="menu-button">Developer</button></router-link>
                </li>
                <li>
                    <router-link to="/password" tag="a"><button class="menu-button">Change Password</button></router-link>
                </li>
                <li>
                    <router-link v-if="loggedIn" to="/logout" tag="a"><button class="menu-button">Logout</button></router-link>
                </li>

            </ul>
        </div>

        <div id="top-bar" v-if="loggedIn">
            <div id="top-bar-text">
                <div style="height: 50%"></div>
                <div class="vertical-centered">
                    <h2 style="margin: 0; padding: 0"><b>{{user.fullName}}</b></h2>
                    <h6 style="margin: 0; padding: 0">{{user.userType.name[0].toUpperCase() + user.userType.name.slice(1)}}</h6>
                </div>
            </div>

            <div id="top-bar-highlight">
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
    import AuthService  from '../src/AuthService'
    import Session      from '../src/Session'
    import ApiService   from '../src/ApiService.js'
    import Vue          from 'vue'

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
                this.user = Session.getUser()
                this.loggedIn = state

                console.log('Setting state to', state, message)

                if (!state) {
                    console.log('?message=' + encodeURIComponent(message))

                    if (message) {
                        this.$router.push({ path: '/login', query: {message: message}})
                    } else {
                        this.$router.push({path: '/login'})
                    }
                }
            }
        }
    }
</script>
