<template>
    <div>
        <div class="ui-card dash-card-large">
            <router-link to="/organizer/users"><button class="generic-button-light">Back</button></router-link>
            <p>{{userObj}}</p>
        </div>
    </div>
</template>

<script type="text/javascript">
    import Session     from '../src/Session'
    import AuthService from '../src/AuthService.js'
    import swal        from 'sweetalert2'
    import ApiService  from '../src/ApiService.js'

    export default {
        data() {
            return {
                error : '',
                userID : '',
                userObj : {}
            }
        },

        mounted() {
            this.userID = this.$route.query["username"]
            console.log(this.userID)
            ApiService.getUser(this.userID, (err, data) => {
                if (err || !data) {
                    console.log("ERROR")
                } else {
                    console.log("data2")
                    this.userObj = data
                }
            })
        }

    }
</script>