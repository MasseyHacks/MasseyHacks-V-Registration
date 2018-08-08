<template>
    <div>
        <h2>Register</h2>
        <!--
        <form @submit.prevent="register">
            <label><input v-model="firstName" placeholder="Master" required autofocus></label><br>
            <label><input v-model="lastName" placeholder="Hax0r" required></label><br>
            <label><input v-model="email" placeholder="hacker@hackermail.io" required></label><br>
            <label><input v-model="password1" placeholder="Shhh... super secret" type="password" required></label><br>
            <label><input v-model="password2" placeholder="Just to make sure you remember :)" type="password" required></label><br>
            <button type="submit">login</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>-->
        <div id="login-form-box">
            <h2 class="subtitle">Registration System</h2>
            <div id="login-form-elements">
                <form @submit.prevent="register">
                    <input v-model="firstName" placeholder="First Name" autofocus required>
                    <input v-model="lastName" placeholder="Last Name" required>
                    <input v-model="email" placeholder="Email" type="email" required>
                    <input v-model="password1" placeholder="Password" type="password" required>
                    <input v-model="password2" placeholder="Confirm Password" type="password" required>
                    <button type="submit">login</button>
                    <p v-if="error" class="error">{{error}}</p>
                </form>
            </div>
        </div>

        <router-link to="/login">Already have an account? Login here</router-link>
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
