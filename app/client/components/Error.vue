<template>
    <div>
        <h2>Error: {{this.$route.query.error}}</h2>

        <router-link v-if="loggedIn" to="/">Back to safety</router-link>
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