<template>
    <div id="main">
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <h2 class="subtitle">2FA</h2>
            <p style="font-size: 1em">MasseyHacks Security Policy requires 2 factor authentication to protect the security and privacy of our users.</p>
            <div id="login-form-elements">
                <form @submit.prevent="codeLogin">
                    <input v-model="code" type="number" maxlength="6" autofocus required>
                    <img v-bind:src="qr"/>
                    <div id="button-row">
                        <button type="submit" class="primary-button">sign in</button>
                    </div>
                    <p v-if="error" class="error">{{error}}</p>

                    <vue-recaptcha
                            v-bind:sitekey="recaptchaSiteKey"
                            ref="recaptcha"
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
    import AuthService from '../src/AuthService'
    import Session     from '../src/Session'
    import VueRecaptcha from 'vue-recaptcha'
    import Recaptcha    from 'recaptcha'

    /**
     * To-Do: Add Recaptcha fail
     */

    export default {
        components: {
            VueRecaptcha
        },

        data () {
            return {
                recaptchaSiteKey: RECAPTCHA_SITE_KEY,
                code: '',
                qr:Session.getQR(),
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
            codeLogin () {
                this.$refs.recaptcha.execute()
            },

            onCaptchaExpired: function () {
                this.$refs.recaptcha.reset();
            },

            onCaptchaVerified: function(recaptchaToken) {
                this.$refs.recaptcha.reset();

                AuthService.loginWithCode(this.code, recaptchaToken, (err, data) => {
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
