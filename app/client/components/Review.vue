<template>
    <div>
        <div class="row">
            <div class="ui-card dash-card-large" id="users-table">
                <div v-if="reviewingApplications">
                    <h2>Reviewing Application</h2>
                    <button v-on:click="stopReview" class="generic-button-light">Exit</button>
                </div>

                <div v-else>
                    <div v-if="applicationsLeft > 0"><h2>There are {{this.applicationsLeft}} application(s) remaining</h2></div>
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
                userTimes: [],
                users: {}
            }
        },
        beforeMount() {
            ApiService.getStatistics((err, data) => {
                this.loading = false

                if (err || !data) {
                    this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                } else {
                    this.applicationsLeft = 3;
                    //this.applicationsLeft = data.submitted - data.admitted - data.waitlisted - data.rejected;
                }
            })
        },
        methods : {
            startReview: function(){
                if(this.applicationsLeft > 0 || true){
                    console.log("Starting!");
                    this.reviewingApplications = true;

                    //assemble the application array in order!
                    ApiService.getUsers({ page: this.page, size: 100 }, (err, data) => {
                        if (err || !data) {
                            this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                        } else {
                            this.users = data.users;
                            console.log(data.users);
                            var userTimesList = [];
                            data.users.forEach(function(user){
                                console.log(user.lastUpdated);
                                userTimesList.push([user.id,user.lastUpdated,user.profile]);
                            });
                            console.log(userTimesList);
                            userTimesList.sort(function(a, b) {
                                return a[1] - b[1];
                            });
                            this.userTimes = userTimesList;
                            this.nextApplication(false);
                        }
                    });
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
                var application = this.userTimes[0][2]["hacker"];
                console.log(application);
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