<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>DEVELOPER</h2>
                </div>
            </div>
            <div class="row">
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
                        <div v-if="log.length != 0 && !queryError">
<!--                             <button class="generic-button" v-for="p in totalPages" :key="p" v-on:click="switchPage(p)">page {{p}}</button> -->
                            <button class="generic-button" :disabled="page == 1" v-on:click="switchPage(page - 1)">Previous</button>
                            <button class="generic-button" :disabled="page == totalPages" v-on:click="switchPage(page + 1)">Next</button>
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
                                                <b>DETAILED EVENT</b><br>
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
            </div>
        </div>
    </div>
</template>

<script>
    import Session     from '../src/Session'
    import AuthService from '../src/AuthService.js'
    import ApiService from '../src/ApiService.js'
    import swal        from 'sweetalert2'
    import moment  from 'moment'
    import $ from 'jquery';

    export default {
        data() {
            return {
                page: 1,
                totalPages: 1,

                filters: {},

                loading: true,
                loadingError: '',
                queryError: '',

                log: {},

                selected:"",
                Admins:{},
                dropdown: {},
            }
        },
        beforeMount() {
            this.updateSearch()

            AuthService.sendRequest("GET", "api/getAdmins", null, (err, data) => {
                console.log(data)
                if (err) {
                    console.log("Error while getting template")
                } else {
                    this.Admins = data
                    this.dropdown = Object.keys(data)
                }
            })
        },
        methods: {
            switchPage: function (page) {
                this.page = page
                this.updateSearch()
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
            updateSearch: function() {
                ApiService.getLog({ page: this.page, size: 30 }, (err, data) => {
                    this.loading = false

                    if (err || !data) {
                        this.loadingError = err ? err.responseJSON.error : 'Unable to process request'
                    } else {
                        this.log = data.log
                        this.totalPages = data.totalPages
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