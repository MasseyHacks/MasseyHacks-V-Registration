<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>APPLICATION</h2>
                </div>

                <div v-for="question in $parent.user.profile">

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

    ApiService.getApplications((err, apps) => {
        console.log(apps)
    });

    export default {
        data() {
            return {
                error: ''
            }
        }
    }
</script>