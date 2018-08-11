<template>
    <div v-if="!token">

<!--         <form @submit.prevent="requestReset">
            <label><input v-model="email" type="email" placeholder="hacker@hackermail.io" autofocus required></label>
            <button type="submit">Submit</button>
            <p v-if="error" class="error">{{error}}</p>
        </form> -->
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <h2 class="subtitle">Request Password Reset</h2>
            <div id="login-form-elements">
                <form @submit.prevent="requestReset">
                    <input v-model="email" placeholder="email" type="email" autofocus required>
                    <div id="button-row">
                        <button type="submit" class="primary-button">request</button>
                        <router-link to="/login"><button>back</button></router-link>
                    </div>
                    <p v-if="error" class="error">{{error}}</p>
                </form>
            </div>
        </div>
    </div>
    <div v-else>
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <h2 class="subtitle">Reset Password</h2>
            <div id="login-form-elements">
                <form @submit.prevent="resetPassword">
                    <input v-model="password1" placeholder="Password" type="password" required>
                    <input v-model="password2" placeholder="Confirm Password" type="password" required>
                    <div class="button-row">
                        <button type="submit">reset</button>
                        <router-link to="/login"><button>cancel</button></router-link>
                    </div>
                    <p v-if="error" class="error">{{error}}</p>
                </form>
            </div>
        </div>
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
                if (this.password1 != this.password2) {
                    this.error = 'Passwords don\'t match!'
                } else {
                    AuthService.resetPasswordWithToken(this.token, this.password1, (err, data) => {
                        if (err) {
                            this.error = err ? err : 'Something went wrong'
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
    }
</script>

<style>
    .error {
        color: red;
    }
</style>
