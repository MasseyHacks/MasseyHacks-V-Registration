<template>
    <div class="main main-login" style="background: url('/img/2.jpg') center;background-size: cover; min-height: 800px; height: 100vh; width: 100vw; background-position: right 0 top 0;">
        <div style="background-color: rgba(0, 0, 0, 0.6); height: 100%">
            <div class="register-spacer"></div>
            <div id="login-form-box" class="vertical-centered">
                <div>

                    <div class="login-header">

                        <img src="logo/logowide.svg"
                             style="width: 45%; min-width: 200px">

                        <div v-if="error" class="error-banner">
                            <p><i class="fas fa-exclamation-circle" style="color: #f27474"></i> {{error}}</p>
                        </div>

                    </div>

                    <div id="login-form-elements">
                        <form @submit.prevent="register">

                            <label>First Name</label>
                            <input class="form-control" v-model="firstName" placeholder="Hax0r" autofocus required>

                            <label>Last Name</label>
                            <input class="form-control" v-model="lastName" placeholder="M4ast3r" required>

                            <label>Email</label>
                            <input class="form-control" v-model="email" placeholder="hacker@hackermail.io" type="email" required>

                            <label>Password</label>
                            <input class="form-control" v-model="password1" placeholder="5up3r53cr3tp455w0rd" type="password" required>

                            <label>Confirm Password</label>
                            <input class="form-control" v-model="password2" placeholder="5up3r53cr3tp455w0rd" type="password" required><br>


                            <div id="button-row">
                                <button class="generic-button-dark" type="submit">
                                    Register
                                </button>

                                <router-link to="/login">
                                    <button class="generic-button-dark">Back</button>
                                </router-link>
                            </div>

                            <br>

                        </form>
                    </div>
                </div>
            </div>
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
