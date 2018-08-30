<template>
    <div class="app-screen">
        <div class="spacer"></div>
        <div class="container vertical-centered">
            <div class="row">
                <div class="ui-card dash-card" style="text-align: center">
                    <h3>Application Status</h3>

                    <div style="display: inline-block; border-radius: 10px; height: 20px; width: 80%; max-width: 300px ; border-color: black; border-style: solid; border-width: 2px; alignment: center; overflow: hidden; z-index: 100">
                        <div style="background-image: linear-gradient(135deg, #4bc2e4 0%, #085fae 100%); height: 100%; z-index: 200" v-bind:style="{width:stepsCompleted+'%'}"></div>
                    </div>

                    <h4>{{user.status.name.toUpperCase()}}</h4>

                    <hr>

                    <div v-if="user.status.name == 'organizer'">
                        <p><b>Hello there fellow organizer, welcome to your administrative dashboard.</b><br>
                            Remember, with great power, comes great responsibility.</p>
                    </div>
                    <div v-else-if="user.status.name == 'incomplete'">
                        u need to finish app
                    </div>
                    <div v-else-if="user.status.name == 'submitted'">
                        now u wait for us to review
                    </div>
                    <div v-else-if="user.status.name == 'admitted'">
                        yey u in

                        <router-link to="/confirmation">Confirm your spot!</router-link>
                    </div>
                    <div v-else-if="user.status.name == 'confirmed'">
                        yey u confirmed
                    </div>
                    <div v-else-if="user.status.name == 'rejected'">
                        lol u rejec
                    </div>
                    <div v-else-if="user.status.name == 'waitlisted'">
                        lol we waitlist u
                    </div>
                    <div v-else-if="user.status.name == 'declined'">
                        sad u not able to come :'(
                    </div>
                    <div v-else-if="user.status.name == 'checkedin'">
                        i c u are at event rn
                    </div>
                    <!-- unverified -->
                    <div v-else-if="!user.permissions.verified">
                        <p>You still haven't verified your email!</p>
                        <button class="generic-button" v-on:click="resendVerify">Resend</button>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Session     from '../src/Session'
    import AuthService from '../src/AuthService.js'
    import swal        from 'sweetalert2'

    export default {
        data() {
            return {
                user: Session.getUser(),
                error: '',
                stepsCompleted: 50
            }
        },
        methods: {
            resendVerify() {
                AuthService.requestVerify((err,data) => {
                    if (err) {
                        this.error = err;
                        swal({
                            title: 'Sorry!',
                            text: 'There was an error!',
                            type: 'error'
                        });
                    }
                    else {
                        this.error = null;
                        swal({
                            title: 'Success!',
                            text: 'Another email was sent to ' + this.user.email + '!',
                            type: 'success'
                        })
                    }
                });;
            }
        }
    }
</script>
