<template>
    <div>
        <img src="/img/rolling.svg" height="50px" width="auto" class="loading-icon hidden">
        <div class="row">
            <div class="ui-card dash-card-large">
                <h3>AT A GLANCE:</h3>
                <p>Last Updated: {{statistics.lastUpdated | moment("from")}}</p>
                <hr>
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
                <h3>{{statistics.checkedIn}} CHECKED IN</h3>
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
                <div class="duo-col">
                    <ul class="custom-ul" style="text-align: left;">
                        <li><i class="fas fa-bus"></i>Bus: {{statistics.bus}}</li>
                        <li><i class="fas fa-home"></i>Massey: {{statistics.demo.massey}}</li>
                        <li><i class="fas fa-globe-americas"></i>Non-Massey: {{statistics.demo.nonmassey}}</li>
                    </ul>
                    <ul class="custom-ul" style="text-align: left;">
                        <li><i class="fas fa-tshirt"></i>S: {{statistics.confirmedStat.shirtSizes.S}}</li>
                        <li><i class="fas fa-tshirt"></i>M: {{statistics.confirmedStat.shirtSizes.M}}</li>
                        <li><i class="fas fa-tshirt"></i>L: {{statistics.confirmedStat.shirtSizes.L}}</li>
                    </ul>
                </div>

            </div>
            <div class="ui-card dash-card-large">
                <h3>DEMOGRAPHICS (CONFIRMED)</h3>
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
                            <li v-for="(key,value) in statistics.confirmedStat.demo.grade">
                                <i class="fas fa-user-graduate"></i>Grade {{value}}: {{key}}
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="duo-col">
                    <ul class="custom-ul" style="text-align: left;">
                        <li><i class="fas fa-bus"></i>Bus: {{statistics.confirmedStat.bus}}</li>
                        <li><i class="fas fa-home"></i>Massey: {{statistics.confirmedStat.demo.massey}}</li>
                        <li><i class="fas fa-globe-americas"></i>Non-Massey: {{statistics.confirmedStat.demo.nonmassey}}</li>
                    </ul>
                    <ul class="custom-ul" style="text-align: left;">
                        <li><i class="fas fa-tshirt"></i>S: {{statistics.confirmedStat.shirtSizes.S}}</li>
                        <li><i class="fas fa-tshirt"></i>M: {{statistics.confirmedStat.shirtSizes.M}}</li>
                        <li><i class="fas fa-tshirt"></i>L: {{statistics.confirmedStat.shirtSizes.L}}</li>
                    </ul>
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
                loading: true,
                fail: false,
                statistics: {},
                atGlanceStuff : {}
            }
        },

        created() {
            this.getStat()
            setInterval(this.getStat(), 5000)
        },


        methods: {
            getStat: function() {
                ApiService.getStatistics((err, statistics) => {
                    this.loading = false

                    if (err || !statistics) {
                        this.fail = true
                        swal({
                            title: 'Sorry!',
                            text: 'There was an error!',
                            type: 'error'
                        })
                    } else {
                        this.statistics = statistics
                    }
                })
            }
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
                returnObject["Total"] += totalCount;
                returnObject["Male"] += "Male: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender.M / totalCount) : 0) + "%";
                returnObject["Female"] += "Female: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender.F / totalCount) : 0) + "%";
                returnObject["Other"] += "Other: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender.O / totalCount) : 0) + "%";
                returnObject["No Data"] += "No Data: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender.N / totalCount) : 0) + "%";
                console.log(returnObject);
                return returnObject;

            },

            genderConfirmed: function() {
                var totalCount = 0;
                var returnObject = {
                    "Total" : '<i class="fas fa-check"></i>Total: ',
                    "Male" : '<i class="fas fa-male"></i>',
                    "Female" : '<i class="fas fa-female"></i>',
                    "Other" : '<i class="fas fa-question-circle"></i>',
                    "No Data" : '<i class="fas fa-ban"></i>'
                };
                for (var key in this.statistics.confirmedStat.gender) {
                    totalCount += this.statistics.confirmedStat.gender[key];
                }
                returnObject["Total"] += totalCount;
                returnObject["Male"] += "Male: " + (totalCount != 0 ? Math.round(this.statistics.confirmedStat.gender.M / totalCount) : 0) + "%";
                returnObject["Female"] += "Female: " + (totalCount != 0 ? Math.round(this.statistics.confirmedStat.gender.F / totalCount) : 0) + "%";
                returnObject["Other"] += "Other: " + (totalCount != 0 ? Math.round(this.statistics.confirmedStat.gender.O / totalCount) : 0) + "%";
                returnObject["No Data"] += "No Data: " + (totalCount != 0 ? Math.round(this.statistics.confirmedStat.gender.N / totalCount) : 0) + "%";
                console.log(returnObject);
                return returnObject;

            }
        }
    }
</script>