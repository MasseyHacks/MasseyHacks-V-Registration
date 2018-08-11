<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>DASHBOARD</h2>
                </div>
            </div>
            <div class="row">
                <div class="ui-card" id="dash-card">
                    <h3>YOUR STATUS:</h3>
                    <h4>{{$parent.user.status.name.toUpperCase()}}</h4>
                    <hr>
                    <p><span class="emphasis">Welcome {{$parent.user.status.fullName}},</span>
                        This is the MasseyHacks V Dashboard
                    </p>
                    <hr>
                    <div id="noPerms" v-if="$parent.user.permissions.level == 0">
                        <h4>You still haven't verified your email!</h4>
                        <button class="generic-button" v-on:click="resend">Resend</button>
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
                error: ''
            }
        },
        methods: {
            resend() {
                AuthService.requestVerify((err,data) => {
                    if (err) {
                        this.error = err;
                        swal({
                            title: 'Sorry!',
                            text: 'There was an error!',
                            type: 'error'
                        });
                        swal.close()
                    }
                    else {
                        this.error = null;
                        swal({
                            title: 'Success!',
                            text: 'Another email was sent to ' + $parent.user.email + '!',
                            type: 'success'
                        })
                        swal.close();

                    }
                });
                console.log("SENT");
            }
        }
    }
</script>