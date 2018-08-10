<template>
    <div>
        <h2>Statistics</h2>
        <p>O wow i like statistics!</p>

        {{statistics}} {{loading}} {{fail}}
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