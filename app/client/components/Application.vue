<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>APPLICATION</h2>
                </div>

                <div v-for="question in applications.hacker">
                    {{question}}
                </div>

                <input type="text" placeholder="hello">

            </div>
        </div>
    </div>
</template>

<script>

    // Question types
    //
    // Short Answer
    // Full response
    // Drop down
    // School Search
    // Multiple choice
    // Checkbox bank
    //
    // Params
    //
    // Required/Not
    // Question
    // Max length (If applicable)

    import Session from '../src/Session'
    import ApiService from '../src/ApiService'

    export default {
        data() {
            return {
                error: '',
                applications: {}
            }
        },
        beforeMount() {
            ApiService.getApplications((err, applications) => {
                if (err || !applications) {
                    this.error = err ? err : 'Something went wrong :\'('
                } else {
                    this.applications = applications
                }
            });
        }
    }
</script>