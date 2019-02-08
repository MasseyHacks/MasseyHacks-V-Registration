<template>
    <div class="app-screen">


        <div class="spacer"></div>
        <div class="container vertical-centered">
            <div class="ui-card dash-card">
                <div>
                    <div v-if="status == 'success'">
                        <h5 style="margin-bottom: 0">Successfully verified!</h5>

                        <br>

                        <router-link to="/application"><button class="generic-button-dark">Start Application</button></router-link>
                    </div>
                    <div v-else-if="status == 'invalid'">
                        <h5 style="margin-bottom: 0">Invalid Token</h5>

                        <br>

                        <router-link to="/"><button class="generic-button-dark">Return to Dashboard</button></router-link>
                    </div>
                    <div v-else>
                        <h5 style="margin-bottom: 0">Loading...</h5>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import AuthService from '../src/AuthService'

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
                    this.status = 'success';

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
