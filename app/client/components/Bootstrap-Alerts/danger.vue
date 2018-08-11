<template>
    <div>
        <b-alert :show="dismissCountDown"
                 dismissible
                 fade
                 variant="danger"
                 @dismissed="close"
                 @dismiss-count-down="countDownChanged">
            {{ text }}
        </b-alert>
    </div>
</template>

<script>
    export default {
        name: "danger",
        props: ["text"],
        data () {
            return {
                dismissCountDown: 5
            }
        },
        methods: {
            countDownChanged (dismissCountDown) {
                this.dismissCountDown = dismissCountDown
            }
        }
    }
</script>