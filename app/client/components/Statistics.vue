<template>
    <div>
        <div class="row">
            <div class="ui-card" id="dash-card-large">
                <h3>STATISTICS:</h3>
                <hr>
                {{statistics}} {{loading}} {{fail}}
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
                loading: true,
                fail: false,
                statistics: {}
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
        }
    }
</script>