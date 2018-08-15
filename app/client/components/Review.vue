<template>
    <div>
        <div class="row">
            <div class="ui-card dash-card-large" id="users-table">
                <div v-if="reviewingApplications">
                    <h2>Reviewing Application</h2>
                    <div v-html="this.reviewBody"></div>
                    <button v-on:click="stopReview" class="generic-button-light">Exit</button>
                    <button v-on:click="applicationVote('admit')" class="generic-button-light">Vote Admit</button>
                    <button v-on:click="applicationVote('reject')" class="generic-button-light">Vote Reject</button>
                    <button v-if="this.user.permissions.owner" v-on:click="applicationVote('admit-force')" class="generic-button-light">Admit [FORCE]</button>
                    <button v-if="this.user.permissions.owner" v-on:click="applicationVote('reject-force')" class="generic-button-light">Reject [FORCE]</button>
                    <button v-on:click="nextApplication(false)" class="generic-button-light">Pass</button>
                </div>

                <div v-else>
                    <div v-if="applicationsLeft > 1"><h2>There are {{this.applicationsLeft}} applications remaining</h2></div>
                    <div v-else-if="applicationsLeft == 1"><h2>There is {{this.applicationsLeft}} application left</h2></div>
                    <button v-if="applicationsLeft > 0" v-on:click="startReview" class="generic-button-light">Start reviewing!</button>
                    <h2 v-else>There are no applications to review</h2>
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
                searchQuery: '',
                loading: true,
                applicationsLeft: 0,
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
                    Object.keys(application).forEach((field) => {
                        this.reviewBody+=field+' '+application[field]+'<BR>';
                    });
                    console.log(application);
                }
            },
            applicationVote: function(vote){
                if(vote == "admit"){
                    swal({
                        title: "Confirm Your Vote [ADMIT]",
                        html: 'Vote to <span style="color:#00FF00; font-weight:bold;">ADMIT</span> '+ this.userTimes[0][2]["fullName"] +
                            '?<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
                        type: "warning",
                        showConfirmButton: true,
                        confirmButtonText: 'Yes, vote admit',
                        confirmButtonColor: '#d33',
                        showCancelButton: true,
                        focusCancel: true,
                        showLoaderOnConfirm: true,
                        preConfirm: (userOK) => {
                            console.log(userOK);
                            if(userOK){
                                //register the vote
                                Session.sendRequest('POST','/api/voteAdmit',{
                                    userID: this.userTimes[0][2]["id"]
                                }, (err,data) =>{
                                    if(err){
                                        swal("Error","Unable to notify the server","error");
                                    }
                                    else if(!err && data){
                                        this.voted = true;
                                        this.nextApplication(false,false);
                                    }
                                });

                            }
                        },
                        allowOutsideClick: () => !swal.isLoading()
                    })
                }
                else if(vote == "reject"){
                    swal({
                        title: "Confirm Your Vote [REJECT]",
                        html: 'Vote to <span style="color:#d33; font-weight:bold;">REJECT</span> ' + this.userTimes[0][2]["fullName"] +
                            '?<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
                        type: "warning",
                        showConfirmButton: true,
                        confirmButtonText: 'Yes, vote reject',
                        confirmButtonColor: '#d33',
                        showCancelButton: true,
                        focusCancel: true,
                        showLoaderOnConfirm: true,
                        preConfirm: (userOK) => {
                            console.log(userOK);
                            if(userOK){
                                //register the vote
                                Session.sendRequest('POST','/api/voteReject',{
                                    userID: this.userTimes[0][2]["id"]
                                }, (err,data) =>{
                                    if(err){
                                        swal("Error","Unable to notify the server","error");
                                    }
                                    else if(!err && data){
                                        this.voted = true;
                                        this.nextApplication(false,false);
                                    }
                                });

                            }
                        },
                        allowOutsideClick: () => !swal.isLoading()
                    })
                }
                else if(vote == "admit-force" && this.user.permissions.owner){
                    swal({
                        title: "Whoa, wait a minute!<br>[FORCE ACTION]",
                        html: 'You are about to <span style="color:#d33; font-weight:bold;">FORCE</span> <span style="color:#00FF00; font-weight:bold;">ADMIT</span> ' + this.userTimes[0][2]["fullName"] +
                                '!<br>They will be notified <span style="color:#d33; font-weight:bold;">IMMEDIATELY</span>',
                        type: "warning",
                        showConfirmButton: true,
                        confirmButtonText: 'Yes, <span style="font-weight:bold;">FORCE</span> admit',
                        confirmButtonColor: '#d33',
                        showCancelButton: true,
                        focusCancel: true,
                        showLoaderOnConfirm: true,
                        preConfirm: (userOK) => {
                            console.log(userOK);
                            if(userOK){
                                //register the vote
                                Session.sendRequest('POST','/api/forceAccept',{
                                    userID: this.userTimes[0][2]["id"]
                                }, (err,data) =>{
                                    if(err){
                                        swal("Error","Unable to notify the server","error");
                                    }
                                    else if(!err && data){
                                        this.voted = true;
                                        this.nextApplication(false,false);
                                    }
                                });

                            }
                        },
                        allowOutsideClick: () => !swal.isLoading()
                    })
                }
                else if(vote == "reject-force" && this.user.permissions.owner){
                    swal({
                        title: "Whoa, wait a minute!<br>[FORCE ACTION]",
                        html: 'You are about to <span style="color:#d33; font-weight:bold;">FORCE REJECT</span> ' + this.userTimes[0][2]["fullName"] +
                            '!<br>They will be notified <span style="color:#d33; font-weight:bold;">IMMEDIATELY</span>',
                        type: "warning",
                        showConfirmButton: true,
                        confirmButtonText: 'Yes, <span style="font-weight:bold;">FORCE</span> reject',
                        confirmButtonColor: '#d33',
                        showCancelButton: true,
                        focusCancel: true,
                        showLoaderOnConfirm: true,
                        preConfirm: (userOK) => {
                            console.log(userOK);
                            if(userOK){
                                //register the vote
                                Session.sendRequest('POST','/api/forceReject',{
                                    userID: this.userTimes[0][2]["id"]
                                }, (err,data) =>{
                                    if(err){
                                        swal("Error","Unable to notify the server","error");
                                    }
                                    else if(!err && data){
                                        this.voted = true;
                                        this.nextApplication(false,false);
                                    }
                                });

                            }
                        },
                        allowOutsideClick: () => !swal.isLoading()
                    })
                }
            },
            switchPage: function(page) {
                this.page = page
            }
        }
    }
</script>