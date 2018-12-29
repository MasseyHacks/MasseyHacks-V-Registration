<template>
    <div class="app-screen" v-if="!token">

        <div class="spacer"></div>

        <div class="ui-card dash-card vertical-centered">
            <h3><i class="fas fa-lock"></i> Request Password Reset</h3>

            <hr>

            <p v-if="error" class="error">{{error}}</p>

            <div id="login-form-elements">
                <form @submit.prevent="requestReset">

                    <input v-model="email" class="form-control" placeholder="hacker@hackermail.io" type="email" required>
                    <div class="button-row">
                        <button class="generic-button-dark" type="submit">Request</button>
                        <router-link to="/login">
                            <button class="generic-button-dark">Back</button>
                        </router-link>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div v-else="" class="app-screen">

        <div class="spacer"></div>

        <div class="ui-card dash-card vertical-centered">
            <h3><i class="fas fa-lock"></i> Change Password</h3>

            <hr>

            <p><b>Warning: </b> All other active session tokens will be revoked</p>

            <p v-if="error" class="error">{{error}}</p>

            <div id="login-form-elements">
                <form @submit.prevent="resetPassword">
                    <input v-model="password1" class="form-control" placeholder="Password" type="password" required><br>
                    <input v-model="password2" class="form-control" placeholder="Confirm Password" type="password" required><br>
                    <div class="button-row">
                        <button class="generic-button-dark" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import swal from 'sweetalert2'

    export default {
        props: {
            token: {
                type: String
            }
        },
        data() {
            return {
                email: '',
                password1: '',
                password2: '',
                error: false
            }
        },
        methods: {
            requestReset() {
                AuthService.requestReset(this.email, (err, data) => {
                    if (err) {
                        this.error = err
                    } else {
                        this.error = null;

                        swal({
                            title: 'Success!',
                            text: 'An email was sent to ' + this.email + '!',
                            type: 'success'
                        }).then(() => {
                            this.$router.replace('/login')
                        })

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
                            this.error = null;

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
