<template>
    <div class="app-screen">
        <div class="spacer content-spacer"></div>

        <div class="ui-card dash-card vertical-centered content-vertical-centered" style="margin-top: 10px; margin-bottom: 10px">
            <h3><i class="fas fa-lock"></i> Change Password</h3>

            <hr>

            <p><b>Warning: </b> All other active session tokens will be revoked</p>

            <p v-if="error" class="error">{{error}}</p>

            <div id="login-form-elements">
                <form @submit.prevent="changePassword">

                    <div style="text-align: left">

                        <label>Old Password</label>
                        <input v-model="oldPassword" class="form-control" placeholder="0ldp455w0rd" type="password" required>

                        <label>New Password</label>
                        <input v-model="password1" class="form-control" placeholder="n3wp455w0rd" type="password" required>

                        <label>Confirm Password</label>
                        <input v-model="password2" class="form-control" placeholder="n3wp455w0rd" type="password" required><br>

                    </div>
                    <div >
                        <button class="generic-button-dark less-wide" type="submit">Save</button>
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
        data() {
            return {
                oldPassword: '',
                password1: '',
                password2: '',
                error: false
            }
        },
        methods: {
            changePassword() {
                if (this.password1 != this.password2) {
                    this.error = 'Passwords don\'t match!'
                } else {
                    AuthService.changePassword(this.oldPassword, this.password1, (err, data) => {
                        if (err) {
                            this.error = err ? err : 'Something went wrong'
                        } else {
                            this.error = null;

                            swal({
                                title: 'Success!',
                                text: 'Password changed!',
                                type: 'success'
                            });

                            this.$router.replace('/login')
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
