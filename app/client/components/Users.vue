<template>
    <div>
        <h2>Users</h2>
        <p>O wow i like users!</p>

        <div v-if="loading">
            <p>Loading...</p>
        </div>
        <div v-else-if="fail">
            <p>Failed</p>
        </div>
        <div v-else>
            <ul>
                <li v-for="user in users">
                    {{user.fullName}} {{user}}
                </li>
            </ul>

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
        methods :{
            exportUsersCSV: function (){
                ApiService.getUsers({ page: 1, size: 100 }, (err, users) => {
                    for(var s of users){
                        for(var [key,value] of s){
                            if(a.constructor === Object){
                                //iterate through the obj
                            }
                            else{
                                //add to csv obj
                            }
                        }
                    }
                })
            },
            genCSV: function(jsonData) {
                    var json = jsonData;
                    var fields = Object.keys(json[0]);
                    var replacer = function(key, value) { return value === null ? '' : value };
                    var csv = json.map(function(row){
                        return fields.map(function(fieldName){
                            return JSON.stringify(row[fieldName], replacer)
                        }).join(',')
                    });
                    csv.unshift(fields.join(',')); // add header column

                    return(csv.join('\r\n'));
            }

        }
    }
</script>