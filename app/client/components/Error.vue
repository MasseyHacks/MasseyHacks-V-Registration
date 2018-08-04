<template>
    <div>
        <h2>Error: {{this.$route.query.error}}</h2>
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