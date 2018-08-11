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
                    <hr>
                    <p><span class="emphasis">Welcome {{$parent.user.fullName}},</span><br>
                        This is the MasseyHacks V Dashboard
                    </p>
                    <hr>
                    <div id="noPerms" v-if="$parent.user.permissions.level == 0">
                        <h4>You still haven't verified your email!</h4>
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
                            text: 'Another email was sent to ' + this.$parent.user.email + '!',
                            type: 'success'
                        })
                    }
                });;
            }
        }
    }
</script>