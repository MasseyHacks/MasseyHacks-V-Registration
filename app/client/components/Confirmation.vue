<template>
    <div class="app-screen">

        <div class="title-card col-md-12" style="position: absolute; top: 10% !important;">
            <h2>CONFIRMATION</h2>
        </div>

        <div class="spacer"></div>
        <div class="container vertical-centered">
            <div class="ui-card dash-card">
                <div v-if="user.status.confirmed">
                    <p>You are already confirmed</p>

                    <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
                    <button v-on:click="submitFile()">Submit</button>

                    <img :src="waiver" width="500px">
                </div>
                <div v-else-if="user.status.declined">
                    <p>You declined your invitation :(</p>
                </div>
                <div v-else>
                    <button class="generic-button" v-on:click="acceptInvitation">Confirm</button>
                    <button class="generic-button" v-on:click="denyInvitation">Decline</button>
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
                user: Session.getUser(),
                waiver: '',
                file: ''
            }
        },
        mounted() {

            /*
            AuthService.sendRequest('GET', '/api/getResourceAuthorization?filename=asdsad-waiver-wtf.jpg', {}, (err, msg) => {
                if (err) {
                    console.log(err)
                } else {
                    this.waiver = msg
                }
            });*/

        },
        methods: {
            handleFileUpload() {
                this.file = this.$refs.file.files[0];
            },
            submitFile() {
                let formData = new FormData();

                console.log(this.file)

                formData.append('file', this.file);
                formData.append('id', Session.getUserID());

                console.log('DIS IS FORM', formData.get('file'))

                AuthService.sendRequest('POST', '/api/uploadWaiver', formData, (err, msg) => {
                   console.log(err, msg)
                }, 'multipart/form-data; charset=utf-8');

            },
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
                                this.user = data
                                Session.setUser(data)
                                console.log(this.user.status.name);

                                swal({
                                    title: "Success",
                                    text: "You have confirmed your spot!",
                                    type: "success"
                                });
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
