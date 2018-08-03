<template>
    <div v-if="!token">
        <h2>Request Password Reset</h2>

        <form @submit.prevent="requestReset">
            <label><input v-model="email" placeholder="email" autofocus></label>
            <button type="submit">Submit</button>
            <p v-if="error" class="error">{{error}}</p>
        </form>

        <router-link to="/login">Login</router-link>
    </div>
    <div v-else>
        <h2>Password Reset</h2>

        <form @submit.prevent="requestReset">
            <label><input v-model="email" placeholder="email" autofocus></label>
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
                        }).then(result => {
                            this.$router.replace('/login')
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
