<template>
    <div id="app">

        <!-- Common elements -->
        <div id="main-sidebar" v-if="loggedIn" v-bind:style="sidebarStyle">
            <img src="/logo/logo-white.svg" width="150px" height="150px" style="margin-top: 40px; margin-bottom: 40px; margin-left: auto; margin-right: auto; text-align: center">
            <ul>
                <li>
                    <router-link to="/dashboard" tag="a"><button class="menu-button" v-on:click="retractSidebar">Dashboard</button></router-link>
                </li>
                <li v-if="user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                    <router-link to="/application" tag="a"><button class="menu-button" v-on:click="retractSidebar">Application</button></router-link>
                </li>
                <li v-if="user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                    <router-link to="/team" tag="a"><button class="menu-button" v-on:click="retractSidebar">Team</button></router-link>
                </li>
                <li v-if="user.status.admitted && (user.permissions.developer || !user.permissions.admin)">
                    <router-link to="/confirmation" tag="a"><button class="menu-button" v-on:click="retractSidebar">Confirmation</button></router-link>
                </li>
                <li v-if="user.permissions.checkin">
                    <router-link to="/checkin" tag="a"><button class="menu-button" v-on:click="retractSidebar">Check In</button></router-link>
                </li>
                <li v-if="user.permissions.admin">
                    <router-link to="/organizer" tag="a"><button class="menu-button" v-on:click="retractSidebar">Organizer</button></router-link>
                </li>
                <li v-if="user.permissions.owner">
                    <router-link to="/owner" tag="a"><button class="menu-button" v-on:click="retractSidebar">Owner</button></router-link>
                </li>
                <li v-if="user.permissions.developer">
                    <router-link to="/developer" tag="a"><button class="menu-button" v-on:click="retractSidebar">Developer</button></router-link>
                </li>
                <li>
                    <router-link to="/password" tag="a"><button class="menu-button" v-on:click="retractSidebar">Change Password</button></router-link>
                </li>
                <li>
                    <router-link v-if="loggedIn" to="/logout" tag="a"><button class="menu-button" v-on:click="retractSidebar">Logout</button></router-link>
                </li>
            </ul>
        </div>

        <div id="tint" v-if="this.sidebarOpen()" v-on:click="toggleSidebar" style="z-index: 650; position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.60);"></div>

        <div id="nav-main" v-if="loggedIn">
            <div style="height: 50%"></div>
            <div class="vertical-centered">
                <ul>
                        <li>
                            <img src="/logo/logo-white.svg" width="auto" height="50px">
                        </li>

                        <li style="float: right">

                            <div v-on:click="toggleSidebar" class="hamburger hamburger--slider pull-right hidden" id="nav-ham">
                                <div class="hamburger-box">
                                    <div class="hamburger-inner" id="hamburger"></div>
                                </div>
                            </div>

                        </li>

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

    export default {
        data() {
            return {
                user: Session.getUser(),
                settings: Session.getSettings(),
                loggedIn: Session.loggedIn(),
                AuthService: AuthService,
                ApiService: ApiService,
                Alerts: [{}],
                sidebarStyle: ''
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
                console.log('hi');
                if (this.sidebarStyle == '') {
                    this.sidebarStyle = 'left: 0 !important;'
                } else {
                    this.sidebarStyle = ''
                }
            },
            sidebarOpen() {
                return this.sidebarStyle == 'left: 0 !important;';
            },
            retractSidebar() {
                if (this.sidebarOpen()) {
                    this.toggleSidebar();
                }
            }
        }
    }
</script>
