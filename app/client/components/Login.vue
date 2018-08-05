<template>
    <div>
        <h2>MasseyHacks Registration</h2>
        <p v-if="$route.query.redirect">
            You need to login first.
        </p>
        <form @submit.prevent="login">
            <label><input v-model="email" placeholder="hacker@hackermail.io" type="email" autofocus required></label>
            <label><input v-model="pass" placeholder="Shhh super secret" type="password" required></label><br>
            <button type="submit">login</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>

        <router-link to="/register" v-if="settings.registrationOpen">Register</router-link>
        <p v-else>Sorry, registration is {{settings.timeOpen > Date.now() ? "not open yet!" : "closed!"}}</p>

        <router-link to="/reset">Reset</router-link>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session     from '../src/Session'

    export default {
        data () {
            return {
                email: '',
                pass: '',
                error: false,
                settings: Session.getSettings()
            }
        },
        methods: {
            login () {
                AuthService.loginWithPassword(this.email, this.pass, (err, data) => {
                    if (err) {
                        this.error = err
                    } else {
                        this.error = null;
                        this.$router.replace(this.$route.query.redirect || '/')
                    }
                })
            }
        }
    }
</script>

<style>
    .error {
        color: red;
    }
</style>
