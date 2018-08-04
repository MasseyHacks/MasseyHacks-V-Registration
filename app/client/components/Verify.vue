<template>
    <div v-if="status == 'success'">
        <h1>Success!</h1>
    </div>
    <div v-else-if="status == 'invalid'">
        <h1>Token is invalid.</h1>
    </div>
    <div v-else>
        <h1>Loading...</h1>
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

                    if (Session.loggedIn()) {
                        AuthService.loginWithToken(Session.getToken())
                    }
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
