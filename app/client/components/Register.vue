<template>
    <div>
        <h2>Register</h2>
        <form @submit.prevent="register">
            <label><input v-model="firstName" placeholder="Master"></label><br>
            <label><input v-model="lastName" placeholder="Hax0r"></label><br>
            <label><input v-model="email" placeholder="hacker@hackermail.io"></label><br>
            <label><input v-model="password1" placeholder="Shhh... super secret" type="password"></label><br>
            <label><input v-model="password2" placeholder="Just to make sure you remember :)" type="password"></label><br>
            <button type="submit">login</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>

        <router-link to="/login">Already have an account? Login here</router-link>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'

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
        methods: {
            register () {
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
</script>

<style>
    .error {
        color: red;
    }
</style>
