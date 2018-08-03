<template>
    <div>
        <h2>Login</h2>
        <p v-if="$route.query.redirect">
            You need to login first.
        </p>
        <form @submit.prevent="login">
            <label><input v-model="email" placeholder="email" autofocus></label>
            <label><input v-model="pass" placeholder="password" type="password"></label><br>
            <button type="submit">login</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>

        <router-link to="/register">Register</router-link>
        <router-link to="/reset">Reset</router-link>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'

    export default {
        data () {
            return {
                email: '',
                pass: '',
                error: false
            }
        },
        methods: {
            login () {
                AuthService.loginWithPassword(this.email, this.pass, (err, data) => {
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
