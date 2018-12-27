<template>
    <div class="row" style="width: 100%">
        <div v-if="loading" class="organizer-card">
            <div class="ui-card dash-card-large">
                Loading...
            </div>
        </div>
        <div v-else-if="loadingError" class="organizer-card">
            <div class="ui-card dash-card-large">
                {{loadingError}}
            </div>
        </div>
        <div v-else="" class="organizer-card">
            <div class="ui-card dash-card-large" style="width: 100% !important">
                <h3>AT A GLANCE:</h3>
                <p>Last Updated: {{statistics.lastUpdated | moment("from")}}</p>
                <button v-on:click="refreshStatistics" v-if="user.permissions.developer"
                        class="generic-button-dark">Refresh
                </button>
                <br>
                <hr>
                <div class="duo-col">
                    <div class="card-col">
                        <ul class="custom-ul" style="text-align: left;">
                            <li v-for="(value, key) in atGlance">
                                <i class="fas fa-check"></i>{{key}} : {{value}}
                            </li>
                        </ul>
                    </div>
                    <div class="card-col">
                        <ul class="custom-ul" style="text-align: left;">
                            <li v-for="(value, key) in atGlance2">
                                <span v-if="key.toLowerCase() == 'rejected'">
                                    <i class="fas fa-ban"></i>{{key}} : {{value}}
                                </span>
                                <span v-else-if="key.toLowerCase() == 'waitlisted'">
                                    <i class="fas fa-user-clock"></i>{{key}} : {{value}}
                                </span>
                                <span v-else>
                                    <i class="fas fa-check"></i>{{key}} : {{value}}
                                </span>
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
                        <li><i class="fas fa-globe-americas"></i>Non-Massey:
                            {{statistics.confirmedStat.demo.nonmassey}}
                        </li>
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

    export default {
        data() {
            return {
                user: Session.getUser(),
                loading: true,
                loadingError: '',
                statistics: {},
                atGlanceStuff: {}
            }
        },

        created() {
            this.getStat();
            setInterval(this.getStat(), 300000)
        },


        methods: {
            getStat: function () {
                ApiService.getStatistics((loadingError, statistics) => {
                    this.loading = false;

                    if (loadingError || !statistics) {
                        this.loadingError = loadingError ? loadingError.responseJSON.error : 'Unable to process request'
                    } else {
                        this.statistics = statistics
                    }
                })
            },
            refreshStatistics: function () {
                ApiService.refreshStatistics((loadingError, statistics) => {
                    if (loadingError || !statistics) {
                        this.loadingError = loadingError ? loadingError.responseJSON.error : 'Unable to process request'
                    } else {
                        this.statistics = statistics
                    }
                })
            }
        },

        computed: {
            atGlance: function () {
                return {
                    "Total": this.statistics.total,
                    "Verified": this.statistics.verified,
                    "Submitted": this.statistics.submitted
                }
            },

            atGlance2: function () {
                return {
                    "Admitted": this.statistics.admitted,
                    "Waitlisted": this.statistics.waitlisted,
                    "Rejected": this.statistics.rejected
                }
            },

            genderSubmitted: function () {
                var totalCount = 0;
                var returnObject = {
                    "Total": '<i class="fas fa-check"></i>Total: ',
                    "Male": '<i class="fas fa-male"></i>',
                    "Female": '<i class="fas fa-female"></i>',
                    "Other": '<i class="fas fa-question-circle"></i>',
                    "No Data": '<i class="fas fa-ban"></i>'
                };

                console.log(this.statistics);

                for (var key in this.statistics.demo.gender) {
                    totalCount += this.statistics.demo.gender[key];
                    console.log("STUFF");
                    console.log(this.statistics.demo.gender);
                }

                console.log(totalCount);

                returnObject["Total"] += totalCount;
                returnObject["Male"] += "Male: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender.Male / totalCount * 100) : 0) + "%";
                returnObject["Female"] += "Female: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender.Female / totalCount * 100) : 0) + "%";
                returnObject["Other"] += "Other: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender.Other / totalCount * 100) : 0) + "%";
                returnObject["No Data"] += "No Data: " + (totalCount != 0 ? Math.round(this.statistics.demo.gender["I prefer not to answer"] / totalCount * 100) : 0) + "%";
                console.log(returnObject);
                return returnObject;

            },

            genderConfirmed: function () {
                var totalCount = 0;
                var returnObject = {
                    "Total": '<i class="fas fa-check"></i>Total: ',
                    "Male": '<i class="fas fa-male"></i>',
                    "Female": '<i class="fas fa-female"></i>',
                    "Other": '<i class="fas fa-question-circle"></i>',
                    "No Data": '<i class="fas fa-ban"></i>'
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