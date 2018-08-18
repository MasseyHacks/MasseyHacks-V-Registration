<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>APPLICATION</h2>
                </div>
                <div style="width:100%; padding: 1em;">
                    <form v-if="!user.permissions.checkin || user.permissions.developer" @submit.prevent="submitApplication">
                        <div class="form-group" v-for="(question,questionName) in applications.hacker">
                            <label :for="questionName">{{question.question}} <span v-if="question.mandatory" style="color: red">*</span></label>
                            <textarea class="form-control" v-if="question.questionType == 'fullResponse'" :id="questionName" :maxlength="question.maxlength"></textarea>
                            <input class="form-control" type="text" v-if="question.questionType == 'shortAnswer'" :id="questionName" :maxlength="question.maxlength">
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
                                <div v-for="option in question.enum.values.split(' ')" class="form-check form-check-inline" :id="questionName">
                                    <input class="form-check-input" type="radio" :name="questionName" :id="questionName + option">
                                    <label class="form-check-label" :for="questionName + option">{{option.replace('^',' ')}}</label>
                                </div>
                            </div>
                            <div v-if="question.questionType == 'multicheck'">
                                <div v-for="option in question.enum.values.split(' ')" class="form-check form-check-inline" :id="questionName">
                                    <input class="form-check-input" type="checkbox" :name="questionName" :id="questionName + option ">
                                    <label class="form-check-label" :for="questionName + option ">{{option.replace('^',' ')}}</label>
                                </div>
                            </div>
                            <select v-if="question.questionType == 'dropdown'" class="form-control" :id="questionName">
                                <option v-for="option in question.enum.values.split(' ')">{{option}}
                                </option>
                            </select>
                            <v-select v-if="question.questionType == 'schoolSearch'" :id="questionName" :options="settings.schools" :placeholder="schoolPlaceholder" v-model="school" taggable></v-select>
                        </div>
                        <button type="submit" class="generic-button-dark">Submit</button>
                    </form>
                    <div v-else style="text-align:center; font-size:1.5em;"><span>You are not a hacker!</span></div>
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
    import swal from 'sweetalert2'
    import ApiService from '../src/ApiService'
    import $ from 'jquery'
    import vSelect from 'vue-select'

    export default {
        data() {
            return {
                error: '',
                applications: {},
                settings: Session.getSettings(),
                applicationHTML: '',
                schoolPlaceholder: 'Select a school',
                applicationValue : {},
                school: null,
                user: Session.getUser()
            }
        },
        components:{
          vSelect
        },
        beforeMount() {
            console.log(this.settings);
            ApiService.getApplications((err, applications) => {
                if (err || !applications) {
                    this.error = err ? err : 'Something went wrong :\'('
                } else {
                    this.applications = applications
                }
            });
        },
        mounted(){
            this.$nextTick(function () {
                ApiService.getApplications((err, applications) => {
                    if (err || !applications) {
                        this.error = err ? err : 'Something went wrong :\'('
                    } else {
                        this.applications = applications;
                        this.populateApplication();
                    }
                });
            })
        },
        methods: {
            populateApplication(){
                if(this.user.status.submittedApplication && this.user.profile.hacker != null){
                    console.log('adding values');
                  //populate the fields with what they submitted
                    var userApp = this.user.profile.hacker;

                    Object.keys(userApp).forEach((field) => {
                        console.log(field);
                        console.log(this.applications.hacker);
                        if(this.applications.hacker[field].questionType == 'multicheck'){
                            userApp[field].forEach((checkedBox) =>{
                                //check 'em all!
                                document.getElementById(field+checkedBox).checked = true;
                            });
                        }
                        else if(this.applications.hacker[field].questionType == 'multiradio' || this.applications.hacker[field].questionType == 'boolean'){
                            //check only the radio box that was checked

                            if(this.applications.hacker[field].questionType == 'boolean'){
                                if(userApp[field]){
                                    userApp[field] = 1;
                                }
                                else{
                                    userApp[field] = 0;
                                }
                            }
                            console.log("field",field+userApp[field]);
                            document.getElementById(field+userApp[field]).checked = "true";
                        }
                        else if(this.applications.hacker[field].questionType == 'schoolSearch'){
                            this.schoolPlaceholder = userApp[field];
                            this.school = userApp[field];
                        }
                        else{
                            document.getElementById(field).value = userApp[field];
                        }
                  })
              }
            },
            submitApplication(){
                var doNotSubmit = false;
                Object.keys(this.applications.hacker).forEach((question) => {
                    console.log(this.applications.hacker[question].questionType);
                   if(this.applications.hacker[question].questionType == 'multicheck'){
                       var checked = [];
                       $("input[name='"+question+"']:checked").each(function (){
                           checked.push($(this).attr('id').replace(question,''));
                       });

                       if(this.applications.hacker[question].mandatory && checked.length < 1){
                           doNotSubmit = true;
                       }

                       this.applicationValue[question] = checked;
                   }
                   else if(this.applications.hacker[question].questionType == 'multiradio' || this.applications.hacker[question].questionType == 'boolean'){
                       try{
                           this.applicationValue[question] = $("input[name='"+question+"']:checked").attr('id').replace(question,'');
                       }
                       catch(error){
                           //invalid
                           if(this.applications.hacker[question].mandatory){
                               doNotSubmit = true;
                           }
                           else{
                               this.applicationValue[question] = null;
                           }
                       }

                   }
                   else if(this.applications.hacker[question].questionType == 'schoolSearch'){
                       if(this.school){
                           this.applicationValue[question] = this.school;
                       }
                       else{
                           //invalid
                           if(this.applications.hacker[question].mandatory){
                               doNotSubmit = true;
                           }
                           else{
                               this.applicationValue[question] = null;
                           }
                       }

                   }
                   else{
                       var inputElement = document.getElementById(question);
                       if($.trim( $(inputElement).val() ) == ''){
                           if(this.applications.hacker[question].mandatory){
                               doNotSubmit = true;
                           }
                           else{
                               this.applicationValue[question] = null;
                           }
                       }
                       else if(inputElement.value.length > this.applications.hacker[question].maxlength){
                           doNotSubmit = true;
                       }
                       else{
                           this.applicationValue[question] = inputElement.value;
                       }


                   }
                });
                console.log(this.applicationValue);
                if(doNotSubmit){
                    swal("Error","Please check all the required fields and try again","error");
                }
                else{
                    //ajax submit code
                    var data = {};
                    data.userID = Session.getUserID();
                    data.profile = {};
                    data.profile.hacker = this.applicationValue;
                    Session.sendRequest('POST','/api/updateProfile',data,(err) =>{
                        if(err){
                            swal("Error",err,"error");
                        }
                        else{
                            swal("Success","Your application has been submitted!","success");
                        }
                    });

                }
            }
        },
    }
</script>
