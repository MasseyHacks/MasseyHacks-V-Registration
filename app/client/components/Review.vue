<template>
    <div>
        <div class="row">
            <div class="ui-card dash-card-large" id="users-table">
                <div v-if="reviewingApplications">
                    <h2>Reviewing Application</h2>
                    <div v-html="this.reviewBody"></div>
                    <button v-on:click="stopReview" class="generic-button-light">Exit</button>
                    <button v-on:click="nextApplication" class="generic-button-light">Next</button>
                </div>

                <div v-else>
                    <div v-if="applicationsLeft > 1"><h2>There are {{this.applicationsLeft}} applications remaining</h2></div>
                    <div v-else-if="applicationsLeft == 1"><h2>There is {{this.applicationsLeft}} application left</h2></div>
                    <button v-on:click="startReview" class="generic-button-light">
                        <span v-if="applicationsLeft < 1">No Applications!</span>
                        <span v-else>Start reviewing!</span></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import $ from 'jquery';
    import swal from 'sweetalert2'

    export default {
        data() {
            return {
                page: 1,
                totalPages: 1,
                filters: [],
                searchQuery: '',
                loading: true,
                applicationsLeft: 0,
                reviewingApplications: false,
                err: '',
                currentApplication: {},
                reviewBody: '',
                userTimes: [],
                users: {},
                user: null
            }
        },
        beforeMount() {
            this.user = Session.getUser();
            console.log(this.user);
            ApiService.getUsers({ page: 1, size: 10000, filter: {
                $and:[{
                    'status.admitted': false,
                    'status.rejected': false,
                    'status.waitlisted': false,
                    'status.submittedApplication': true,
                    applicationVotes: {$nin: [this.user.email]}
                }]}}, (err, data) => {

                if (err || !data) {
                    this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                } else {
                    this.applicationsLeft = Object.keys(data.users).length;
                    this.users = data;
                    console.log('data');
                    console.log(Object.assign({}, data))
                }
            });

        },
        methods : {
            startReview: function(){
                if(this.applicationsLeft > 0 || true){
                    console.log("Starting!");
                    this.reviewingApplications = true;

                    var userTimesList = [];
                    this.users.users.forEach((user) =>{
                        userTimesList.push([user.id,user.lastUpdated,user.profile]);
                    });

                    console.log(userTimesList);
                    userTimesList.sort(function(a, b) {
                        return a[1] - b[1];
                    });
                    this.userTimes = userTimesList;
                    this.nextApplication(false);

                    //assemble the application array in order!
                    /*
                    ApiService.getUsers({ page: this.page, size: 100 }, (err, data) => {
                        if (err || !data) {
                            this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                        } else {
                            this.users = data.users;
                            console.log(data.users);
                            var userTimesList = [];
                            data.users.forEach(function(user){
                                if(!user.status.admitted){
                                    console.log(user.lastUpdated);
                                    userTimesList.push([user.id,user.lastUpdated,user.profile]);
                                }
                            });
                            console.log(userTimesList);
                            userTimesList.sort(function(a, b) {
                                return a[1] - b[1];
                            });
                            this.userTimes = userTimesList;
                            this.nextApplication(false);
                        }
                    });*/
                }
            },
            stopReview: function(){
                if(this.reviewingApplications){
                    this.reviewingApplications = false;
                }
            },
            nextApplication: function(shift = true){
                if(shift){
                    this.userTimes.shift();
                }

                if(this.userTimes.length < 1){
                    swal("Information","There are no more applications","info");
                    this.applicationsLeft = 0;
                    this.stopReview();
                }
                else{
                    var application = this.userTimes[0][2]["hacker"];

                    this.reviewBody = '';
                    Object.keys(application).forEach((field) => {
                        this.reviewBody+='<BR>'+field+' '+application[field];
                    });
                    console.log(application);
                }

            },
            applicationVote: function(vote){
                if(vote == "admit"){

                }
                else if(vote == "reject"){

                }
            },
            switchPage: function(page) {
                this.page = page
            }
        }
    }
</script>