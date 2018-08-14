<template>
    <div id="main">
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <h2 class="subtitle">2FA</h2>
            <div id="login-form-elements">
                <form @submit.prevent="codeLogin">
                    <input v-model="code" placeholder="123456" type="number" autofocus required>
                    <img v-bind:src="qr"/>
                    <div id="button-row">
                        <button type="submit" class="primary-button">sign in</button>
                    </div>
                    <p v-if="error" class="error">{{error}}</p>
                </form>
            </div>
        </div>

    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session     from '../src/Session'

    export default {
        data () {
            return {
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
                AuthService.loginWithCode(this.code, (err, data) => {
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
