<template>
    <div id="main">
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <p v-if="$route.query.redirect">
                You need to login first.
            </p>

            <h2 class="subtitle">Login</h2>
            <div id="login-form-elements">
                <form @submit.prevent="login">
                    <input v-model="email" placeholder="email" type="email" autofocus required>
                    <input v-model="pass" placeholder="password" type="password" required><br>

                    <div id="button-row">
                        <button type="submit" class="primary-button">sign in</button>
                        <router-link to="/register" v-if="settings.registrationOpen"><button>register</button></router-link>
                        <router-link to="/reset"><button>reset</button></router-link>
                    </div>

                    <p v-if="error" class="error">{{error}}</p>

                    <br>

                    <vue-recaptcha
                            v-bind:sitekey="key"
                            ref="recaptchaSiteKey"
                            @verify="onCaptchaVerified"
                            @expired="onCaptchaExpired"
                            size="invisible">
                    </vue-recaptcha>
                </form>
            </div>
        </div>

    </div>
</template>

<script>
    import AuthService  from '../src/AuthService'
    import Session      from '../src/Session'
    import VueRecaptcha from 'vue-recaptcha'

    export default {
        components: {
            VueRecaptcha
        },

        data () {
            return {
                recaptchaSiteKey: RECAPTCHA_SITE_KEY,
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
            onCaptchaVerified: function(recaptchaToken) {
                this.$refs.recaptcha.reset();

                AuthService.loginWithPassword(this.email, this.pass, recaptchaToken, (err, data) => {
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
            },

            login () {
                this.$refs.recaptcha.execute()
            },

            onCaptchaExpired: function () {
                this.$refs.recaptcha.reset();
            }
        }
    }
</script>

<style>
    .error {
        color: red;
    }
</style>
