<template>
    <div>
        <h2>Organizer Control Panel</h2>

        <li>
            <router-link to="/organizer/statistics">Statistics</router-link>
        </li>
        <li>
            <router-link to="/organizer/users">Users</router-link>
        </li>
        <li v-if="$parent.AuthService.isAuthorized('reviewer')">
            <router-link to="/organizer/review">Review</router-link>
        </li>

        <transition :name="transitionName">
            <router-view class="child-view"></router-view>
        </transition>
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
                loggedIn: Session.loggedIn(),
                AuthService: AuthService,
                transitionName: 'slide-left'
            }
        },
        created() {

        }
    }
</script>