<template>
    <div>
        <div class="row">
            <div class="ui-card dash-card-large" id="users-table">
                <!--<h3>USERS:</h3>-->
                <input v-on:input="updateSearch" v-model="searchQuery" placeholder="Master Hax0r">
                <hr>
                <table>
                    <tr id="table-header"><td>NAME</td><td>V/S/A/C/W</td><td>VOTES</td><td>EMAIL</td><td>SCHOOL</td></tr>
                    <tr v-for="user in users">
                        <td>{{user.fullName}}</td>
                        <td><span v-html="userStatusConverter(user)"></span></td>
                        <td>{{user.numVotes}}</td>
                        <td>{{user.email}}</td>
                        <td>N/A</td>
                    </tr>
                </table>
            </div>
        </div>
        <button v-on:click="genCSV">Generate CSV</button>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import $ from 'jquery';

    export default {
        data() {
            return {
                page: 1,
                filters: [],
                searchQuery: '',
                loading: true,
                fail: false,
                users: {}
            }
        },
        beforeMount() {
            ApiService.getUsers({ page: this.page, size: 100 }, (err, users) => {
                this.loading = false

                if (err || !users) {
                    this.fail = true
                } else {
                    this.users = users
                }
            })
        },
        methods : {
            updateSearch: function() {
                ApiService.getUsers({ page: this.page, size: 100, text: this.searchQuery }, (err, users) => {
                    if (err || !users) {
                        this.fail = true
                    } else {
                        this.users = users
                    }
                })
            },
            exportUsersCSV: function () {
                ApiService.getUsers({page: 1, size: 100}, (err, users) => {
                    for (var s of users) {
                        for (var [key, value] of s) {
                            if (a.constructor === Object) {
                                //iterate through the obj
                            }
                            else {
                                //add to csv obj
                            }
                        }
                    }
                })
            },
            genCSV: function (jsonData) {
                var json = jsonData;
                var fields = Object.keys(json[0]);
                var replacer = function (key, value) {
                    return value === null ? '' : value
                };
                var csv = json.map(function (row) {
                    return fields.map(function (fieldName) {
                        return JSON.stringify(row[fieldName], replacer)
                    }).join(',')
                });
                csv.unshift(fields.join(',')); // add header column

                return (csv.join('\r\n'));
            },
            userStatusConverter: function (user) {
                var repsonseArray = {
                    'V': '',
                    'S': '',
                    'A': '',
                    'C': '',
                    'W': ''
                };

                if (user.permissions.verified) {
                    repsonseArray['V'] = '<i class="fas fa-check"></i>'
                } else {
                    repsonseArray['V'] = '<i class="fas fa-ban"></i>'
                }
                if (user.status.submittedApplication) {
                    repsonseArray['S'] = '<i class="fas fa-check"></i>'
                } else {
                    repsonseArray['S'] = '<i class="fas fa-ban"></i>'
                }
                if (user.status.admitted) {
                    repsonseArray['A'] = '<i class="fas fa-check"></i>'
                } else {
                    repsonseArray['A'] = '<i class="fas fa-ban"></i>'
                }
                if (user.status.confirmed) {
                    repsonseArray['C'] = '<i class="fas fa-check"></i>'
                } else {
                    repsonseArray['C'] = '<i class="fas fa-ban"></i>'
                }
                if (user.status.waiver) {
                    repsonseArray['W'] = '<i class="fas fa-check"></i>'
                } else {
                    repsonseArray['W'] = '<i class="fas fa-ban"></i>'
                }

                var finalReponse = '';

                for (var str in repsonseArray) {
                    finalReponse += repsonseArray[str]
                }
                return finalReponse
            }
        }
    }
</script>