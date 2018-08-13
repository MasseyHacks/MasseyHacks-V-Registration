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
    import { saveAs } from 'file-saver/FileSaver';

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
                    nextApplication();
                }
            },
            stopReview: function(){
                if(this.reviewingApplications){
                    this.reviewingApplications = false;
                }
            },
            nextApplication: function(){

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