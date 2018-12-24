<template>
    <div class="app-screen">
        <div class="spacer"></div>

        <div class="ui-card dash-card vertical-centered">
            <h3><i class="fas fa-lock"></i> Change Password</h3>

            <hr>

            <p><b>Warning: </b> All other active session tokens will be revoked</p>

            <p v-if="error" class="error">{{error}}</p>

            <div id="login-form-elements">
                <form @submit.prevent="changePassword">

                    <input v-model="oldPassword" class="form-control" placeholder="Old Password" type="password" required><br>
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
