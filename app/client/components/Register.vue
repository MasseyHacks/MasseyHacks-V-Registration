<template>
    <div>
        <h2>Register</h2>
        <form @submit.prevent="login">
            <label><input v-model="email" placeholder="email"></label>
            <label><input v-model="pass" placeholder="password" type="password"></label><br>
            <button type="submit">login</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>
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
