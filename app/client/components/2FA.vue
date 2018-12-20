<template>
    <div class="main main-login" style="background: url('/img/2.jpg') center;background-size: cover; height: 100vh; width: 100vw;">
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered" >
            <h2 class="subtitle">Security Check</h2>
            <p>MasseyHacks Security Policy requires 2 factor authentication to protect the security and privacy of our users.</p>
            <div id="login-form-elements">
                <form @submit.prevent="codeLogin">
                    <input v-model="code" type="number" maxlength=6 autofocus required>
                    <div id="button-row">
                        <button type="submit" class="generic-button-dark">sign in</button>
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
