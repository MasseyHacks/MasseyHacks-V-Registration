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
                    <select v-model="selected">
                        <option disabled value="">Select a template</option>
                        <option v-for="option in templateOptions.length">{{templateOptions[option]}}</option>
                    </select>

                    <button class="generic-button-dark" @click="getTemplate">Get Template</button>
                </div>
            </div>
            <div class="ui-card" id="dash-card" style="margin-bottom: 50px">
                <h3>Email Preview</h3>
                <hr>
                <div v-html="previewHTML" style="height: 50vh; overflow: auto;"></div>
            </div>
            <div class="ui-card" style="height: auto">
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
                emailHTML: "",
                previewHTML: "",
                templateOptions: [],
                selected: ""
            }
        },
        beforeMount() {
            this.convertTimes()
            Session.sendRequest("GET", "http://localhost:3005/api/email/listTemplates", null, (err, data) => {
                if (err) {
                    console.log("Error while getting template")
                } else {
                    this.templateOptions = data.validTemplates
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
                        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                        ['blockquote', 'code-block'],

                        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                        [{ 'direction': 'rtl' }],                         // text direction

                        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                        [{ 'font': [] }],
                        [{ 'align': [] }],

                        ['clean', 'code-block']                                         // remove formatting button
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
                this.timeOpen = moment(this.settings.timeOpen).format("YYYY-MM-DDTHH:mm:ss")
                this.timeClose = moment(this.settings.timeClose).format("YYYY-MM-DDTHH:mm:ss")
                this.timeConfirm = moment(this.settings.timeConfirm).format("YYYY-MM-DDTHH:mm:ss")
            },
            moment (date) {
                return moment(date).format('MMMM Do YYYY, h:mm:ss')
            },
            changeTimes () {
                swal({
                    title: 'Are you sure?',
                    text: "This edit will affect all hackers!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading()
                        Session.sendRequest("POST", "/api/updateRegistrationTime", {
                            timeOpen: moment(this.timeOpen).unix() * 1000,
                            timeClose: moment(this.timeClose).unix() * 1000,
                            timeConfirm: moment(this.timeConfirm).unix() * 1000
                        }, (err, setting) => {
                            if (err || !setting) {
                                swal("Error", err.error, "error")
                            } else {
                                swal("Success", "Application times has been changed", "success")
                                Session.setSettings(setting)
                                this.convertTimes()
                            }
                        })
                    }
                })
            },
            getTemplate () {
                if (this.selected == "") {
                    swal("Error", "You must select an email first", "error")
                } else {
                    swal.showLoading()

                    Session.sendRequest("GET", "/api/email/get/" + this.selected, null, (err, data) => {
                        if (err) {
                            swal("Error", err, "error")
                        } else {
                            swal("Success", "Your Preview and Editor has been updated", "success")
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
                    text: "This edit will affect the template permanently!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading()
                        Session.sendRequest("POST", "api/email/set/" + this.selected, {
                            templateHTML: this.emailHTML,
                            templateName: this.selected
                        }, (err, data) => {
                            if (err || !data) {
                                swal("Error", err.error, "error")
                            } else {
                                swal("Success", "Template set", "success")
                            }
                        })
                    }
                })
            },
            generatePreview () {
                this.previewHTML = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" +
                    "<html data-editor-version=\"2\" class=\"sg-campaigns\" xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
                    "<head>\n" +
                    "    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1\" /><!--[if !mso]><!-->\n" +
                    "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\" /><!--<![endif]-->\n" +
                    "    <!--[if (gte mso 9)|(IE)]>\n" +
                    "    <xml>\n" +
                    "        <o:OfficeDocumentSettings>\n" +
                    "            <o:AllowPNG/>\n" +
                    "            <o:PixelsPerInch>96</o:PixelsPerInch>\n" +
                    "        </o:OfficeDocumentSettings>\n" +
                    "    </xml>\n" +
                    "    <![endif]-->\n" +
                    "    <!--[if (gte mso 9)|(IE)]>\n" +
                    "    <style type=\"text/css\">\n" +
                    "        body {width: 600px;margin: 0 auto;}\n" +
                    "        table {border-collapse: collapse;}\n" +
                    "        table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}\n" +
                    "        img {-ms-interpolation-mode: bicubic;}\n" +
                    "    </style>\n" +
                    "    <![endif]-->\n" +
                    "\n" +
                    "    <style type=\"text/css\">\n" +
                    "        body, p, div {\n" +
                    "            font-family: helvetica,arial,sans-serif;\n" +
                    "            font-size: 16px;\n" +
                    "        }\n" +
                    "        body {\n" +
                    "            color: #232323;\n" +
                    "        }\n" +
                    "        body a {\n" +
                    "            color: #232323;\n" +
                    "            text-decoration: none;\n" +
                    "        }\n" +
                    "        p { margin: 0; padding: 0; }\n" +
                    "        table.wrapper {\n" +
                    "            width:100% !important;\n" +
                    "            table-layout: fixed;\n" +
                    "            -webkit-font-smoothing: antialiased;\n" +
                    "            -webkit-text-size-adjust: 100%;\n" +
                    "            -moz-text-size-adjust: 100%;\n" +
                    "            -ms-text-size-adjust: 100%;\n" +
                    "        }\n" +
                    "        img.max-width {\n" +
                    "            max-width: 100% !important;\n" +
                    "        }\n" +
                    "        .column.of-2 {\n" +
                    "            width: 50%;\n" +
                    "        }\n" +
                    "        .column.of-3 {\n" +
                    "            width: 33.333%;\n" +
                    "        }\n" +
                    "        .column.of-4 {\n" +
                    "            width: 25%;\n" +
                    "        }\n" +
                    "        @media screen and (max-width:480px) {\n" +
                    "            .preheader .rightColumnContent,\n" +
                    "            .footer .rightColumnContent {\n" +
                    "                text-align: left !important;\n" +
                    "            }\n" +
                    "            .preheader .rightColumnContent div,\n" +
                    "            .preheader .rightColumnContent span,\n" +
                    "            .footer .rightColumnContent div,\n" +
                    "            .footer .rightColumnContent span {\n" +
                    "                text-align: left !important;\n" +
                    "            }\n" +
                    "            .preheader .rightColumnContent,\n" +
                    "            .preheader .leftColumnContent {\n" +
                    "                font-size: 80% !important;\n" +
                    "                padding: 5px 0;\n" +
                    "            }\n" +
                    "            table.wrapper-mobile {\n" +
                    "                width: 100% !important;\n" +
                    "                table-layout: fixed;\n" +
                    "            }\n" +
                    "            img.max-width {\n" +
                    "                height: auto !important;\n" +
                    "                max-width: 480px !important;\n" +
                    "            }\n" +
                    "            a.bulletproof-button {\n" +
                    "                display: block !important;\n" +
                    "                width: auto !important;\n" +
                    "                font-size: 80%;\n" +
                    "                padding-left: 0 !important;\n" +
                    "                padding-right: 0 !important;\n" +
                    "            }\n" +
                    "            .columns {\n" +
                    "                width: 100% !important;\n" +
                    "            }\n" +
                    "            .column {\n" +
                    "                display: block !important;\n" +
                    "                width: 100% !important;\n" +
                    "                padding-left: 0 !important;\n" +
                    "                padding-right: 0 !important;\n" +
                    "            }\n" +
                    "        }\n" +
                    "    </style>\n" +
                    "    <!--user entered Head Start-->\n" +
                    "\n" +
                    "    <link href=\"https://use.fontawesome.com/releases/v5.0.2/css/all.css\" rel=\"stylesheet\">\n" +
                    "    <link href=\"https://fonts.googleapis.com/css?family=Raleway:300,400,700\" rel=\"stylesheet\">\n" +
                    "    <!--End Head user entered-->\n" +
                    "</head>\n" +
                    "<body>\n" + this.emailHTML + "</body>\n" +"</html>"
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