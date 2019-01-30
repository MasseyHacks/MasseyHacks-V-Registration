<template>
    <div id="app">

        <!-- Common elements -->
        <div id="main-sidebar" v-if="loggedIn" v-bind:style="sidebarStyle">
            <img height="150px" src="/logo/logo-white.svg"
                 style="margin-top: 40px; margin-bottom: 40px; margin-left: auto; margin-right: auto; text-align: center"
                 width="150px">
            <ul>
                <li>
                    <router-link tag="a" to="/dashboard">
                        <button class="menu-button" v-on:click="retractSidebar">Dashboard</button>
                    </router-link>
                </li>
                <li v-if="!(user.status.admitted || user.status.rejected) && user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                    <router-link tag="a" to="/application">
                        <button class="menu-button" v-on:click="retractSidebar">Application</button>
                    </router-link>
                </li>
                <li v-if="!(user.status.admitted || user.status.rejected) && user.permissions.verified && (user.permissions.developer || !user.permissions.admin)">
                    <router-link tag="a" to="/team">
                        <button class="menu-button" v-on:click="retractSidebar">Team</button>
                    </router-link>
                </li>
                <li v-if="!user.status.declined && user.status.admitted && (user.permissions.developer || !user.permissions.admin)">
                    <router-link tag="a" to="/confirmation">
                        <button class="menu-button" v-on:click="retractSidebar">Confirmation</button>
                    </router-link>
                </li>
                <li v-if="user.permissions.checkin">
                    <router-link tag="a" to="/checkin">
                        <button class="menu-button" v-on:click="retractSidebar">Check In</button>
                    </router-link>
                </li>
                <li v-if="user.permissions.admin">
                    <router-link tag="a" to="/organizer">
                        <button class="menu-button" v-on:click="retractSidebar">Organizer</button>
                    </router-link>
                </li>
                <li v-if="user.permissions.owner">
                    <router-link tag="a" to="/owner">
                        <button class="menu-button" v-on:click="retractSidebar">Owner</button>
                    </router-link>
                </li>
                <li v-if="user.permissions.developer">
                    <router-link tag="a" to="/developer">
                        <button class="menu-button" v-on:click="retractSidebar">Developer</button>
                    </router-link>
                </li>
                <li>
                    <router-link tag="a" to="/password">
                        <button class="menu-button" v-on:click="retractSidebar">Change Password</button>
                    </router-link>
                </li>
                <li>
                    <router-link tag="a" to="/logout" v-if="loggedIn">
                        <button class="menu-button" v-on:click="retractSidebar">Logout</button>
                    </router-link>
                </li>
                <li>
                    <p style="color: darkgrey; font-size: 0.7em">
                        <br>
                        Logged in as {{user.fullName}}<br>
                        ({{user.userType.name.toUpperCase()}})
                    </p>
                </li>
            </ul>
        </div>

        <div id="tint"
             v-bind:style="this.sidebarOpen() ? 'background-color: rgba(0, 0, 0, 0.60);' : 'background-color: rgba(0, 0, 0, 0); pointer-events: none;'"
             v-on:click="retractSidebar"></div>

        <div id="nav-main" v-if="loggedIn">
            <div style="height: 50%"></div>
            <div class="vertical-centered">
                <ul>
                    <li>
                        <img height="50px" src="/logo/logo-white.svg" width="auto">
                    </li>

                    <li style="float: right">

                        <div class="hamburger hamburger--slider pull-right hidden" id="nav-ham"
                             v-on:click="toggleSidebar">
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
