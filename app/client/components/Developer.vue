<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>DEVELOPER</h2>
                </div>
            </div>
            <div class="row" style="padding-bottom: 30px">
                <div class="ui-card dash-card">
                    <h3>Version</h3>
                    <hr>

                    <p v-if="currentLocalVersion == -1 && currentRemoteVersion == ''">
                        <strong>Unable to fetch version status</strong>
                    </p>
                    <p v-else-if="currentLocalVersion == -1">
                        <strong>Unable to fetch local version</strong>
                    </p>
                    <p v-else-if="currentRemoteVersion == ''">
                        <strong>Unable to fetch remote version</strong>
                    </p>
                    <p v-else-if="currentRemoteVersion != currentLocalVersion">
                        <strong>There is an update available</strong>
                    </p>
                    <p v-else>
                        <strong>GOOSE is update to date</strong>
                    </p>
                    <p>
                        <span v-if="currentLocalVersion != -1">
                            Local Version: {{currentLocalVersion}}
                        </span><br>
                        <span v-if="currentRemoteVersion != ''">
                            Remote Version: {{currentRemoteVersion}}
                        </span>
                    </p>


                </div>
                <div class="ui-card dash-card">
                    <h3>SERVER LOG</h3>
                    <hr>
                    <div v-if="loading">
                        Loading...
                    </div>
                    <div v-else-if="err">
                        {{loadingError}}
                    </div>
                    <div v-else>

                        <input style="width: 100%" v-on:input="updateSearch" v-model="searchQuery" type="text">

                        <hr>

                        <div v-if="log.length != 0 && !queryError">
<!--                             <button class="generic-button" v-for="p in totalPages" :key="p" v-on:click="switchPage(p)">page {{p}}</button> -->
                            <button class="generic-button" :disabled="page == 1" v-on:click="switchPage(page - 1)">Previous</button>
                            <button class="generic-button" :disabled="page == totalPages" v-on:click="switchPage(page + 1)">Next</button>

                            <br>
                            <br>
                            {{page}} of {{totalPages}} | {{count}} results

                            <hr>

                            <div id="log">
                                <div v-for="event in log" style="margin:0.5em;">
                                    <button v-on:click="showDiv(event.timestamp)" class="collapsible" style="word-wrap: break-word">
                                        {{moment(event.timestampHuman)}}<br>
                                        <b>{{event.message}}</b><br>
                                        <span v-if="event.from.name && event.to.name">
                                            {{event.from.name}} -> {{event.to.name}}
                                        </span>
                                    </button>

                                    <div :id="event.timestamp" class="content" hidden>
                                        <p style="margin-top:1rem; text-align:left;">
                                            <b>FROM</b><br>
                                            Name: {{event.from.name}}<br>
                                            Email: {{event.from.email}}<br>
                                            ID: {{event.from.ID}}<br>
                                            <br>
                                            <b>TO</b><br>
                                            Name: {{event.to.name}}<br>
                                            Email: {{event.to.email}}<br>
                                            ID: {{event.to.ID}}<br>
                                            <br>
                                            <b>ACTION</b><br>
                                            {{event.message}}<br>
                                            <span v-if="event.detailedMessage">
                                                <br>
                                                <b>DETAILS</b><br>
                                                {{event.detailedMessage}}<br>
                                            </span>
                                            <br>
                                            <b>TIMESTAMP</b><br>
                                            {{moment(event.timestampHuman)}}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-else>
                            {{queryError}}
                        </p>
                    </div>
                </div>
                <div class="ui-card dash-card">
                    <h3>QR CODES</h3>
                    <hr>
                    <select style="margin-bottom: 10px;" v-model="selected">
                        <option disabled value="">Select an Admin</option>
                        <option v-for="option in dropdown.length">{{dropdown[option-1]}}</option>
                    </select>
                    <hr>
                    <img v-bind:src="Admins[selected]" v-if="selected">
                </div>

                <div class="ui-card dash-card">
                    <h3>SUDO MODE</h3>
                    <hr>
                    Developers are busy people, okay?<br>
                    <button class="generic-button-dark" @click="sudoMode">Enter sudo mode</button>
                </div>


            </div>
        </div>
    </div>
</template>

