<template>
    <div class='app-screen'>
        <div class='container'>
            <div class='row'>
                <div class='title-card col-md-12'>
                    <h2>CHECK IN</h2>
                </div>
            </div>

            <div class='row'>
                <div class='ui-card dash-card-large' id='users-table'>
                    <!--<h3>USERS:</h3>-->
                    <div v-if='loading'>
                        Loading...
                    </div>
                    <div v-else-if='err'>
                        {{loadingError}}
                    </div>
                    <div v-else>
                        <input class='round-input' style='width: 100%' placeholder='Search for hacker here' v-on:input='updateSearch' v-model='searchQuery' type='text'>
                        <hr>
                        <button class='generic-button-dark' @click='refresh()'>Refresh Table</button>
                        <hr>
                        <div v-if='users.length != 0 && !queryError'>
                            <table class='data-table-generic'>
                                <tr class='table-header'>
                                    <td>NAME</td>
                                    <td>WAIVER</td>
                                    <td>CHECKED IN</td>
                                    <td>EMAIL</td>
                                    <td>SCHOOL</td>
                                    <td>GRADE</td>
                                    <td></td>
                                </tr>
                                <tr v-for='i in users.length'>
                                    <td>
                                        {{users[i-1].name}}
                                    </td>
                                    <td><span v-html='userWaiverConverter(users[i-1])'></span></td>
                                    <td><span v-html='userCheckinConverter(users[i-1])'></span></td>
                                    <td class='email-col'>{{users[i-1].email}}</td>
                                    <td>{{users[i-1].school}}</td>
                                    <td>{{users[i-1].grade}}</td>
                                    <td>
                                        <button class='generic-button-dark' @click='inputwaiver(users[i-1], i-1)' v-if='!users[i-1].waiver'>
                                            WAIVER-IN
                                        </button>
                                        <button class='generic-button-dark' @click='checkin(users[i-1], i-1)' v-else-if='!users[i-1].checked'>
                                            CHECK-IN
                                        </button>
                                        <button class='generic-button-dark' @click='checkout(users[i-1], i-1)' v-else>
                                            CHECK-OUT
                                        </button>
                                    </td>
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
    import ApiService from '../src/ApiService'
    import AuthService from '../src/AuthService'
    import swal from 'sweetalert2'
    import {VueContext} from 'vue-context'
    import Vue from 'vue'

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

                users: []
            }
        },

        beforeMount() {
            ApiService.getUsers({ page: 1, size: 0, filters: this.filters, appPage: 'checkin'}, (err, data) => {
                this.loading = false;

                if (err || !data) {
                    this.loadingError = err ? err.responseJSON.error : 'Unable to process request'
                } else {
                    this.users = data.users;
                    this.totalPages = data.totalPages;

                    if (this.users.length == 0) {
                        this.queryError = 'No users found'
                    }
                }
            })
        },

        components: {
            VueContext
        },

        methods : {

            prettify: function(str) {
                var strProc = str;
                if (str.indexOf('.') != -1) {
                    strProc = str.slice(str.indexOf('.')+1)
                }
                return strProc.replace(/([A-Z])/g, ' $1').replace(/^./, function(strProc){ return strProc.toUpperCase(); })
            },
            refresh: function() {
                ApiService.getUsers({ page: 1, size: 0, filters: this.filters, appPage: 'checkin'}, (err, data) => {

                    if (err || !data) {
                        this.loadingError = err ? err.responseJSON.error : 'Unable to process request'
                    } else {
                        this.users = data.users;
                        this.totalPages = data.totalPages
                    }
                })
            },
            checkin: function(user, index) {
                swal({
                    title: 'Are you sure?',
                    text: 'This action(Check-in) will be recorded!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading();
                        AuthService.sendRequest('POST', '/api/checkIn', {userID: user.id, appPage: 'checkin'}, (err, data) => {
                            if(err) {
                                console.log(err);
                                swal('Error', 'An error has occured, please contact an organizer immediately', 'error')
                            } else {
                                swal('Success', 'Hacker ' + data.name + ' has been successfully checked in.', 'success');
                                Vue.set(this.users, index, data)
                            }
                        })
                    }
                })
            },
            checkout: function(user, index) {
                swal({
                    title: 'Are you sure?',
                    text: 'This action(Check-out) will be recorded!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading();
                        AuthService.sendRequest('POST', '/api/checkOut', {userID: user.id, appPage: 'checkin'}, (err, data) => {
                            if(err) {
                                console.log(err);
                                swal('Error', 'An error has occured, please contact an organizer immediately', 'error')
                            } else {
                                swal('Success', 'Hacker ' + data.name + ' has been successfully checked out.', 'success');
                                Vue.set(this.users, index, data)
                            }
                        })
                    }
                })
            },
            inputwaiver: function(user, index) {
                swal({
                    title: 'Are you sure?',
                    text: 'Please confirm waiver is filled and all fields are correct',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm'
                }).then((result) => {
                    if (result.value) {
                        swal.showLoading();
                        AuthService.sendRequest('POST', '/api/waiverIn', {'userID': user.id, appPage: 'checkin'}, (err, data) => {
                            if (err || !data) {
                                swal('Error', err.error, 'error')
                            } else {
                                swal('Success', 'Waiver accepted', 'success');
                                Vue.set(this.users, index, data)
                            }
                        })
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
                this.advancedQueryContent = JSON.stringify(this.filters);

                ApiService.getUsers({ page: 1, size: 0, text: this.searchQuery, filters : this.filters, appPage: 'checkin'}, (err, data) => {
                    this.queryError = '';
                    if (err || !data) {
                        this.queryError = err ? err.responseJSON.error : 'Unable to process request'
                    } else {
                        this.users = data.users;
                        this.totalPages = data.totalPages;
                        this.loading = false;

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
                    return '<i class="fas fa-times" style="color: red"></i>'
                }
            },
            userCheckinConverter: function (user) {
                if (user.checked) {
                    return '<i class="fas fa-check"></i>'
                } else {
                    return '<i class="fas fa-times" style="color: red"></i>'
                }
            }
        }
    }
</script>