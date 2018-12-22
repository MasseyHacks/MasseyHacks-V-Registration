<template>
    <div class="app-screen">

        <div class="title-card col-md-12" style="position: absolute; top: 10% !important;">
            <h2>CONFIRMATION</h2>
        </div>

        <div class="spacer"></div>
        <div class="container vertical-centered">
            <div class="ui-card dash-card">
                <div>
                    <button class="generic-button" v-on:click="acceptInvitation">Confirm</button>
                    <button class="generic-button" v-on:click="denyInvitation">Deny</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import Session from '../src/Session'
    import AuthService from '../src/AuthService'
    import swal from 'sweetalert2'

    export default {
        data() {
            return {
                user: Session.getUser()
            }
        },
        methods: {
            acceptInvitation() {
                swal({
                    title: "Hey!",
                    text: "Are you sure you want to accept your invitation?",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.sendRequest('POST', '/api/acceptInvitation', {

                        }, (err, data) => {
                            if (err || !data) {
                                swal("Error", err.error, "error");
                            } else {
                                swal({
                                    title: "Success",
                                    text: "You have confirmed your spot!",
                                    type: "success"
                                });
                                this.user = Session.getUser()
                                console.log(this.user.status.name);
                            }

                        })
                    }

                })
            },
            denyInvitation() {
                swal({
                    title: "Hey!",
                    text: "Are you sure you want to decline your invitation?",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
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
                                this.user = Session.getUser()
                            }

                        })
                    }

                })
            }
        }
    }
</script>
