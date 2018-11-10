<template>
    <div class="main main-login"
         style="background: rgb(250,250,250);background-size: cover; height: 100vh; width: 100vw;">
        <div style="background-color: rgba(0, 0, 0, 0.6); height: 100%">
            <div class="spacer"></div>
            <div id="login-form-box" class="vertical-centered">

                <div>

                    <img src="https://d1pzqbmq24mwaz.cloudfront.net/static/public/images/home/waterloo-logo.png"
                         width="50%">

                    <h2 class="subtitle">Register</h2>

                    <p v-if="$route.query.message && !error">{{$route.query.message}}</p>
                    <p v-if="error" class="error">{{error}}</p>

                    <div id="login-form-elements">
                        <form @submit.prevent="register">
                            <input v-model="firstName" placeholder="First Name" autofocus required>
                            <input v-model="lastName" placeholder="Last Name" required>
                            <input v-model="email" placeholder="Email" type="email" required>
                            <input v-model="password1" placeholder="Password" type="password" required>
                            <input v-model="password2" placeholder="Confirm Password" type="password" required>
                            <div id="button-row">
                                <button type="submit" class="primary-button">register</button>
                                <router-link to="/login">
                                    <button>back</button>
                                </router-link>
                            </div>

                            <p v-if="error" class="error">{{error}}</p>
                        </form>
                    </div>
                </div>
            </div>

            <img src="/img/goose.png" width="200px" height="auto" style="left: 30px; bottom: 30px; position: absolute;">
        </div>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session from '../src/Session'

    export default {
        data () {
            return {
                firstName: '',
                lastName: '',
                email: '',
                password1: '',
                password2: '',
                error: false
            }
        },
        created() {
            if (Session.loggedIn()) {
                this.$router.replace('/dashboard')
            }
        },
        methods: {
            register () {
                if (this.password1 != this.password2) {
                    this.error = 'Passwords don\'t match!'
                } else {
                    AuthService.register(this.email, this.firstName, this.lastName, this.password1, (err, data) => {
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
    }
</script>

<style>
    .error {
        color: red;
    }
</style>
