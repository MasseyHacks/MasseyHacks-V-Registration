<template>
    <div>
        <div class="row">
            <div class="ui-card" id="dash-card-large">
                <h3>AT A GLANCE:</h3>
                <p>Last Updated: {{statistics.lastUpdated}}</p>
                <hr>
                <!--{{statistics}} {{loading}} {{fail}}-->
                <div style="column-count: 2;">
                    <div class="card-col">
                        <ul id="stats" style="text-align: left;">
                            <li v-for="(value, key) in atGlance">
                                <i class="fas fa-check"></i>{{key.toUpperCase()}} : {{value}}
                            </li>
                        </ul>
                    </div>
                    <div class="card-col">
                        <ul id="stats" style="text-align: left;">
                            <li v-for="(value, key) in atGlance2">
                                <i class="fas fa-check"></i>{{key.toUpperCase()}} : {{value}}
                            </li>
                        </ul>
                    </div>
                </div>              
            </div>
            <div class="ui-card" id="dash-card-large">
                <h3>WAVE: {{statistics.wave}}</h3>
            </div>
            <div class="ui-card" id="dash-card-large">
                <h3>DEMOGRAPHICS (SUBMITTED)</h3>
                <hr>
            </div>
            <div class="ui-card" id="dash-card-large">
                <h3>DEMOGRAPHICS (CONFIRMED)</h3>
                <hr>
            </div>
        </div>
        {{statistics}}
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
            }
        }
    }
</script>