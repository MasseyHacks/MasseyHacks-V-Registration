<template>
    <div class="app-screen">
        <div style="">
            <div class="container">
                <div class="row">
                    <div class="title-card col-md-12">
                        <h2>ORGANIZER</h2>
                    </div>
                </div>

            </div>
            <div class="container-fluid">
                <div class="row">
                    <div class="ui-card dash-card-large">
                        <router-link to="/organizer/statistics">
                            <button class="generic-button-dark">Statistics</button>
                        </router-link>
                        <router-link to="/organizer/users">
                            <button class="generic-button-dark">Users</button>
                        </router-link>
                        <router-link to="/organizer/teamview">
                            <button class="generic-button-dark">Teams</button>
                        </router-link>
                        <router-link v-if="user.permissions.reviewer" to="/organizer/review">
                            <button class="generic-button-dark">Review</button>
                        </router-link>
                    </div>
                </div>
                <transition :name="transitionName">
                    <router-view class="child-view"></router-view>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session from '../src/Session'

    export default {
        beforeRouteUpdate (to, from, next) {
            const pageLayout = ['statistics', 'users', 'teamview', 'review'];
            const toPath = to.path.split('/');
            const fromPath = from.path.split('/');

            console.log('dasd', toPath, fromPath);
            console.log('Hello there');

            const toDepth = pageLayout.indexOf(toPath[toPath.length - 1]);
            const fromDepth = pageLayout.indexOf(fromPath[toPath.length - 1]);

            console.log(toDepth, fromDepth);

            this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';

            next()
        },
        data() {
            return {
                user: Session.getUser(),
                loggedIn: Session.loggedIn(),
                AuthService: AuthService,
                transitionName: 'slide-left'
            }
        },
        beforeMount() {
            if (this.$router.currentRoute.path == '/organizer') {
                this.$router.replace('/organizer/statistics')
            }
        }
    }
</script>