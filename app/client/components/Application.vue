<template>
    <div class="app-screen">
        <div class="container">
            <div class="title-card col-md-12">
                <h2>APPLICATION</h2>
            </div>
            <div class="ui-card dash-card-large">


                <div v-if="loading">
                    Loading...
                </div>
                <div v-else-if="loadingError">
                    {{loadingError}}
                </div>
                <div v-else class="main-app">
                    <form v-if="!user.permissions.checkin || user.permissions.developer"
                          @submit.prevent="submitApplication" style="text-align: left">

                        <h5 v-if="editWarning"><b>{{editWarning}}</b></h5>

                        <div class="form-group" v-for="(question,questionName) in applications.hacker">

                            <h4 v-if="question.precaption" style="margin-top: 50px" v-html="question.precaption"></h4>

                            <label :for="questionName" v-if="question.questionType != 'contract'"><span v-html="question.question"></span> <b><span v-if="question.mandatory"
                                                                                      style="color: red">*</span></b></label>

                            <br v-if="question.note">
                            <label :for="questionName" v-if="question.note" v-html="question.note"></label>

                            <textarea :disabled="editDisabled" class="form-control" v-if="question.questionType == 'fullResponse'"
                                      :id="questionName" :maxlength="question.maxlength"></textarea>
                            <input :disabled="editDisabled" class="form-control" type="text" v-if="question.questionType == 'shortAnswer'"
                                   :id="questionName" :maxlength="question.maxlength">
                            <div v-if="question.questionType == 'boolean'">
                                <div class="form-check form-check-inline" :id="questionName">
                                    <input :disabled="editDisabled" class="form-check-input" type="radio" :name="questionName"
                                           :id="questionName + '1' ">
                                    <label class="form-check-label" :for="questionName + '1' ">Yes</label>
                                </div>
                                <div class="form-check form-check-inline" :id="questionName">
                                    <input :disabled="editDisabled" class="form-check-input" type="radio" :name="questionName"
                                           :id="questionName + '0' ">
                                    <label class="form-check-label" :for="questionName + '0' ">No</label>
                                </div>
                            </div>
                            <div v-if="question.questionType == 'multiradio'">
                                <div v-for="option in question.enum.values.split('|')"
                                     class="form-check form-check-inline" :id="questionName">
                                    <input :disabled="editDisabled" class="form-check-input" type="radio" :name="questionName"
                                           :id="questionName + option">
                                    <label class="form-check-label" :for="questionName + option">{{option}}</label>
                                </div>
                            </div>
                            <div v-if="question.questionType == 'multicheck'">
                                <div v-for="option in question.enum.values.split('|')"
                                     class="form-check form-check-inline" :id="questionName">
                                    <input :disabled="editDisabled" class="form-check-input" type="checkbox" :name="questionName"
                                           :id="questionName + option ">
                                    <label class="form-check-label" :for="questionName + option ">{{option}}</label>
                                </div>
                            </div>
                            <div v-if="question.questionType == 'contract'" style="margin-left: 20px" >
                                <input class="form-check-input" :disabled="editDisabled" type="checkbox" :name="questionName" :id="questionName">
                                <label :for="questionName"><b><span v-html="question.question"></span> <span v-if="question.mandatory"
                                                                                                                                     style="color: red">*</span></b></label>
                            </div>
                            <select  :disabled="editDisabled" v-if="question.questionType == 'dropdown'" class="form-control" :id="questionName">
                                <option v-for="option in question.enum.values.split('|')">{{option}}
                                </option>
                            </select>
                            <v-select :disabled="editDisabled" v-if="question.questionType == 'schoolSearch'" :id="questionName"
                                      :options="settings.schools" :placeholder="schoolPlaceholder" v-model="school"
                                      taggable></v-select>
                        </div>

                        <br>
                        <p v-if="user.profile.signature !== -1">Time of submission: {{moment(user.lastUpdated)}}</p>
                        <p v-if="!editDisabled">Remember: You <b>CANNOT</b> modify your application after you submit!</p>
                        <button v-if="user.profile.signature === -1" type="button" class="generic-button-dark less-wide" v-on:click="saveApplication(false)">Save</button>
                        <button v-if="!editDisabled" type="submit" class="generic-button-dark less-wide">Submit</button>
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
    import AuthService from '../src/AuthService'
    import ApiService from '../src/ApiService'
    import $ from 'jquery'
    import moment from 'moment'
    import vSelect from 'vue-select'

    export default {
        data() {
            return {
                loading: true,
                loadingError: '',

                error: '',
                applications: {},
                settings: Session.getSettings(),
                applicationHTML: '',
                schoolPlaceholder: 'Select a school',
                applicationValue: {},
                saveTimer: null,
                school: null,
                user: Session.getUser(),

                editDisabled: false,
                editWarning: ''
            }
        },
        components: {
            vSelect
        },
        beforeMount() {

            this.checkEditState();

            console.log(this.settings);
            ApiService.getApplications((err, applications) => {
                this.loading = false;

                if (err || !applications) {
                    this.loadingError = err ? err : 'Something went wrong :\'('
                } else {
                    this.applications = applications
                }
            });
        },
        mounted() {
            this.$nextTick(function () {
                ApiService.getApplications((err, applications) => {
                    if (err || !applications) {
                        this.error = err ? err : 'Something went wrong :\'('
                    } else {
                        this.applications = applications;
                        this.populateApplication();
                        if (this.user.profile.signature === -1) {
                            this.saveTimer = setInterval(function () {
                                this.autoSave();
                            }.bind(this), 60000);
                            console.log(this.user.profile.signature)
                        }
                    }
                });
            })
        },
        methods: {
            moment (date) {
                return moment(date).format('MMMM Do YYYY, h:mm:ss')
            },
            checkEditState() {
                this.editDisabled = this.user.profile.isSigned || !this.settings.registrationOpen;

                if (this.user.profile.isSigned) {
                    this.editWarning = 'You cannot edit your application as you have already submitted.';
                } else if (!this.settings.registrationOpen) {
                    this.editWarning = 'You cannot edit your application as the submission window has passed.';
                }
            },
            populateApplication() {
                if (this.user.status.submittedApplication && this.user.profile.hacker != null) {

                    console.log('adding values');
                    //populate the fields with what they submitted
                    var userApp = this.user.profile.hacker;

                    Object.keys(userApp).forEach((field) => {

                        console.log(userApp[field])

                        if (this.applications.hacker[field].questionType == 'multicheck') {
                            userApp[field].forEach((checkedBox) => {
                                //check 'em all!
                                document.getElementById(field + checkedBox).checked = true;
                            });
                        } else if (this.applications.hacker[field].questionType == 'multiradio' || this.applications.hacker[field].questionType == 'boolean') {
                            //check only the radio box that was checked

                            if (this.applications.hacker[field].questionType == 'boolean') {
                                if (userApp[field]) {
                                    userApp[field] = 1;
                                } else {
                                    userApp[field] = 0;
                                }
                            }
                            console.log("field", field + userApp[field]);

                            if (document.getElementById(field + userApp[field])) {
                                document.getElementById(field + userApp[field]).checked = true;
                            }
                        } else if (this.applications.hacker[field].questionType == 'schoolSearch') {
                            this.schoolPlaceholder = userApp[field];
                            this.school = userApp[field];
                        } else if (this.applications.hacker[field].questionType == 'contract') {
                            document.getElementById(field).checked = userApp[field] == "true";
                        } else if (document.getElementById(field)) {
                            document.getElementById(field).value = userApp[field];
                        } else {
                            console.log(field, 'is broken!')
                        }
                    })
                }
            },
            parseForm(template, validate) {
                
                var doNotSubmit = false;
                var submissionErrors = [];
                var formValue = {};

                Object.keys(template).forEach((question) => {
                    console.log(template[question].questionType);
                    if (template[question].questionType == 'multicheck') {
                        var checked = [];
                        $("input[name='" + question + "']:checked").each(function () {
                            checked.push($(this).attr('id').replace(question, ''));
                        });

                        if (validate && template[question].mandatory && checked.length < 1) {
                            submissionErrors.push('Field "' + (template[question].question.length < 50 ? template[question].question : question) + '" is mandatory!');
                            doNotSubmit = true;
                        }

                        formValue[question] = checked;
                    } else if (template[question].questionType == 'contract') {

                        var agreed = 'false'

                        $("input[name='" + question + "']:checked").each(function () {
                            agreed = 'true'
                        });

                        if (validate && template[question].mandatory && agreed != 'true') {
                            submissionErrors.push(template[question].warning);
                            doNotSubmit = true;
                        }

                        formValue[question] = agreed;
                    } else if (template[question].questionType == 'multiradio' || template[question].questionType == 'boolean') {
                        try {
                            formValue[question] = $("input[name='" + question + "']:checked").attr('id').replace(question, '');
                        } catch (error) {
                            //invalid
                            if (validate && template[question].mandatory) {
                                submissionErrors.push('Field "' + (template[question].question.length < 50 ? template[question].question : question) + '" is mandatory!');
                                doNotSubmit = true;
                            } else {
                                formValue[question] = null;
                            }
                        }

                    } else if (template[question].questionType == 'schoolSearch') {

                        if (validate && this.school && this.school.length > template[question].maxlength) {
                            submissionErrors.push('Field "' + question + '" exceeds character limit!');
                            doNotSubmit = true;
                        } else if (this.school) {
                            formValue[question] = this.school;
                        } else {
                            //invalid
                            if (validate && template[question].mandatory) {
                                submissionErrors.push('Field "' + (template[question].question.length < 50 ? template[question].question : question) + '" is mandatory!');
                                doNotSubmit = true;
                            } else {
                                formValue[question] = null;
                            }
                        }

                    } else {
                        var inputElement = document.getElementById(question);

                        if ($.trim($(inputElement).val()) == '') {
                            if (validate && template[question].mandatory) {
                                submissionErrors.push('Field "' + ((question.includes('fullResponse') || template[question].question.length < 50) ? template[question]['question'] : question) + '" is mandatory!');
                                doNotSubmit = true;
                            } else {
                                formValue[question] = null;
                            }
                        } else if (validate && inputElement.value.length > template[question].maxlength) {
                            submissionErrors.push('Field "' + question + '" exceeds character limit!');
                            doNotSubmit = true;
                        } else {
                            if (this.saveTimer) {
                                clearInterval(this.saveTimer)
                            }
                            formValue[question] = inputElement.value;
                        }


                    }
                });
                
                return {doNotSubmit: doNotSubmit, submissionErrors: submissionErrors, profile: formValue}
                
            },
            submitApplication() {

                var parsedForm = this.parseForm(this.applications.hacker, true)

                if (parsedForm.doNotSubmit) {
                    swal({
                        title: 'Error',
                        html: '<p style="text-align: left"><b>' + (parsedForm.submissionErrors.length ? parsedForm.submissionErrors.join('<br>') + ' <br>' : '') + "</b></p> Please check all the required fields and try again.",
                        type: 'error'
                    })
                } else {

                    swal({
                        title: 'Submit Application',
                        html: 'Are you sure you want to submit your application?<br><br>You <b>CANNOT</b> modify your application after you submit!',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Submit',
                        type: 'warning'
                    }).then((result) => {
                        if (result.value) {

                            //ajax submit code
                            var data = {};
                            data.userID = Session.getUserID();
                            data.profile = {};
                            data.profile.hacker = parsedForm.profile;
                            data.profile.signature = 1;
                            console.log(data)
                            AuthService.sendRequest('POST', '/api/updateProfile', data, (err, user) => {
                                if (err) {
                                    swal("Error", err.responseJSON['error'], "error");
                                } else {
                                    Session.setUser(user);
                                    this.user = user;
                                    this.checkEditState();
                                    swal("Success", "Your application has been submitted!", "success");
                                }
                            });
                        }
                    });
                }
            },
            autoSave () {
              this.saveApplication(true)
            },
            saveApplication(auto) {
                var parsedForm = this.parseForm(this.applications.hacker, false)
                if (!auto) {
                    swal.showLoading()
                }
                //ajax submit code
                var data = {};
                data.userID = Session.getUserID();
                data.profile = {};
                data.profile.hacker = parsedForm.profile;
                data.profile.signature = -1;
                AuthService.sendRequest('POST', '/api/updateProfile', data, (err, user) => {
                    if (!auto) {
                        if (err) {
                            swal("Error", err.responseJSON['error'], "error");
                        } else {
                            swal("Success", "Your application has been saved!", "success");
                            Session.setUser(user);
                            this.user = user;
                            this.checkEditState();

                        }
                    }
                });
            }
        }
    }
</script>
