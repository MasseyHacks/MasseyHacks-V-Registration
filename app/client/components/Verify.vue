<template>
    <div>
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">
            <div id="login-form-elements">
                <div v-if="status == 'success'">
                    <p>Success!</p>
                </div>
                <div v-else-if="status == 'invalid'">
                    <p>Invalid Token</p>
                </div>
                <div v-else>
                    <p>Loading...</p>
                </div>
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
                status: 'loading'
            }
        },
        created() {
            AuthService.verify(this.token, (err) => {
                if (err) {
                    this.status = 'invalid'
                } else {
                    this.status = 'success'

                    AuthService.refreshToken() // Update dashboard status
                }
            })
        }
    }
</script>

<style>
    .error {
        color: red;
    }
</style>
