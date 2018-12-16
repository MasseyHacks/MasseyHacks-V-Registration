<template>
    <div class="app-screen">
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <h2 class="subtitle" style="padding-top:8px;"><i class="fas fa-lock"></i> Change Password</h2>

            <p><b>Warning: </b> All other active session tokens will be revoked</p>

            <p v-if="error" class="error">{{error}}</p>

            <div id="login-form-elements">
                <form @submit.prevent="changePassword">
                    <input v-model="oldPassword" placeholder="Old Password" type="password" required>
                    <input v-model="password1" placeholder="Password" type="password" required>
                    <input v-model="password2" placeholder="Confirm Password" type="password" required>
                    <div class="button-row">
                        <button type="submit" class="primary-button">Save</button>
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
