<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>APPLICATION</h2>
                </div>
                <div>
                    <form>
                        <div class="form-group" v-for="(question,questionName) in applications.hacker">
                            <label :for="questionName">{{question.question}}</label>
                            <textarea class="form-control" v-if="question.questionType == 'fullResponse'" :id="questionName" :maxlength="question.maxlength"></textarea>
                            <input class="form-control" type="text" v-if="question.questionType == 'shortAnswer'" :id="questionName">
                            <div v-if="question.questionType == 'boolean'">
                                <div class="form-check form-check-inline" :id="questionName">
                                    <input class="form-check-input" type="radio" :name="questionName" :id="questionName + '1' ">
                                    <label class="form-check-label" :for="questionName + '1' ">Yes</label>
                                </div>
                                <div class="form-check form-check-inline" :id="questionName">
                                    <input class="form-check-input" type="radio" :name="questionName" :id="questionName + '0' ">
                                    <label class="form-check-label" :for="questionName + '0' ">No</label>
                                </div>
                            </div>
                            <div v-if="question.questionType == 'multiradio'">
                                <div v-for="option in question.enum.options" class="form-check form-check-inline" :id="questionName">
                                    <input class="form-check-input" type="radio" :name="questionName" :id="questionName + option.id ">
                                    <label class="form-check-label" :for="questionName + option.id ">{{option.text}}</label>
                                </div>
                            </div>
                            <div v-if="question.questionType == 'multicheck'">
                                <div v-for="option in question.enum.options" class="form-check form-check-inline" :id="questionName">
                                    <input class="form-check-input" type="checkbox" :name="questionName" :id="questionName + option.id ">
                                    <label class="form-check-label" :for="questionName + option.id ">{{option.text}}</label>
                                </div>
                            </div>
                            <select v-if="question.questionType == 'dropdown'" class="form-control" :id="questionName">
                                <option v-for="option in question.enum.values.split(' ')">{{option}}
                                </option>
                            </select>
                            <v-select v-if="question.questionType == 'schoolSearch'" label="countryName" :options="options" taggable></v-select>
                        </div>
                    </form>
                </div>

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
    import $ from 'jquery'
    import vSelect from 'vue-select'

    export default {
        data() {
            return {
                error: '',
                applications: {},
                applicationHTML: '',
                options: [
                    { countryCode: "AU", countryName: "Australia" },
                    { countryCode: "CA", countryName: "Canada" },
                    { countryCode: "CN", countryName: "China" },
                    { countryCode: "DE", countryName: "Germany" },
                    { countryCode: "JP", countryName: "Japan" },
                    { countryCode: "MX", countryName: "Mexico" },
                    { countryCode: "CH", countryName: "Switzerland" },
                    { countryCode: "US", countryName: "United States" }
                ]
            }
        },
        components:{
          vSelect
        },
        beforeMount() {
            ApiService.getApplications((err, applications) => {
                if (err || !applications) {
                    this.error = err ? err : 'Something went wrong :\'('
                } else {
                    this.applications = applications
                }
            });
            //this.buildApplication()
        },
        methods: {
            submitApplication(){
                console.log('lol this doesnt work')
            }
        },
    }
</script>
