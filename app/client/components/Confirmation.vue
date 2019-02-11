<template>
    <div class="app-screen">

        <div class="title-card col-md-12" style="position: absolute">
            <h2>CONFIRMATION</h2>
        </div>

        <div class="spacer content-spacer">

        </div>
        <div class="container vertical-centered content-vertical-centered">

            <!--
            <div v-if="user.status.confirmed" class="ui-card dash-card">
                <p>You are already confirmed</p>

                <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
                <button v-on:click="submitFile()">Submit</button>

                <img :src="waiver" width="500px">
            </div>-->

            <div v-if="user.status.declined" class="ui-card dash-card">
                <p style="margin: 0">You declined your invitation :(</p>
            </div>
            <div v-else="" class="ui-card dash-card-large">

                <div style="text-align: left !important;">
                    <h4 v-if="user.status.confirmed">

                        <b>You confirmed on {{moment(user.confirmedTimestamp)}}</b>

                    </h4>
                    <h4 v-else="">
                        <b>You are not confirmed!</b>
                    </h4>
                </div>

                <br>


                <!-- Copied froom application -->
                <div class="form-group" v-for="(question,questionName) in applications.confirmation" style="text-align: left">

                    <h4 v-if="question.precaption">
                        {{question.precaption}}
                    </h4>

                    <label :for="questionName" v-if="question.questionType != 'contract'"><b>{{question.question}} <span v-if="question.mandatory"
                                                                                                                         style="color: red">*</span></b></label>
                    <br v-if="question.note">
                    <label :for="questionName" v-if="question.note">{{question.note}}</label>

                    <textarea class="form-control" v-if="question.questionType == 'fullResponse'"
                              :id="questionName" :maxlength="question.maxlength"></textarea>
                    <input class="form-control" type="text" v-if="question.questionType == 'shortAnswer'"
                           :id="questionName" :maxlength="question.maxlength">
                    <div v-if="question.questionType == 'boolean'">
                        <div class="form-check form-check-inline" :id="questionName">
                            <input class="form-check-input" type="radio" :name="questionName"
                                   :id="questionName + '1' ">
                            <label class="form-check-label" :for="questionName + '1' ">Yes</label>
                        </div>
                        <div class="form-check form-check-inline" :id="questionName">
                            <input class="form-check-input" type="radio" :name="questionName"
                                   :id="questionName + '0' ">
                            <label class="form-check-label" :for="questionName + '0' ">No</label>
                        </div>
                    </div>
                    <div v-if="question.questionType == 'multiradio'">
                        <div v-for="option in question.enum.values.split('|')"
                             class="form-check form-check-inline" :id="questionName">
                            <input class="form-check-input" type="radio" :name="questionName"
                                   :id="questionName + option">
                            <label class="form-check-label" :for="questionName + option">{{option}}</label>
                        </div>
                    </div>
                    <div v-if="question.questionType == 'multicheck'">
                        <div v-for="option in question.enum.values.split('|')"
                             class="form-check form-check-inline" :id="questionName">
                            <input class="form-check-input" type="checkbox" :name="questionName"
                                   :id="questionName + option ">
                            <label class="form-check-label" :for="questionName + option ">{{option}}</label>
                        </div>
                    </div>
                    <div v-if="question.questionType == 'contract'" style="margin-left: 20px" >
                        <input class="form-check-input" type="checkbox" :name="questionName" :id="questionName">
                        <label :for="questionName"><b>{{question.question}} <span v-if="question.mandatory"
                                                                                  style="color: red">*</span></b></label>
                    </div>
                    <select  v-if="question.questionType == 'dropdown'" class="form-control" :id="questionName">
                        <option v-for="option in question.enum.values.split('|')">{{option}}
                        </option>
                    </select>
                    <v-select v-if="question.questionType == 'schoolSearch'" :id="questionName"
                              :options="settings.schools" :placeholder="schoolPlaceholder" v-model="school"
                              taggable></v-select>

                    <br>

                </div>


                Don’t forget, you <b>MUST</b> have your waiver signed to attend MasseyHacks.<br> You can either give us the hard copy at the front desk during registration or email a copy to <a href="mailto:hello@masseyhacks.ca" target="_blank">hello@masseyhacks.ca</a>.

                <br>
                <br>

                <a href="https://docs.google.com/document/d/10BuXfp0PlrNDA7DY6fx_T13VZLbQh1FMUbDYAdZyOYo/edit?usp=sharing" target="_blank">
                    <button class="generic-button-dark less-wide">
                        Waiver
                    </button>
                </a>

                <button class="generic-button less-wide" v-on:click="acceptInvitation">
                    <span v-if="user.status.confirmed">
                        Update Confirmation
                    </span>
                    <span v-else>
                        Confirm
                    </span>
                </button>
                <button class="generic-button less-wide" v-on:click="denyInvitation">Decline</button>
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
                return moment(date).format('LLLL')
            },
            populateApplication() {
                if (this.user.status.confirmed && this.user.profile.confirmation != null) {

                    console.log('adding values');
                    //populate the fields with what they submitted
                    var userApp = this.user.profile.confirmation;

                    Object.keys(userApp).forEach((field) => {

                        console.log(userApp[field])

                        if (document.getElementById(field)) {
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
                        title: "Confirm?",
                        text: "Are you sure you want to confirm?",
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
                    title: "Decline invitation?",
                    html: "Are you sure you want to decline your invitation? You <b>CANNOT</b> undo this action!",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    focusCancel: true,
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
                                this.user = data
                                Session.setUser(data)
                            }

                        })
                    }

                })
            }
        }
    }
</script>
