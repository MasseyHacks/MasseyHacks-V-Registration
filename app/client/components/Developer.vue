<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>DEVELOPER</h2>
                </div>
            </div>
            <div class="row">
                <div class="ui-card dash-card">
                    <h3>SERVER LOG</h3>
                    <hr>
                    <span class="emphasis">Welcome {{$parent.user.fullName}},</span><br>
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

<style>
</style>