<script>
    import AuthService from '../src/AuthService.js'
    import ApiService from '../src/ApiService.js'
    import swal from 'sweetalert2'
    import moment from 'moment'
    import $ from 'jquery';

    export default {
        data() {
            return {
                page: 1,
                totalPages: 1,
                count: 0,

                filters: {},

                loading: true,
                loadingError: '',
                queryError: '',

                log: {},

                selected:'',
                Admins:{},
                dropdown: {},

                searchQuery:'',
                currentLocalVersion: '',
                currentRemoteVersion: ''
            }
        },
        beforeMount() {
            this.updateSearch();

            AuthService.sendRequest("GET", "/api/getAdmins", null, (err, data) => {
                console.log(data);
                if (err) {
                    console.log("Error while getting template")
                } else {
                    this.Admins = data;
                    this.dropdown = Object.keys(data)
                }
            });

            AuthService.sendRequest("GET", "/api/version", null, (err, data) => {
                if(err) {
                    console.log("Error while getting template");
                    this.currentLocalVersion = "-1"
                }
                else{
                    this.currentLocalVersion = data.commit;
                }
            });

            $.ajax({
                url: "https://api.github.com/repos/MasseyHacks/MasseyHacks-V-Registration/commits/master",
                success: (data) => {
                    console.log("asgsfagf",data);
                    this.currentRemoteVersion = data.sha;
                },
                dataType: "json"
            });
        },
        methods: {
            sudoMode: function() {
                swal({
                    title: 'Enter SUDO MODE?',
                    html: 'You won\'t be prompted to solve a puzzle when you perform a dangerous action. As a developer, we trust that you won\'t blaze through all the warnings.<br><br>By proceeding, you understand and assume full responsibility of all risks and/or damage (potentially) incurred.<br><br>SUDO MODE will be disabled at the end of this session.',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm',
                    footer: 'MasseyHacks | Platform Division',
                }).then((result) => {
                    if (result.value) {
                        swal({
                            title: 'SUDO MODE enabled!',
                            type: 'success'
                        });

                        sessionStorage.setItem('sudoMode', 'true');
                    } else {
                        swal({
                            title: 'Action aborted',
                            type: 'error'
                        })
                    }
                })
            },
            switchPage: function (page) {
                this.page = page;
                this.updateSearch(true)
            },
            showDiv(id){
                var children = document.getElementById(id).parentElement.parentElement.children;
                console.log("parent");
                console.log(document.getElementById(id).parentElement.parentElement);
                for (var i = 0; i < children.length; i++) {
                    console.log(children[i]);
                    if(children[i].lastChild.id != id){
                        children[i].lastChild.hidden = true;
                        if($(children[i].firstChild).hasClass('active')){
                            $(children[i].firstChild).removeClass('active');
                        }

                    }
                }
                document.getElementById(id).hidden = !document.getElementById(id).hidden;
                if($(document.getElementById(id).parentElement.firstChild).hasClass('active')){
                    $(document.getElementById(id).parentElement.firstChild).removeClass('active')
                }else{
                    $(document.getElementById(id).parentElement.firstChild).addClass('active')
                }
            },
            moment (date) {
                return moment(date).format('MMMM Do YYYY [at] h:mm:ss a')
            },

            updateSearch: function(resetPage) {
                if (!resetPage) {
                    this.page = 1
                }

                // Update content of advanced query box
                this.advancedQueryContent = JSON.stringify(this.filters);

                ApiService.getLog({ page: this.page, size: 30, text: this.searchQuery }, (err, data) => {
                    this.loading = false;
                    this.queryError = '';

                    if (err || !data) {
                        this.loadingError = err ? err.responseJSON.error : 'Unable to process request'
                    } else {
                        this.log = data.log;
                        this.totalPages = data.totalPages;
                        this.count = data.count;

                        if (this.log.length == 0) {
                            this.queryError = 'No events found'
                        }
                    }
                })
            }
        }
    }
</script>

<style>
    .collapsible {
        background-color: #777;
        color: white;
        cursor: pointer;
        padding: 18px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 15px;
    }

    .active, .collapsible:hover {
        background-color: #555;
    }

    .content {
        transition: all .5s;
        padding: 0 18px;
        overflow: auto;
        text-wrap: normal;
        background-color: #f1f1f1;
    }
</style>
