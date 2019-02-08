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
                            <input :disabled="editDisabled" class="form-control" type="text" v-if="question.questionType == 'birthday'"
                                   :id="questionName" :maxlength="question.maxlength">
                            <input :disabled="editDisabled" class="form-control" type="text" v-if="question.questionType == 'phoneNumber'"
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

                oldApplication: {},

                editDisabled: false,
                editWarning: ''
            }
        },
        components: {
            vSelect
        },
        beforeRouteLeave(to, from, next) {
            console.log('hai', to, from);

            if (1 + 1 == 4 && this.modified()) {

                swal({
                    title: 'Are you sure you want to leave?',
                    html: 'Changes you made have not been saved!<br>Do you want to continue?',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Leave page',
                    dangerMode: true,
                    type: 'warning'
                }).then((result) => {
                    if (result.value) {
                        //document.removeEventListener('beforeunload', this.handler);
                        next();
                    }
                });
            }  else {
                console.log('unloaded')
                //document.removeEventListener('beforeunload', this.handler);
                next();
            }

        },
        beforeMount() {
            console.log(this.settings);
            ApiService.getApplications((err, applications) => {
                this.loading = false;

                if (err || !applications) {
                    this.loadingError = err ? err : 'Something went wrong :\'('
                } else {
                    this.applications = applications
                    this.checkEditState();
                }
            });
        },
        mounted() {

            //window.addEventListener('beforeunload', this.handler);

            this.$nextTick(function () {
                ApiService.getApplications((err, applications) => {
                    if (err || !applications) {
                        this.error = err ? err : 'Something went wrong :\'('
                    } else {
                        this.applications = applications;
                        this.populateApplication();
                        if (this.user.profile.signature === -1 && this.settings.registrationOpen) {
                            this.saveTimer = setInterval(function () {
                                this.autoSave();
                            }.bind(this), 60000);
                            console.log(this.user.profile.signature)
                        }
                        this.checkEditState();
                    }
                });
            })
        },
        methods: {
            handler(event) {
                console.log('Exit listener triggered');

                if (this.modified()) {
                    event.returnValue = `Are you sure you want to leave?`;
                }
            },
            moment (date) {
                return moment(date).format('LLLL')
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
                if (this.user.profile.hacker != null) {

                    console.log('adding values');
                    //populate the fields with what they submitted
                    var userApp = this.user.profile.hacker;

                    this.oldApplication = this.user.profile.hacker;

                    Object.keys(userApp).forEach((field) => {

                        if (field in this.applications.hacker) {

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
                                    console.log('CHECKINGOFF BUSS')
                                }
                            } else if (this.applications.hacker[field].questionType == 'schoolSearch') {
                                this.schoolPlaceholder = userApp[field];
                                this.school = userApp[field];
                            } else if (this.applications.hacker[field].questionType == 'contract') {
                                document.getElementById(field).checked = userApp[field];
                            } else if (document.getElementById(field)) {
                                document.getElementById(field).value = userApp[field];
                            } else {
                                console.log(field, 'is broken!')
                            }
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

                        var agreed = false

                        $("input[name='" + question + "']:checked").each(function () {
                            agreed = true
                        });

                        if (validate && template[question].mandatory && !agreed) {
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

                    } else if (template[question].questionType == 'birthday') {
                        var inputElement = document.getElementById(question);
                        var birthdayValues = inputElement.value.split("/");

                        var birthdayDate = new Date();
                        birthdayDate.setFullYear(parseInt(birthdayValues[0]), parseInt(birthdayValues[1]) - 1, parseInt(birthdayValues[2]));

                        if (validate && (inputElement.value.length != template[question].maxlength || birthdayValues.length != 3)) {
                            submissionErrors.push('Please enter your birthday in the proper format!');
                            doNotSubmit = true;
                        } else if ((birthdayDate.getFullYear() != parseInt(birthdayValues[0])) || (birthdayDate.getMonth() != parseInt(birthdayValues[1]) - 1) || (birthdayDate.getDate() != parseInt(birthdayValues[2]))) {
                            if (validate && template[question].mandatory) {
                                submissionErrors.push('Please enter a valid birthday!');
                                doNotSubmit = true;
                            } else {
                                formValue[question] = null;
                            }
                        } else if((new Date()).getFullYear() - birthdayDate.getFullYear() > 130){
                            if (validate && template[question].mandatory) {
                                submissionErrors.push('Sorry, but you cannot be over 130 years old!');
                                doNotSubmit = true;
                            } else {
                                formValue[question] = null;
                            }
                        } else {
                            formValue[question] = inputElement.value;
                        }

                    } else if(template[question].questionType == 'phoneNumber') {
                        var phoneNumber = document.getElementById(question).value;
                        if(phoneNumber.length > template[question].maxlength){
                            if (validate) {
                                submissionErrors.push('Your phone number is too long! The maximum length is 11 digits.')
                                doNotSubmit = true
                            } else {
                                formValue[question] = null;
                            }
                        } else if(isNaN(phoneNumber)){
                            if (validate) {
                                submissionErrors.push('Please enter your phone number without any symbols or letters!')
                                doNotSubmit = true
                            } else {
                                formValue[question] = null;
                            }
                        }
                        else {
                            formValue[question] = phoneNumber
                        }
                    }
                    else {
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
                                    this.oldApplication = user.profile.hacker;

                                    this.checkEditState();
                                    swal("Success", "Your application has been submitted!", "success");
                                }
                            });
                        }
                    });
                }
            },
            autoSave () {
                if (this.modified()) {
                    this.saveApplication(true)
                }
            },
            modified() {

                if (this.editDisabled) {
                    return false;
                }

                var profile = this.parseForm(this.applications.hacker, false).profile;
                var oldApp = JSON.parse(JSON.stringify(this.oldApplication));

                console.log(oldApp, profile);

                for (var field in profile) {

                    // Ghetto boolean parsing
                    if (['true', 'false', '1', '0', true, false, 1, 0].includes(profile[field])) {
                        profile[field] = ['true', '1', true, 1].includes(profile[field]);
                    }

                    if (['true', 'false', '1', '0', true, false, 1, 0].includes(oldApp[field])) {
                        oldApp[field] = ['true', '1', true, 1].includes(oldApp[field]);
                    }

                    if (JSON.stringify(oldApp[field]) != JSON.stringify(profile[field])) {
                        console.log('field is diff!!!', field, oldApp[field], profile[field]);
                        return true;
                    }
                }

                return false;
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
                            this.oldApplication = user.profile.hacker;

                            this.checkEditState();

                        }
                    }
                });
            }
        }
    }
</script>
