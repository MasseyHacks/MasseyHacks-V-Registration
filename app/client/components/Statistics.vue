<template>
    <div>
        <h2>Statistics</h2>
        <p>O wow i like statistics!</p>

        {{statistics}} {{loading}} {{fail}}
    </div>
</template>

<script>
    import Session from '../src/Session'
    import $ from 'jquery';

    export default {
        data() {
            return {
                loading: true,
                fail: false,
                statistics: {}
            }
        },
        created() {
            $.ajax({
                type: 'GET',
                url: '/api/stats',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: data => {
                    console.log(data)

                    this.loading = false
                    this.statistics = data
                },
                error: data => {
                    this.loading = false
                    this.fail = true
                }
            });
        }
    }
</script>