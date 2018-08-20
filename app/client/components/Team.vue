<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>TEAM</h2>
                </div>
            </div>

            <div class="row">
                <div class="ui-card dash-card">


                    <div v-if="loading">
                        <p>Loading...</p>
                    </div>
                    <div v-else-if="createTeamState">
                        Create Team

                        <input class="round-input" style="width: 100%" placeholder="Super Hax0r Team" v-model="teamName" type="text">

                        <br>
                        <div class="button-row">
                            <button class="generic-button-dark" v-on:click="createTeamState = false">back</button>
                            <button class="generic-button-dark" v-on:click="createTeam" :disabled="!teamName">create</button>
                        </div>
                    </div>
                    <div v-else-if="joinTeamState">
                        Join Team

                        <input class="round-input" style="width: 100%" placeholder="Team Code" v-model="teamCode" type="text">

                        <br>
                        <div class="button-row">
                            <button class="generic-button-dark" v-on:click="joinTeamState = false">back</button>
                            <button class="generic-button-dark" v-on:click="joinTeam" :disabled="!teamCode">join</button>
                        </div>
                    </div>
                    <div v-else-if="!team">
                        <p>You are currently not in a team.</p>

                        <div class="button-row">
                            <button class="generic-button-dark" v-on:click="switchCreateTeam">create</button>
                            <button class="generic-button-dark" v-on:click="switchJoinTeam">join</button>
                        </div>
                    </div>
                    <div v-else-if="team">
                        Team Name: {{team.name}} <br>
                        Team Code: {{team.code}} <br>
                        <br>

                        <span v-for="id in team.memberIDs">
                            {{id}}
                        </span>

                        <div class="button-row">
                            <button class="generic-button-dark" v-on:click="leaveTeam">leave</button>
                        </div>
                    </div>

                    <p v-if="error" class="error">{{error}}</p>
                </div>
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
    import vSelect from 'vue-select'

    export default {
        data() {
            return {
                error: '',
                teamCode: '',
                teamName: '',
                team: {},
                loading: true,
                createTeamState: false,
                joinTeamState: false,
            }
        },
        beforeMount() {
            console.log(this.settings);
            ApiService.getTeam((err, team) => {
                this.loading = false

                if (err) {
                    this.error = err ? err : 'Something went wrong :\'('
                } else if (!team) {
                    this.team = null
                } else {
                    this.team = team
                }
            });
        },
        methods: {
            switchCreateTeam() {
                this.teamName = ''
                this.createTeamState = true
                this.joinTeamState = false
            },
            switchJoinTeam() {
                this.teamCode = ''
                this.joinTeamState = true
                this.createTeamState = false
            },
            createTeam() {
                ApiService.createTeam(this.teamName, (err, team) => {

                    if (err) {
                        this.error = err.responseJSON.error
                    } else {
                        this.team = team
                        this.createTeamState = false
                    }
                })
            },
            joinTeam() {
                ApiService.joinTeam(this.teamCode, (err, team) => {

                    if (err) {
                        this.error = err.responseJSON.error
                    } else {
                        this.team = team
                        this.joinTeamState = false
                    }

                })
            },
            leaveTeam() {

                swal({
                    title: 'Please Confirm',
                    text: 'Are you sure you want to leave this team? (' + this.team.name + ')',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading()
                        ApiService.leaveTeam((err, team) => {
                            if (err) {
                                this.error = err.responseJSON.error
                            }

                            this.team = null
                            this.teamName = null
                            this.teamCode = null
                        })
                    }
                })
            }
        }
    }
</script>
