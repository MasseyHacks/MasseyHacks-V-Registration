<template>
    <div class="app-screen">

        <div class="title-card col-md-12" style="position: absolute; top: 10% !important;">
            <h2>CONFIRMATION</h2>
        </div>

        <div class="spacer"></div>
        <div class="container vertical-centered">

            <div v-if="user.status.confirmed" class="ui-card dash-card">
                <p>You are already confirmed</p>

                <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
                <button v-on:click="submitFile()">Submit</button>

                <img :src="waiver" width="500px">
            </div>
            <div v-else-if="user.status.declined" class="ui-card dash-card">
                <p>You declined your invitation :(</p>
            </div>
            <div v-else="" class="ui-card dash-card-large">

                <!-- Copied froom application -->
                <div class="form-group" v-for="(question,questionName) in applications.confirmation" style="text-align: left">

                    <h4 v-if="question.precaption">
                        {{question.precaption}}
                    </h4>

                    <label :for="questionName" v-if="question.questionType != 'contract'"><b>{{question.question}} <span v-if="question.mandatory"
                                                                                                                         style="color: red">*</span></b></label>
                    <br v-if="question.note">
                    <label :for="questionName" v-if="question.note">{{question.note}}</label>

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
                        <label :for="questionName"><b>{{question.question}} <span v-if="question.mandatory"
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

                <button class="generic-button" v-on:click="acceptInvitation">Confirm</button>
                <button class="generic-button" v-on:click="denyInvitation">Decline</button>
            </div>
        </div>
    </div>
</template>

<script>

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
                user: Session.getUser(),
                waiver: '',
                applications: {},
                file: ''
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
                    }
                });
            })

            /*
       AuthService.sendRequest('GET', '/api/getResourceAuthorization?filename=asdsad-waiver-wtf.jpg', {}, (err, msg) => {
           if (err) {
               console.log(err)
           } else {
               this.waiver = msg
           }
       });*/
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

                        if (this.applications.confirmation[field].questionType == 'multicheck') {
                            userApp[field].forEach((checkedBox) => {
                                //check 'em all!
                                document.getElementById(field + checkedBox).checked = true;
                            });
                        } else if (this.applications.confirmation[field].questionType == 'multiradio' || this.applications.confirmation[field].questionType == 'boolean') {
                            //check only the radio box that was checked

                            if (this.applications.confirmation[field].questionType == 'boolean') {
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
                        } else if (this.applications.confirmation[field].questionType == 'schoolSearch') {
                            this.schoolPlaceholder = userApp[field];
                            this.school = userApp[field];
                        } else if (this.applications.confirmation[field].questionType == 'contract') {
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
            handleFileUpload() {
                this.file = this.$refs.file.files[0];
            },
            submitFile() {
                let formData = new FormData();

                console.log(this.file)

                formData.append('file', this.file);
                formData.append('id', Session.getUserID());

                console.log('DIS IS FORM', formData.get('file'))

                AuthService.sendRequest('POST', '/api/uploadWaiver', formData, (err, msg) => {
                   console.log(err, msg)
                }, 'multipart/form-data; charset=utf-8');

            },
            acceptInvitation() {

                var parsedForm = this.parseForm(this.applications.confirmation, true)

                if (parsedForm.doNotSubmit) {
                    swal({
                        title: 'Error',
                        html: '<p style="text-align: left"><b>' + (parsedForm.submissionErrors.length ? parsedForm.submissionErrors.join('<br>') + ' <br>' : '') + "</b></p> Please check all the required fields and try again.",
                        type: 'error'
                    })
                } else {
                    swal({
                        title: "Hey!",
                        text: "Are you sure you want to accept your invitation?",
                        type: "question",
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes!'
                    }).then((result) => {
                        if (result.value) {
                            AuthService.sendRequest('POST', '/api/acceptInvitation', {
                                confirmation: parsedForm.profile
                            }, (err, data) => {
                                if (err || !data) {
                                    swal("Error", err.error, "error");
                                } else {
                                    this.user = data
                                    Session.setUser(data)
                                    console.log(this.user.status.name);

                                    swal({
                                        title: "Success",
                                        text: "You have confirmed your spot!",
                                        type: "success"
                                    });
                                }

                            })
                        }

                    })
                }
            },
            denyInvitation() {
                swal({
                    title: "Hey!",
                    text: "Are you sure you want to decline your invitation?",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.sendRequest('POST', '/api/declineInvitation', {

                        }, (err, data) => {
                            if (err || !data) {
                                swal("Error", err.error, "error");
                            } else {
                                swal({
                                    title: "Success",
                                    text: "You have declined your invitation.",
                                    type: "success"
                                });
                                this.user = Session.getUser()
                            }

                        })
                    }

                })
            }
        }
    }
</script>
