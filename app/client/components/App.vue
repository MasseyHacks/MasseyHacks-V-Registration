<template>
    <div id="app">

        <!-- Common elements -->
        <div id="main-sidebar" v-if="loggedIn">
            <img src="/logo/logo-white.svg" width="150px" height="150px" style="margin: 40px; text-align: center">
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

        <div id="nav-main" style="display:none;" v-if="loggedIn">
            <div style="height: 50%"></div>
            <div class="vertical-centered">

                <ul class="container">
                    <div class="">
                        <li>
                            <img src="/logo/logo-white.svg" width="auto" height="50px">
                        </li>
                    </div>
                    <div class="">

                    </div>
                </ul>
            </div>
        </div>

        <!-- Router injects stuff in here -->
        <!-- v-bind:style="{ height: height, width: loggedIn ? 'calc(100% - 230px) !important' : '100vw' }" -->
        <div id="app-view" v-bind:class="{'app-view-logged-in' : loggedIn}">
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
                Alerts: [{}],
                height: '100% !important',
                width: 'calc(100% - 230px) !important'
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
