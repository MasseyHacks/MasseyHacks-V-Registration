<template>
    <div>
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <h2 class="subtitle">Registration System</h2>
            <div id="login-form-elements">
                <form @submit.prevent="register">
                    <input v-model="firstName" placeholder="First Name" autofocus required>
                    <input v-model="lastName" placeholder="Last Name" required>
                    <input v-model="email" placeholder="Email" type="email" required>
                    <input v-model="password1" placeholder="Password" type="password" required>
                    <input v-model="password2" placeholder="Confirm Password" type="password" required>
                    <button type="submit">register</button>
                    <router-link to="/login"><button>u has account? login</button></router-link>

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
                    this.error = 'Error: Passwords don\'t match!'
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
