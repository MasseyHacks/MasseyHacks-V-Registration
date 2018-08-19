<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>Check In</h2>
                </div>
            </div>

            <div class="row">
                <div class="ui-card dash-card-large" id="users-table">
                    <!--<h3>USERS:</h3>-->
                    <div v-if="loading">
                        Loading...
                    </div>
                    <div v-else-if="err">
                        {{loadingError}}
                    </div>
                    <div v-else>
                        <input style="width: 100%" v-on:input="updateSearch" v-model="searchQuery" type="text">

                        <div v-if="users.length != 0 && !queryError">
                            <table id="users-table">
                                <tr id="table-header"><td>NAME</td><td>Waiver</td><td>Checked in</td><td>EMAIL</td><td>SCHOOL</td><td>GRADE</td><td></td></tr>
                                <tr v-for="user in users">
                                    <td>
                                        {{user.name}}
                                    </td>
                                    <td><span v-html="userWaiverConverter(user)"></span></td>
                                    <td><span v-html="userCheckinConverter(user)"></span></td>
                                    <td class="email-col">{{user.email}}</td>
                                    <td>N/A</td>
                                    <td>N/A</td>
                                    <td><button class="generic-button-light" @click="checkin(user)" v-if="!user.checked">CHECK-IN</button><button class="generic-button-light" @click="checkout(user)" v-else>CHECK-OUT</button></td>
                                </tr>
                            </table>
                        </div>
                        <p v-else>
                            {{queryError}}
                        </p>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import $ from 'jquery';
    import swal from 'sweetalert2'
    import { VueContext } from 'vue-context'

    export default {
        data() {
            return {
                filters: {
                    '$and':[
                        {
                            'permissions.checkin': 'false',
                            'permissions.reviewer': 'false',
                            'permissions.admin': 'false',
                            'status.confirmed': 'true'
                        }
                    ]
                },
                searchQuery: '',

                loading: true,
                loadingError: '',
                queryError: '',

                users: {}
            }
        },

        beforeMount() {
            ApiService.getUsers({ page: 1, size: 0, filters: this.filters, appPage: "checkin"}, (err, data) => {
                this.loading = false

                if (err || !data) {
                    this.loadingError = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                } else {
                    this.users = data.users
                    this.totalPages = data.totalPages
                }
            })
        },

        components: {
            VueContext
        },

        methods : {

            prettify: function(str) {
                var strProc = str
                if (str.indexOf('.') != -1) {
                    strProc = str.slice(str.indexOf('.')+1)
                }
                return strProc.replace(/([A-Z])/g, ' $1').replace(/^./, function(strProc){ return strProc.toUpperCase(); })
            },
            checkin: function(user) {
                Session.sendRequest("POST", "/api/checkIn", {userID: user.id}, function (err, data) {
                    swal.showLoading()
                    if(err) {
                        console.log(err)
                        swal("Error", "An error has occured, please contact an organizer immediately", "error")
                    } else {
                        swal("Success", "Hacker " + data.name + " has been successfully checked in.")
                    }
                })
            },
            checkout: function(user) {
                Session.sendRequest("POST", "/api/checkOut", {userID: user.id}, function (err, data) {
                    swal.showLoading()
                    if(err) {
                        console.log(err)
                        swal("Error", "An error has occured, please contact an organizer immediately", "error")
                    } else {
                        swal("Success", "Hacker " + data.name + " has been successfully checked out.")
                    }
                })
            },
            onClick: function(text, data) {
                swal('Hello')
            },
            updateSearch: function(resetPage) {
                if (!resetPage) {
                    this.page = 1
                }

                // Update content of advanced query box
                this.advancedQueryContent = JSON.stringify(this.filters)

                ApiService.getUsers({ page: 1, size: 0, text: this.searchQuery, filters : this.filters, appPage: "checkin"}, (err, data) => {
                    this.queryError = ''
                    if (err || !data) {
                        this.queryError = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                    } else {
                        this.users = data.users
                        this.totalPages = data.totalPages
                        this.loading = false

                        if (this.users.length == 0) {
                            this.queryError = 'No results match this query'
                        }
                    }
                })
            },
            userWaiverConverter: function (user) {
                if (user.waiver) {
                    return '<i class="fas fa-check"></i>'
                } else {
                    return '<i class="fas fa-ban"></i>'
                }
            },
            userCheckinConverter: function (user) {
                if (user.checked) {
                    return '<i class="fas fa-check"></i>'
                } else {
                    return '<i class="fas fa-ban"></i>'
                }
            }
        }
    }
</script>