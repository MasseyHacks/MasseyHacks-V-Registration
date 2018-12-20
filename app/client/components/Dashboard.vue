<template>
    <div class="app-screen">

        <div class="title-card col-md-12" style="position: absolute; top: 10% !important;">
            <h2>DASHBOARD</h2>
        </div>

        <div class="spacer"></div>
        <div class="container vertical-centered">
            <div class="row">

                <div class="ui-card dash-card" style="text-align: center">
                    <h3>Application Status</h3>


                    <h5>{{user.status.name.toUpperCase()}}</h5>

                    <hr>

                    <div v-if="user.status.name == 'organizer'">
                        <p><b>Hello there fellow organizer, welcome to your administrative dashboard.</b><br>
                            Remember, with great power, comes great responsibility.</p>

                        <hr>

                        <router-link to="/organizer/statistics"><button class="generic-button-dark">Organizer Dashboard</button></router-link>

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
    import Session from '../src/Session'
    import AuthService from '../src/AuthService.js'
    import swal from 'sweetalert2'

    export default {
        data() {
            return {
                user: Session.getUser(),
                error: ''
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
                });
            }
        }
    }
</script>
