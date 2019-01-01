<template>
    <div style="width: 100%">
        <div class="organizer-card">
            <div class="ui-card dash-card-large" id="users-table">
                <div v-if="loading">
                    Loading...
                </div>
                <div v-else-if="err">
                    {{err}}
                </div>
                <div v-else>
                    <div v-if="reviewingApplications">
                        <h2>Reviewing Application</h2>
                        <div v-html="this.reviewBody"></div>
                        <hr>
                        <button v-on:click="applicationVote('admit')" class="generic-button-dark">Vote Admit</button>
                        <button v-on:click="applicationVote('reject')" class="generic-button-dark">Vote Reject</button>
                        <hr>
                        <button v-if="this.user.permissions.owner" v-on:click="applicationVote('admit-force')"
                                class="generic-button-dark">Admit [FORCE]
                        </button>
                        <button v-if="this.user.permissions.owner" v-on:click="applicationVote('reject-force')"
                                class="generic-button-dark">Reject [FORCE]
                        </button>
                        <hr>
                        <button class="generic-button-dark" v-on:click="stopReview">Exit</button>
                        <button v-on:click="nextApplication(false)" class="generic-button-dark">Pass</button>
                    </div>

                    <div v-else>
                        <div v-if="applicationsLeft > 1"><h2>There are {{this.applicationsLeft}} applications remaining</h2></div>
                        <div v-else-if="applicationsLeft == 1"><h2>There is {{this.applicationsLeft}} application left</h2></div>
                        <button v-if="applicationsLeft > 0" v-on:click="startReview" class="generic-button-dark">Start
                            reviewing!
                        </button>
                        <h2 v-else>There are no applications to review</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import swal from 'sweetalert2'

    export default {
        data() {
            return {
                page: 1,
                totalPages: 1,
                searchQuery: '',
                loading: true,
                applicationsLeft: 0,
                applications: {},
                reviewingApplications: false,
                err: '',
                currentApplication: {},
                reviewBody: '',
                voted: false,
                userTimes: [],
                users: {},
                user: null
            }
        },
        beforeMount() {
            this.user = Session.getUser();
            console.log(this.user);
            ApiService.getUsers({ page: 1, size: 10000, filters: {
                $and:[{
                    'status.admitted': false,
                    'status.rejected': false,
                    'status.waitlisted': false,
                    'status.submittedApplication': true,
                    applicationVotes: {$nin: [this.user.email]}
                }]}}, (err, data) => {

                this.loading = false;

                    if (err || !data) {
                        this.err = err ? err.responseJSON.error : 'Unable to process request'
                    } else {
                        this.applicationsLeft = Object.keys(data.users).length;
                        this.users = data;
                        console.log('data');
                        console.log(Object.assign({}, data))
                    }
                });

            ApiService.getApplications((err, applications) => {
                this.applications = applications
            });
        },
        methods : {
            startReview: function(){
                swal({
                    title: "Notice",
                    html: "All votes are final and are immediately taken into<br>consideration. The next application will be displayed<br>immediately after the previous is processed.<br><br>Remember that this power is a privilege.",
                    type: "warning",
                    showConfirmButton: true,
                    confirmButtonText: 'I accept',
                    confirmButtonColor: '#d33',
                    showCancelButton: true,
                    focusCancel: true
                }).then((userOK) =>{
                    console.log(userOK);
                    if(userOK.value){
                        if(this.applicationsLeft > 0 || true){
                            console.log("Starting!");
                            this.reviewingApplications = true;

                            var userTimesList = [];
                            this.users.users.forEach((user) =>{
                                userTimesList.push([user.id,user.lastUpdated,user]);
                            });

                            console.log(userTimesList);
                            userTimesList.sort(function(a, b) {
                                return a[1] - b[1];
                            });
                            this.userTimes = userTimesList;
                            this.nextApplication(true,false);
                        }
                    }
                })

            },
            stopReview: function(){
                if(this.reviewingApplications){
                    this.reviewingApplications = false;
                }
            },
            nextApplication: function(start = false,skipped = true){

                if(skipped){
                    swal({
                        title: "Tsk tsk!",
                        html: "As a reviewer, your job is to review applications!<br>Are you sure you want to pass?",
                        type: "warning",
                        showConfirmButton: true,
                        showCancelButton: true,
                        focusCancel: true
                    }).then((userOK) =>{
                        console.log(userOK);
                        if(userOK.value){
                            if(!start){
                                console.log("in here");
                                this.userTimes.shift();
                            }
                            this.displayApplication();
                        }
                    })
                }
                else{
                    if(!start){
                        console.log("in here2");
                        this.userTimes.shift();
                    }
                    this.displayApplication();
                }

            },
            displayApplication: function(){
                if(this.userTimes.length < 1){
                    if(this.voted){
                        swal("Information","There are no more applications","info");
                    }
                    else{
                        swal({
                            title: "Good Job!",
                            text: "You literally passed every single application!",
                            type: "success"
                        })
                    }
                    this.applicationsLeft = 0;
                    this.stopReview();
                }

                else{
                    var application = this.userTimes[0][2]["profile"]["hacker"];

                    this.reviewBody = '';
                    this.reviewBody += '<div class="duo-col">';
                    this.reviewBody += '<ul class="custom-ul">';
                    Object.keys(application).forEach((field) => {
                        this.reviewBody += '<li><b>' + (Object.keys(this.applications.hacker).indexOf(field) != -1 ? this.applications.hacker[field]['question'] : field) + '</b><br>' + application[field] + '</li><br>';
                    });
                    console.log(application);
                }
            },
            applicationVote: function(vote){
                if(vote == "admit"){
                    ApiService.voteAdmit(this.userTimes[0][2]["fullName"], this.userTimes[0][2]["id"], () => {
                        this.voted = true;
                        this.nextApplication(false,false);
                    });
                }
                else if(vote == "reject"){
                    ApiService.voteReject(this.userTimes[0][2]["fullName"], this.userTimes[0][2]["id"], () => {
                        this.voted = true;
                        this.nextApplication(false,false);
                    });
                }
                else if(vote == "admit-force" && this.user.permissions.owner){
                    ApiService.forceAdmit(this.userTimes[0][2]["fullName"], this.userTimes[0][2]["id"], () => {
                        this.voted = true;
                        this.nextApplication(false,false);
                    });
                }
                else if(vote == "reject-force" && this.user.permissions.owner){
                    ApiService.forceReject(this.userTimes[0][2]["fullName"], this.userTimes[0][2]["id"], () => {
                        this.voted = true;
                        this.nextApplication(false,false);
                    });
                }
            },
            switchPage: function(page) {
                this.page = page
            },
            prettify: function (str) {
                return str.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
                    return str.toUpperCase();
                })
            }
        }
    }
</script>