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
                        <p>
                            Your application is still incomplete.<br><br><b>You must complete your application before the submission deadline of {{moment(settings.timeClose)}} to be considered.</b>
                        </p>
                    </div>
                    <div v-else-if="user.status.name == 'submitted'">
                        <p>
                            You have successfully submitted your application! Our team is working hard on reviewing applications, so please be patient and check your email (including spam) often for updates!
                        </p>
                    </div>
                    <div v-else-if="user.status.name == 'admitted'">
                        <p>
                            You have been accepted! Don't get excited just yet, you still need to confirm here, or your chance will fly away!<br><br><b>You must confirm before {{moment(user.status.confirmBy)}}.</b>
                        </p>
                        <router-link to="/confirmation">
                            <button class="generic-button-dark less-wide">
                                Confirm your spot!
                            </button>
                        </router-link>
                        <button class="generic-button-dark less-wide" v-on:click="declineInvitation">Sorry, I can't make it</button>
                    </div>
                    <div v-else-if="user.status.name == 'confirmed'">
                        <p>
                            Your spot has been confirmed! We hope to see you on  March 23rd, ready and excited for 24 hours of hard work and fun! It's never too early to start thinking about your hack! <a href="https://masseyhacks4.devpost.com" target="_blank">Here</a> are some of last year's hacks for inspiration.<br><br>Don’t forget, you <b>MUST</b> have your waiver signed to attend MasseyHacks.<br><br>
                            We've sent a Slack invitation to <b>{{user.email}}</b>. Be sure to check your spam/junk folder if you don't see it! If you have any problems, please email us at hello@masseyhacks.ca for assistance.
                        </p>

                        <a href="https://masseyhacks.ca/files/waiver.pdf?usp=sharing" target="_blank">
                            <button class="generic-button-dark less-wide">
                                Waiver
                            </button>
                        </a>
                        <router-link to="/confirmation">
                            <button class="generic-button-dark less-wide">
                                Edit Confirmation
                            </button>
                        </router-link>
                        <button class="generic-button-dark less-wide" v-on:click="declineInvitation">Sorry, I can't make it</button>
                    </div>
                    <div v-else-if="user.status.name == 'rejected'">
                        <p>
                            Your application was strong, but unfortunately we are unable to offer you a spot at MasseyHacks. Thank you for applying to MasseyHacks V.
                        </p>
                    </div>
                    <div v-else-if="user.status.name == 'waitlisted'">
                        <p>
                            Your application for MasseyHacks was strong, but unfortunately, due to overwhelming interest in the event, you have been placed on the waiting list. Don’t worry; we will notify you immediately when a spot opens up for you. Thank you for applying to MasseyHacks V!
                        </p>
                    </div>
                    <div v-else-if="user.status.name == 'declined'">
                        <p>
                            We’re sorry to hear that you won’t be attending, but don’t worry, we won’t take it personally. Or will we?
                            <br>
                            <br>
                            All jokes aside, we thank you for applying, and we hope that you will be able to make it next time.
                        </p>
                    </div>
                    <div v-else-if="user.status.name == 'checkedin'">
                        <p>
                            Welcome to MasseyHacks! If you have any questions or concerns, feel free to speak to an organizer.
                        </p>
                    </div>
                    <!-- unverified -->
                    <div v-else-if="!user.permissions.verified">
                        <p>Hey! You haven't verified your email! You must do this before you can apply to MasseyHacks.<br><br>We sent an email to <b>{{user.email}}</b>! Please be sure to check your spam/junk folders.</p>
                        <button class="generic-button-dark less-wide" v-on:click="resendVerify">Resend</button>
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
    import moment from 'moment'

    export default {
        data() {
            return {
                user: Session.getUser(),
                settings: Session.getSettings(),
                error: ''
            }
        },
        methods: {
            declineInvitation() {
                swal({
                    title: "Decline invitation?",
                    html: "Are you sure you want to decline your invitation? You <b>CANNOT</b> undo this action!",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    focusCancel: true,
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.sendRequest('POST', '/api/declineInvitation', {

                        }, (err, data) => {
                            if (err || !data) {
                                swal("Error", err.error, "error");
                            } else {
                                swal({
                                    title: "Success",
                                    text: "You have declined your invitation.",
                                    type: "success"
                                });
                                this.user = data
                                Session.setUser(data)
                            }

                        })
                    }

                })
            },
            moment (date) {
                return moment(date).format('LLLL')
            },
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
