<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>OWNER</h2>
                </div>
            </div>
            <div class="ui-grid">
                <div class="ui-card ui-grid-item" id="dash-card">
                    <h3>Application Dates</h3>
                    <hr>
                    <h6>
                        Registration Open: {{moment(settings.timeOpen)}}
                    </h6>
                    <p>
                        <input type="datetime-local" v-model="timeOpen"/>
                    </p>
                    <p>
                        Registration Close: {{moment(settings.timeClose)}}
                        <input type="datetime-local" v-model="timeClose"/>
                    </p>
                    <p>
                        Confirmation Deadline: {{moment(settings.timeConfirm)}}
                        <input type="datetime-local" v-model="timeConfirm"/>
                    </p>

                    <button class="generic-button-dark" @click="changeTimes">Update time</button>
                </div>

                <div class="ui-card ui-grid-item" id="dash-card">
                    <h3>Email Templates</h3>
                    <hr>
                    <select style="margin-bottom: 10px;" v-model="selected">
                        <option disabled value="">Select a template</option>
                        <option v-for="option in templateOptions.length">{{templateOptions[option-1]}}</option>
                    </select>

                    <button class="generic-button-dark" @click="getTemplate">Get Template</button>
                    <hr>
                    <p>
                        Current Participant Limit:
                        <input type="number" v-model="maxParticipants" style="margin-bottom: 10px;">
                        <button class="generic-button-dark" @click="changeLimit">Update Participant Limit</button>
                    </p>
                </div>
            </div>
            <div class="ui-card" id="dash-card" style="margin-bottom: 50px" :style="{display: emailHTML?'block':'none'}">
                <h3>Email Preview</h3>
                <hr>
                <div v-html="previewHTML" style="height: 50vh; overflow: auto;"></div>
            </div>
            <div class="ui-card" style="height: auto" :style="{display: emailHTML?'block':'none'}">
                <h3>Email Editor</h3>
                <hr>
                <div id="email-editor">
                </div>

                <button class="generic-button-dark" @click="saveTemplate">Save</button>
            </div>
        </div>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService'
    import Session from '../src/Session'
    import moment  from 'moment'
    import swal    from 'sweetalert2'

    import hljs from 'highlight.js'
    import 'highlight.js/styles/monokai-sublime.css'
    import 'quill/dist/quill.snow.css'
    import Quill   from 'quill'

    export default {
        data() {
            return {
                timeOpen: 0,
                timeClose: 0,
                timeConfirm: 0,
                settings: 0,
                editor: null,
                emailHTML: '',
                previewHTML: '',
                baseHTMLFront: '',
                baseHTMLBack: '',
                maxParticipants: 0,
                templateOptions: [],
                selected: ''
            }
        },
        beforeMount() {
            this.convertTimes()
            AuthService.sendRequest('GET', '/api/email/listTemplates', null, (err, data) => {
                if (err) {
                    console.log('Error while getting template')
                } else {
                    this.templateOptions = data.validTemplates
                }
            })

            AuthService.sendRequest('GET', '/api/email/get/base', null, (err, data) => {
                if (err) {
                    swal('Error', err, 'error')
                } else {
                    let base = data.email.split('{{emailData}}');
                    this.baseHTMLFront = base[0]
                    this.baseHTMLBack = base[1]
                }
            })
        },
        mounted() {
            this.editor = new Quill('#email-editor', {
                modules: {
                    syntax: {
                        highlight: text => hljs.highlightAuto(text).value
                    },
                    toolbar: [
                        ['clean', 'code-block']
                    ]
                },
                theme: 'snow'
            })

            this.editor.on('text-change', (delta, oldDelta, source) => {
                this.emailHTML = this.editor.getText()
                this.generatePreview()
            })

        },
        methods: {
            convertTimes() {
                this.settings = Session.getSettings()
                this.timeOpen = moment(this.settings.timeOpen).format('YYYY-MM-DDTHH:mm:ss')
                this.timeClose = moment(this.settings.timeClose).format('YYYY-MM-DDTHH:mm:ss')
                this.timeConfirm = moment(this.settings.timeConfirm).format('YYYY-MM-DDTHH:mm:ss')
                this.maxParticipants = this.settings.maxParticipants
            },
            moment (date) {
                return moment(date).format('MMMM Do YYYY, h:mm:ss')
            },
            changeLimit() {
                swal({
                    title: 'Are you sure?',
                    text: 'This edit could have devastating effects!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            swal.showLoading()
                            AuthService.sendRequest('POST', '/api/updateParticipantLimit', {
                                'maxParticipants': this.maxParticipants
                            }, (err, setting) => {
                                if (err || !setting) {
                                    swal('Error', err.error, 'error')
                                } else {
                                    swal('Success', 'Limit has beens changed successfully', 'success')
                                    Session.setSettings(setting)
                                    this.convertTimes()
                                }
                            })
                        })
                    }
                })
            },
            changeTimes () {
                swal({
                    title: 'Are you sure?',
                    text: 'This edit will affect all hackers!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            swal.showLoading()
                            AuthService.sendRequest('POST', '/api/updateRegistrationTime', {
                                timeOpen: moment(this.timeOpen).unix() * 1000,
                                timeClose: moment(this.timeClose).unix() * 1000,
                                timeConfirm: moment(this.timeConfirm).unix() * 1000
                            }, (err, setting) => {
                                if (err || !setting) {
                                    swal('Error', err.error, 'error')
                                } else {
                                    swal('Success', 'Application times has been changed', 'success')
                                    Session.setSettings(setting)
                                    this.convertTimes()
                                }
                            })
                        })
                    }
                })
            },
            getTemplate () {
                if (this.selected == '') {
                    swal('Error', 'You must select an email first', 'error')
                } else {
                    swal.showLoading()

                    AuthService.sendRequest('GET', '/api/email/get/' + this.selected, null, (err, data) => {
                        if (err) {
                            swal('Error', err, 'error')
                        } else {
                            swal('Success', 'Your Preview and Editor has been updated', 'success')
                            this.emailHTML = data.email
                            this.editor.setText(this.emailHTML);
                            this.editor.formatLine(0, this.editor.getLength(), { 'code-block': true });
                        }
                    })
                }
            },
            saveTemplate() {
                swal({
                    title: 'Are you sure?',
                    text: 'This edit will affect the template permanently!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            swal.showLoading()
                            AuthService.sendRequest('POST', 'api/email/set/' + this.selected, {
                                templateHTML: this.emailHTML,
                                templateName: this.selected
                            }, (err, data) => {
                                if (err || !data) {
                                    swal('Error', err.error, 'error')
                                } else {
                                    swal('Success', 'Template set', 'success')
                                }
                            })
                        })
                    }
                })
            },
            generatePreview () {
                this.previewHTML = this.baseHTMLBack + this.emailHTML + this.baseHTMLFront
            }
        }
    }
</script>

<style>
    .ql-editor {
        height: 50vh !important;
        width: 50vw !important;
        overflow-y: auto !important;
        overflow-x: auto !important;
    }

    .ql-syntax {
        display: inline-block !important;
    }

    .ql-syntax span {
        display: inline-block !important;
        white-space: nowrap;
    }

</style>