<template>
    <div class="main main-login"
         style="background: url('/img/2.jpg') center;background-size: cover; height: 100vh; width: 100vw; background-position: right 0 top 0;">
        <div style="background-color: rgba(0, 0, 0, 0.6); height: 100%">
            <div class="spacer"></div>
            <div id="login-form-box" class="vertical-centered">

                <div>

                    <div class="login-header">

                        <img src="logo/logowide.svg"
                             style="width: 45%; min-width: 200px">

                        <div v-if="$route.query.redirect && !error" class="error-banner">
                            <p><i class="fas fa-exclamation-circle" style="color: #f27474"></i> You need to login first.</p>
                        </div>

                        <div v-if="$route.query.message && !error" class="error-banner">
                            <p><i class="fas fa-exclamation-circle" style="color: #f27474"></i> {{$route.query.message}}</p>
                        </div>

                        <div v-if="error" class="error-banner">
                            <p><i class="fas fa-exclamation-circle" style="color: #f27474"></i> {{error}}</p>
                        </div>

                    </div>

                    <div id="login-form-elements">
                        <form @submit.prevent="login">
                            <label>Email</label>
                            <input class="form-control" v-model="email" placeholder="hacker@hackermail.io" type="email" autofocus required>

                            <label>Password</label>
                            <input class="form-control" v-model="pass" placeholder="5up3r53cr3tp455w0rd" type="password" required><br>

                            <div id="button-row">
                                <button class="generic-button-dark" type="submit">
                                    Sign In
                                </button>

                                <router-link to="/register" v-if="settings.registrationOpen">
                                    <button class="generic-button-dark">Register</button>
                                </router-link>
                            </div>

                            <br>

                            <router-link to="/reset">
                                <p id="forget-button">Forget your password?</p>
                            </router-link>
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
