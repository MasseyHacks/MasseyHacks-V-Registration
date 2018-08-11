<template>
    <div>
        <div class="row">
            <div class="ui-card dash-card-large">
                <h3>WAVE {{statistics.wave}} AT A GLANCE:</h3>
                <p>Last Updated: {{statistics.lastUpdated}}</p>
                <hr>
                <!--{{statistics}} {{loading}} {{fail}}-->
                <div class="duo-col">
                    <div class="card-col">
                        <ul class="custom-ul" style="text-align: left;">
                            <li v-for="(value, key) in atGlance">
                                <i class="fas fa-check"></i>{{key.toUpperCase()}} : {{value}}
                            </li>
                        </ul>
                    </div>
                    <div class="card-col">
                        <ul class="custom-ul" style="text-align: left;">
                            <li v-for="(value, key) in atGlance2">
                                <i class="fas fa-check"></i>{{key.toUpperCase()}} : {{value}}
                            </li>
                        </ul>
                    </div>
                </div>              
            </div>
            <div class="ui-card dash-card-large">
                <h3>DEMOGRAPHICS (SUBMITTED)</h3>
                <hr>
                <div class="duo-col">
                    <div class="card-col">
                        <ul class="custom-ul" style="text-align: left;">
                            <li v-for="(key,value) in genderSubmitted">
                                <span v-html="key"></span>
                            </li>
                        </ul>
                    </div>
                    <div class="card-col">
                        <ul class="custom-ul" style="text-align: left;">
                            <li v-for="(key,value) in statistics.demo.grade">
                                <i class="fas fa-user-graduate"></i>Grade {{value}}: {{key}}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="ui-card dash-card-large">
                <h3>DEMOGRAPHICS (CONFIRMED)</h3>
                <hr>
            </div>
        {{statistics}}
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
                loading: true,
                fail: false,
                statistics: {},
                atGlanceStuff : {}
            }
        },
        beforeMount() {
            ApiService.getStatistics((err, statistics) => {
                this.loading = false

                if (err || !statistics) {
                    this.fail = true
                } else {
                    this.statistics = statistics
                }
            })
        },


        computed: {
            atGlance: function() {
                return {
                    "Total" : this.statistics.total,
                    "Verified" : this.statistics.verified,
                    "Submitted" : this.statistics.submitted
                }
            },

            atGlance2: function() {
                return {
                    "Admitted" : this.statistics.admitted,
                    "Waitlisted": this.statistics.waitlisted,
                    "Rejected" : this.statistics.rejected
                }
            },

            genderSubmitted: function() {
                var totalCount = 0;
                var returnObject = {
                    "Total" : '<i class="fas fa-check"></i>Total: ',
                    "Male" : '<i class="fas fa-male"></i>',
                    "Female" : '<i class="fas fa-female"></i>',
                    "Other" : '<i class="fas fa-question-circle"></i>',
                    "No Data" : '<i class="fas fa-ban"></i>'
                };
                for (var key in this.statistics.demo.gender) {
                    totalCount += this.statistics.demo.gender[key];
                }
                returnObject["Total"] += this.statistics.total;
                returnObject["Male"] += "Male: " + Math.round(this.statistics.demo.gender.M / totalCount) + "%";
                returnObject["Female"] += "Female: " + Math.round(this.statistics.demo.gender.F / totalCount) + "%";
                returnObject["Other"] += "Other: " + Math.round(this.statistics.demo.gender.O / totalCount) + "%";
                returnObject["No Data"] += "No Data: " + Math.round(this.statistics.demo.gender.N / totalCount) + "%";
                console.log(returnObject);
                return returnObject;

            }
        }
    }
</script>