<template>
    <div class="app-screen">

        <div class="spacer">
            <!--
            <div class="title-card col-md-12">
                <h2>DASHBOARD</h2>
            </div>-->
        </div>
        <div id="dashboard" class="container vertical-centered">
            <div class="row">

                <div class="ui-card dash-card dash-card-medium" style="text-align: center">
                    <h3>Application Status</h3>

                    <h5 v-if="user.permissions.owner && !user.permissions.developer">SUPREME LEADER</h5>
                    <h5 v-else>{{user.status.name.toUpperCase()}}</h5>

                    <hr>

                    <div v-if="user.permissions.owner && !user.permissions.developer">
                        <p>All hail the king!</p>

                        <hr>

                        <router-link to="/organizer/statistics"><button class="generic-button-dark less-wide">Kingdom Overview</button></router-link>

                    </div>

                    <div v-else-if="user.status.name == 'organizer'">
                        <p><b>Hello there fellow organizer, welcome to your administrative dashboard.</b><br>
                            Remember, with great power, comes great responsibility.</p>

                        <hr>

                        <router-link to="/organizer/statistics"><button class="generic-button-dark less-wide">Organizer Dashboard</button></router-link>

                    </div>
                    <div v-else-if="user.status.name == 'incomplete'">
                        Your application is still incomplete. You must complete your application before the submission deadline of {date} to be considered.
                    </div>
                    <div v-else-if="user.status.name == 'submitted'">
                        You have successfully submitted your application! Our team is working hard on reviewing applications, so please be patient and check your email (including spam) often for updates!
                    </div>
                    <div v-else-if="user.status.name == 'admitted'">
                        You are admitted! Don't get excited just yet, you still need to confirm here, or your chance will fly away! You must confirm before {date}.
                        <router-link to="/confirmation">Confirm your spot!</router-link>
                    </div>
                    <div v-else-if="user.status.name == 'confirmed'">
                        Your spot has been confirmed! We hope to see you on  March 23rd, ready and excited for 24 hours of hard work and fun! Don’t forget to sign the waiver form in order to be admitted. It's never too early to start thinking about your hack! Here are some of last year's hacks for inspiration.
                    </div>
                    <div v-else-if="user.status.name == 'rejected'">
                        Your application was strong, but unfortunately we are unable to offer you a spot at MasseyHacks. Thank you for applying to MasseyHacks V.
                    </div>
                    <div v-else-if="user.status.name == 'waitlisted'">
                        Your application for MasseyHacks was strong, but unfortunately, due to overwhelming interest in the event, you have been placed on the waiting list. Don’t worry; we will notify you immediately when a spot opens up for you. Thank you for applying to MasseyHacks V!
                    </div>
                    <div v-else-if="user.status.name == 'declined'">
                        We’re sorry to hear that you won’t be attending, but don’t worry, we won’t take it personally. Or will we?
                        <br>
                        <br>
                        All jokes aside, we thank you for applying, and we hope that you will be able to make it next time.
                    </div>
                    <div v-else-if="user.status.name == 'checkedin'">
                        Welcome to MasseyHacks! If you have any questions or concerns, feel free to speak to an organizer.
                    </div>
                    <!-- unverified -->
                    <div v-else-if="!user.permissions.verified">
                        <p>You have not verified your email. You need to verify your email in order to apply for this event.</p>
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
