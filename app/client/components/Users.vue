<template>
    <div>
        <div class="row">
            <div class="ui-card dash-card-large" id="users-table">
                <h3>USERS:</h3>
                <hr>
                <table>
                    <tr id="table-header"><td>NAME</td><td>V/S/A/C/W</td><td>EMAIL</td><td>SCHOOL</td></tr>
                    <tr v-for="user in users">
                        <td>{{user.fullName}}</td>
                        <td><span v-html="userStatusConverter(user)"></span></td>
                        <td>{{user.email}}</td>
                        <td>N/A</td>
                    </tr>
                </table>
<!--             <ul>
                <li v-for="user in users">
                    {{user.fullName}} {{user}}
                </li>
            </ul> -->
            </div>
        </div>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import $ from 'jquery';

    export default {
        data() {
            return {
                loading: true,
                fail: false,
                users: {}
            }
        },
        beforeMount() {
            ApiService.getUsers({ page: 1, size: 100 }, (err, users) => {
                this.loading = false

                if (err || !users) {
                    this.fail = true
                } else {
                    this.users = users
                }
            })
        },
        methods: {
            userStatusConverter: function(user) {
                var repsonseArray = {
                    'V' : '',
                    'S' : '',
                    'A' : '',
                    'C' : '',
                    'W' : ''
                }

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

                var finalReponse = ''

                for (var str in repsonseArray) {
                    finalReponse += repsonseArray[str]
                }
                return finalReponse
            }        
        }

    }
</script>