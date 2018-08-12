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
                    <h3>Log</h3>
                    <h4>{{$parent.user.status.name.toUpperCase()}}</h4>
                    <hr>
                    <p><span class="emphasis">Welcome {{$parent.user.fullName}},</span><br>
                        This is the MasseyHacks V Dashboard
                    </p>
                </div>
                <div class="ui-card ui-grid-item" id="dash-card">
                    <h3>Log</h3>
                    <h4>{{$parent.user.status.name.toUpperCase()}}</h4>
                    <hr>
                    <p><span class="emphasis">Welcome {{$parent.user.fullName}},</span><br>
                        This is the MasseyHacks V Dashboard
                    </p>
                </div>
                <div class="ui-card ui-grid-item" id="dash-card">
                    <h3>Log</h3>
                    <h4>{{$parent.user.status.name.toUpperCase()}}</h4>
                    <hr>
                    <p><span class="emphasis">Welcome {{$parent.user.fullName}},</span><br>
                        This is the MasseyHacks V Dashboard
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import moment  from 'moment'

    export default {
        data() {
            return {
                timeOpen: 0,
                timeClose: 0,
                timeConfirm: 0,
                settings: 0
            }
        },
        beforeMount() {
            this.convertTimes()
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
                Session.sendRequest("POST", "/api/updateRegistrationTime", {
                    timeOpen: moment(this.timeOpen).unix() * 1000,
                    timeClose: moment(this.timeClose).unix() * 1000,
                    timeConfirm: moment(this.timeConfirm).unix() * 1000
                }, (err, setting) => {
                    if (err || !setting) {
                        console.log("error " + err.error)
                    } else {
                        console.log("success")
                        Session.setSettings(setting)
                        this.convertTimes()
                    }
                })
            }
        }
    }
</script>