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
                            <hr>
                            <button class="generic-button-light" v-for="p in totalPages" :key="p" v-on:click="switchPage(p)">page {{p}}</button>
                            <hr>
                            <table>
                                <tr id="table-header">
                                    <td>EVENT?</td>
                                </tr>
                                <tr v-for="event in log">
                                    <td>{{event}}</td>
                                </tr>
                            </table>
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
                        <option disabled value="">Select a Admin</option>
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

            Session.sendRequest("GET", "api/getAdmins", null, (err, data) => {
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
            updateSearch: function() {
                ApiService.getLog({ page: this.page, size: 100 }, (err, data) => {
                    this.loading = false

                    if (err || !data) {
                        this.loadingError = err ? JSON.parse(err.responseText).error : 'Unable to process request'
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
</style>