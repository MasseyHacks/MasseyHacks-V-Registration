<template>
    <div id="main">
        
        <p v-if="$route.query.redirect">
            You need to login first.
        </p>
        <div id="login-form-box">
            <h2 class="subtitle">Login</h2>
            <div id="login-form-elements">
                <form @submit.prevent="login">
                    <input v-model="email" placeholder="hacker@hackermail.io" type="email" autofocus required>
                    <input v-model="pass" placeholder="Shhh super secret" type="password" required><br>
                    <button type="submit">login</button>
                    <p v-if="error" class="error">{{error}}</p>
                </form>
            </div>
        </div>

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
        created() {

            if (Session.loggedIn()) {
                this.$router.replace('/dashboard')
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
