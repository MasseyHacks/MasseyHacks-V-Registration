<template>
    <div class="app-screen">
        <div class="spacer"></div>
        <div class="container vertical-centered">
            <div class="ui-card dash-card">
                <div>
                    <h5 style="margin-bottom: 0"><b>Error: </b>{{this.$route.query.error}}</h5>

                    <br>

                    <router-link to="/"><button class="generic-button-dark">Back to Safety</button></router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        created() {
            if (!this.$route.query.error) {
                this.$router.replace('/')
            }
        }
    }
</script>