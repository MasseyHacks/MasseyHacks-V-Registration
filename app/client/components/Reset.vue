<template>
    <div class="app-screen" v-if="!token">
        <div class="main main-login" style="background: url('/img/2.jpg') center;background-size: cover; height: 100vh; width: 100vw; background-position: right 0 top 0;">
            <div style="background-color: rgba(0, 0, 0, 0.6); height: 100%">
                <div class="spacer"></div>
                <div id="login-form-box" class="vertical-centered">
                    <h3><i class="fas fa-lock"></i> Request Password Reset</h3>

                    <div v-if="error" class="error-banner">
                        <p><i class="fas fa-exclamation-circle" style="color: #f27474"></i> {{error}}</p>
                    </div>

                    <br>

                    <div id="login-form-elements">
                        <form @submit.prevent="requestReset">


                            <div style="text-align: left">
                                <label>Email</label>
                                <input v-model="email" class="form-control" placeholder="hacker@hackermail.io" type="email" required>
                            </div>
                            <br>

                            <div >
                                <button class="generic-button-dark" type="submit">Request</button>
                                <router-link to="/login">
                                    <button class="generic-button-dark">Back</button>
                                </router-link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="loggedIn" class="app-screen">

        <div class="spacer"></div>

        <div class="ui-card dash-card vertical-centered">
            <h3><i class="fas fa-lock"></i> Change Password</h3>

            <hr>

            <p><b>Warning: </b> All other active session tokens will be revoked</p>

            <p v-if="error" class="error">{{error}}</p>

            <div id="login-form-elements">
                <form @submit.prevent="resetPassword">

                    <div style="text-align: left">

                        <label>Password</label>
                        <input v-model="password1" class="form-control" placeholder="5up3r53cr3tp455w0rd" type="password" required>

                        <label>Confirm Password</label>
                        <input v-model="password2" class="form-control" placeholder="5up3r53cr3tp455w0rd" type="password" required><br>

                    </div>
                    <div>
                        <button class="generic-button-dark" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

     <div v-else="" class="main main-login" style="background: url('/img/2.jpg') center;background-size: cover; height: 100vh; width: 100vw; background-position: right 0 top 0;">
        <div style="background-color: rgba(0, 0, 0, 0.6); height: 100%">
            <div class="spacer"></div>
            <div id="login-form-box" class="vertical-centered">
                <div>

                    <div class="login-header">

                        <h3><i class="fas fa-lock"></i> Change Password</h3>

                        <p><b>Warning: </b> All other active session tokens will be revoked</p>

                        <div v-if="error" class="error-banner">
                            <p><i class="fas fa-exclamation-circle" style="color: #f27474"></i> {{error}}</p>
                        </div>

                    </div>

                    <div id="login-form-elements">
                        <form @submit.prevent="resetPassword">

                            <label>Password</label>
                            <input v-model="password1" class="form-control" placeholder="5up3r53cr3tp455w0rd" type="password" required>

                            <label>Confirm Password</label>
                            <input v-model="password2" class="form-control" placeholder="5up3r53cr3tp455w0rd" type="password" required><br>

                            <div id="button-row">
                                <button class="generic-button-dark" type="submit">Save</button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<script>
    import AuthService from '../src/AuthService'
    import swal from 'sweetalert2'
    import Session from '../src/Session'

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
                error: false,
                loggedIn: Session.loggedIn()
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
