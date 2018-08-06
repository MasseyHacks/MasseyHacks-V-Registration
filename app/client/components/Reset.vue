<template>
    <div v-if="!token">
        <h2>Request Password Reset</h2>

        <form @submit.prevent="requestReset">
            <label><input v-model="email" type="email" placeholder="hacker@hackermail.io" autofocus required></label>
            <button type="submit">Submit</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>

        <router-link to="/login">Login</router-link>
    </div>
    <div v-else>
        <h2>Password Reset</h2>

        <form @submit.prevent="resetPassword">
            <label><input v-model="password1" type="password" placeholder="Shhh super secret" autofocus></label><br>
            <label><input v-model="password2" type="password"placeholder="Just to make sure you remember :)"></label><br>
            <button type="submit">Change Password</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>

        <router-link to="/login">Login</router-link>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import swal        from 'sweetalert2'

    export default {
        props: {
            token: {
                type: String
            }
        },
        data () {
            return {
                email: '',
                password1: '',
                password2: '',
                error: false
            }
        },
        methods: {
            requestReset () {
                AuthService.requestReset(this.email, (err, data) => {
                    if (err) {
                        this.error = err
                    } else {
                        this.error = null

                        swal({
                            title: 'Success!',
                            text: 'An email was sent to ' + this.email + '!',
                            type: 'success'
                        })

                        this.$router.replace('/login')
                    }
                })
            },
            resetPassword() {
                AuthService.resetPasswordWithToken(this.token, this.password1, (err, data) => {
                    if (err) {
                        this.error = err ? err : 'Error: Something went wrong'
                    } else {
                        this.error = null

                        swal({
                            title: 'Success!',
                            text: 'Password changed!',
                            type: 'success'
                        })
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
