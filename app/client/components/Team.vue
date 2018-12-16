<template>
    <div class="app-screen">
        <div class="title-card col-md-12" style="position: absolute; top: 10% !important;">
            <h2>TEAM</h2>
        </div>

        <div class="spacer"></div>
        <div class="container vertical-centered">
            <div class="ui-card dash-card">
                <div v-if="loading">
                    <p>Loading...</p>
                </div>
                <div v-else-if="page == 'create'">
                    Create Team

                    <input class="round-input" style="width: 100%" placeholder="Super Hax0r Team" v-model="teamName" type="text" maxlength="50">

                    <br>
                    <div class="button-row">
                        <button class="generic-button-dark" v-on:click="reset(); page = ''">Back</button>
                        <button :disabled="!teamName" class="generic-button-dark" v-on:click="createTeam">Create
                        </button>
                    </div>
                </div>
                <div v-else-if="page == 'join'">
                    Join Team

                    <input class="round-input" style="width: 100%" placeholder="Team Code" v-model="teamCode" type="text">

                    <br>
                    <div class="button-row">
                        <button class="generic-button-dark" v-on:click="reset(); page = ''">Back</button>
                        <button :disabled="!teamCode" class="generic-button-dark" v-on:click="joinTeam">Join</button>
                    </div>
                </div>
                <div v-else-if="!team">
                    <p>You are currently not in a team.</p>

                    <div class="button-row">
                        <button class="generic-button-dark" v-on:click="reset(); page = 'create'">Create</button>
                        <button class="generic-button-dark" v-on:click="reset(); page = 'join'">Join</button>
                    </div>
                </div>
                <div v-else-if="team">
                    <h4>Team Name</h4>
                    {{team.name}}<br>
                    <h4>Team Code</h4>
                    {{team.code}} <br>
                    <br>

                    <hr>

                    <h4>Members</h4>
                    <span v-for="id in team.memberNames">
                        {{id}}<br>
                    </span>

                    <div class="button-row">
                        <button class="generic-button-dark" v-on:click="leaveTeam">leave</button>
                    </div>
                </div>

                <p v-if="error" class="error">{{error}}</p>
            </div>
        </div>
    </div>

</template>

<script>
    import swal from 'sweetalert2'
    import ApiService from '../src/ApiService'

    export default {
        data() {
            return {
                error: '',
                teamCode: '',
                teamName: '',
                team: {},
                loading: true,
                page: ''
            }
        },
        beforeMount() {
            console.log(this.settings);
            ApiService.getTeam((err, team) => {
                this.loading = false;

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
            reset() {
                this.teamCode = '';
                this.teamName = '';
                this.error = ''
            },
            createTeam() {
                ApiService.createTeam(this.teamName, (err, team) => {

                    if (err) {
                        this.error = err.responseJSON.error
                    } else {
                        this.team = team;
                        this.page = '';
                        this.error = ''
                    }
                })
            },
            joinTeam() {
                ApiService.joinTeam(this.teamCode, (err, team) => {

                    if (err) {
                        this.error = err.responseJSON.error
                    } else {
                        this.team = team;
                        this.page = '';
                        this.error = ''
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
                        swal.showLoading();
                        ApiService.leaveTeam((err, team) => {
                            if (err) {
                                this.error = err.responseJSON.error
                            }

                            this.team = null;
                            this.teamName = '';
                            this.teamCode = '';
                            this.error = ''
                        })
                    }
                })
            }
        }
    }
</script>
