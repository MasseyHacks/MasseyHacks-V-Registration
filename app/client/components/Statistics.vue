<template>
    <div style="width: 100%">
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
                        class="generic-button-dark less-wide">Refresh
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
                                <span v-if="['rejected', 'declined'].indexOf(key.toLowerCase()) != -1">
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
                <h3>DEMOGRAPHICS (SUBMITTED/SAVED)</h3>
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
                        <li><i class="fas fa-tshirt"></i>XS: {{statistics.shirtSizes.XS}}</li>
                        <li><i class="fas fa-tshirt"></i>S: {{statistics.shirtSizes.S}}</li>
                        <li><i class="fas fa-tshirt"></i>M: {{statistics.shirtSizes.M}}</li>
                        <li><i class="fas fa-tshirt"></i>L: {{statistics.shirtSizes.L}}</li>
                        <li><i class="fas fa-tshirt"></i>XL: {{statistics.shirtSizes.XL}}</li>
                    </ul>
                </div>

                <div style="overflow-x: auto; max-width: 100%">
                    <table class='data-table-generic'>
                        <tr class='table-header' v-if="statistics.dietaryRestrictions.length > 0">
                            <td>DIETARY RESTRICTION</td>
                            <td>COUNT</td>
                        </tr>
                        <tr v-for='restriction in statistics.dietaryRestrictions'>
                            <td>
                                {{restriction['name']}}
                            </td>
                            <td>
                                {{restriction['count']}}
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
            <div class="ui-card dash-card-large">
                <h3>DEMOGRAPHICS (CONFIRMED)</h3>
                <hr>
                <div class="duo-col">
                    <div class="card-col">
                        <ul class="custom-ul" style="text-align: left;">
                            <li v-for="(key,value) in genderConfirmed">
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
                        <li><i class="fas fa-tshirt"></i>XS: {{statistics.confirmedStat.shirtSizes.XS}}</li>
                        <li><i class="fas fa-tshirt"></i>S: {{statistics.confirmedStat.shirtSizes.S}}</li>
                        <li><i class="fas fa-tshirt"></i>M: {{statistics.confirmedStat.shirtSizes.M}}</li>
                        <li><i class="fas fa-tshirt"></i>L: {{statistics.confirmedStat.shirtSizes.L}}</li>
                        <li><i class="fas fa-tshirt"></i>XL: {{statistics.confirmedStat.shirtSizes.XL}}</li>
                    </ul>
                </div>

                <div style="overflow-x: auto; max-width: 100%">
                    <table class='data-table-generic'>
                        <tr class='table-header' v-if="statistics.confirmedStat.dietaryRestrictions.length > 0">
                            <td>DIETARY RESTRICTION</td>
                            <td>COUNT</td>
                        </tr>
                        <tr v-for='restriction in statistics.confirmedStat.dietaryRestrictions'>
                            <td>
                                {{restriction['name']}}
                            </td>
                            <td>
                                {{restriction['count']}}
                            </td>
                        </tr>
                    </table>
                </div>

            </div>

            <div class="ui-card dash-card-large">
                <h3>REVIEW STATISTICS</h3>
                <h5>AKA: HAS LOGISTICS BEEN SLACKING OFF?</h5>
                <hr>

                <div style="overflow-x: auto; max-width: 100%">
                    <table class='data-table-generic'>
                        <tr class='table-header'>
                            <td>NAME</td>
                            <td># VOTES</td>
                        </tr>
                        <tr v-for='human in statistics.votes'>
                            <td>
                                <b v-if="human[1] == maxVotes && maxVotes > 0">{{human[0]}} <- Top logistics member!!!!</b>
                                <span v-else>{{human[0]}}</span>
                            </td>
                            <td>
                                {{human[1]}} / {{statistics.submitted}}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>


            <div class="ui-card dash-card-large">
                <h3>SKILL VERIFICATION STATISTICS</h3>
                <h5>AKA: who is big nurd</h5>
                <hr>

                <div style="overflow-x: auto; max-width: 100%">
                    <table class='data-table-generic'>
                        <tr class='table-header'>
                            <td>NAME</td>
                            <td># REQUESTS</td>
                            <td># PASSED</td>
                            <td># FAILED</td>
                        </tr>
                        <tr v-for='human in statistics.skill'>
                            <td>
                                {{human[0]}}
                            </td>
                            <td>
                                {{human[1]}}
                            </td>
                            <td>
                                {{human[2]}}
                            </td>
                            <td>
                                {{human[3]}}
                            </td>
                        </tr>
                    </table>
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
                atGlanceStuff: {},
                maxVotes: -1
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

                        for (var human in statistics.votes) {
                            if (statistics.votes[human][1] > this.maxVotes) {
                                this.maxVotes = statistics.votes[human][1]
                            }
                        }
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
                    "Submitted": this.statistics.submitted,
                    "Waiver": this.statistics.waiver,
                    "Status Released": this.statistics.released
                }
            },

            atGlance2: function () {
                return {
                    "Admitted": this.statistics.admitted,
                    "Waitlisted": this.statistics.waitlisted,
                    "Rejected": this.statistics.rejected,
                    "Declined": this.statistics.declined
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

                totalCount += this.statistics.total;


                console.log(totalCount);


                var numMale = this.statistics.demo.gender.Male;
                var numFemale = this.statistics.demo.gender.Female;
                var numOther = this.statistics.demo.gender.Other;
                var numDataless = this.statistics.demo.gender["I prefer not to answer"];

                returnObject["Total"] += totalCount;
                returnObject["Male"] += `Male: ${numMale} (${(totalCount != 0 ? (numMale / totalCount * 100).toFixed(2) : 0)}%)`;
                returnObject["Female"] += `Female: ${numFemale} (${(totalCount != 0 ? (numFemale / totalCount * 100).toFixed(2) : 0)}%)`;
                returnObject["Other"] += `Other: ${numOther} (${(totalCount != 0 ? (numOther / totalCount * 100).toFixed(2) : 0)}%)`;
                returnObject["No Data"] += `No Data: ${numDataless} (${(totalCount != 0 ? (numDataless / totalCount * 100).toFixed(2) : 0)}%)`;
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

                totalCount += this.statistics.confirmedStat.total;

                var numMale = this.statistics.confirmedStat.demo.gender.Male;
                var numFemale = this.statistics.confirmedStat.demo.gender.Female;
                var numOther = this.statistics.confirmedStat.demo.gender.Other;
                var numDataless = this.statistics.confirmedStat.demo.gender["I prefer not to answer"];

                returnObject["Total"] += totalCount;
                returnObject["Male"] += `Male: ${numMale} (${(totalCount != 0 ? (numMale / totalCount * 100).toFixed(2) : 0)}%)`;
                returnObject["Female"] += `Female: ${numFemale} (${(totalCount != 0 ? (numFemale / totalCount * 100).toFixed(2) : 0)}%)`;
                returnObject["Other"] += `Other: ${numOther} (${(totalCount != 0 ? (numOther / totalCount * 100).toFixed(2) : 0)}%)`;
                returnObject["No Data"] += `No Data: ${numDataless} (${(totalCount != 0 ? (numDataless / totalCount * 100).toFixed(2) : 0)}%)`;
                return returnObject;

            }
        }
    }
</script>