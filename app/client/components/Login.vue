<template>
    <div class="main main-login"
         style="background: url('/img/2.jpg') center;background-size: cover; height: 100vh; width: 100vw;">
        <div style="background-color: rgba(0, 0, 0, 0.6); height: 100%">
            <div class="spacer"></div>
            <div id="login-form-box" class="vertical-centered">

                <div>

                    <img src="logo/logowide.svg"
                         width="45%">

                    <!--
                    <h2 class="subtitle">Login</h2>
                    -->

                    <p v-if="$route.query.redirect && !error" class="error">
                        You need to login first.
                    </p>
                    <p v-if="$route.query.message && !error" class="error">{{$route.query.message}}</p>
                    <p v-if="error" class="error">{{error}}</p>

                    <div id="login-form-elements">
                        <form @submit.prevent="login">
                            <input class="standard-input" v-model="email" placeholder="Email" type="email" autofocus required><br>
                            <input class="standard-input" v-model="pass" placeholder="Password" type="password" required><br>

                            <div id="button-row">
                                <button class="generic-button-dark" type="submit">
                                    Sign In
                                </button>

                                <router-link to="/register" v-if="settings.registrationOpen">
                                    <button class="generic-button-dark">Register</button>
                                </router-link>

                                <router-link to="/reset">
                                    <button class="generic-button-dark">Reset</button>
                                </router-link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!--
            <img src="/img/goose.png" width="200px" height="auto" style="left: 30px; bottom: 30px; position: absolute;">
            -->

        </div>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session from '../src/Session'

    export default {
        data() {
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
            login() {
                AuthService.loginWithPassword(this.email, this.pass, (err, data) => {
                    if (err) {
                        this.error = err
                    } else {
                        this.error = null;
                        if (data["2FA"]) {
                            this.$router.replace("/2fa")
                        } else {
                            this.$router.replace(this.$route.query.redirect || '/')
                        }
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
