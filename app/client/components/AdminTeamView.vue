<template>
    <div>
        <div class="ui-card dash-card-large">
            <h3>{{teamObj.name}}</h3>
            <div id="detailed-info" style="column-count: 2; column-width: 300px;">
                <ul style="list-style: none">
                    <li v-for="member in teamObj.memberNames" style="overflow-wrap: break-word; text-align: left;">
                        <router-link :to="{path: '/organizer/userview?username='+member.id+'&returnPath=/organizer/teamview', params: {username: member.id}}">
                            {{member.name}}
                        </router-link>
                        <i class="fa fa-remove" style="color:red" :onclick="removeUser(id)"></i>
                    </li>
                </ul>
            </div>
            <hr>

            <router-link :to="{path: returnPath}"><button class="generic-button-dark">Back</button></router-link>
            <button class=generic-button-dark v-on:click="acceptTeam">Force Admit</button>
            <button class=generic-button-dark v-on:click="rejectTeam">Force Reject</button>

            <button class=generic-button-dark v-on:click="deleteTeam">Delete Team</button>
        </div>
    </div>
</template>

<script type="text/javascript">
    import Session from '../src/Session'
    import swal from 'sweetalert2'
    import ApiService from '../src/ApiService.js'

    export default {
        data() {
            return {
                user: Session.getUser(),
                error : '',
                teamCode: '',
                teamObj: [],
                returnPath: "/organizer/users",
            }
        },

        beforeMount() {
            if (this.$route.query["returnPath"]) {
                this.returnPath = this.$route.query["returnPath"]
            }

            this.teamCode = this.$route.query["code"];
            ApiService.getTeamByCode(this.teamCode, (err, data) => {
                if (err || !data) {
                    console.log("ERROR")
                } else {
                    console.log("data2");
                    this.teamObj = data;
                }
            })
        },

        mounted() {

        },

        methods: {
            removeUser(id) {
                console.log(id);
            },
            deleteTeam() {
                swal({
                    title: 'Warning',
                    type: 'warning',
                    text: 'This action is irreversible! Are you sure you want to delete this team',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading();

                        ApiService.deleteTeam(this.teamCode, (err, data) => {
                            if (err) {
                                swal({
                                    title: "Warning",
                                    type: 'danger',
                                    text: 'Unable to delete team'
                                })
                            } else {
                                swal({
                                    title: "Success",
                                    type: 'success',
                                    text: 'Team has been deleted'
                                }).then(() => {
                                    this.$router.push({path: this.returnPath});
                                })
                            }
                        })
                    }
                })
            },
            acceptTeam() {
                swal({
                    title: 'Warning',
                    type: 'warning',
                    text: 'Are you sure you want to admit this team',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading();

                        ApiService.acceptTeam(this.teamCode, (err, data) => {
                            if (err) {
                                swal({
                                    title: "Warning",
                                    type: 'danger',
                                    text: 'Unable to admit team'
                                })
                            } else {
                                swal({
                                    title: "Success",
                                    type: 'success',
                                    text: 'Team has been admitted'
                                })
                            }
                        })
                    }
                })
            },
            rejectTeam() {
                swal({
                    title: 'Warning',
                    type: 'warning',
                    text: 'Are you sure you want to reject this team',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading();

                        ApiService.rejectTeam(this.teamCode, (err, data) => {
                            if (err) {
                                swal({
                                    title: "Warning",
                                    type: 'danger',
                                    text: 'Unable to reject team'
                                })
                            } else {
                                swal({
                                    title: "Success",
                                    type: 'success',
                                    text: 'Team has been rejected'
                                })
                            }
                        })
                    }
                })
            }

        }

    }
</script>
