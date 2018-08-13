<template>
    <div>
        <div class="row">
            <div class="ui-card dash-card-large" id="users-table">
                <!--<h3>USERS:</h3>-->
                <div v-if="loading">
                    Loading...
                </div>
                <div v-else-if="err">
                    {{err}}
                </div>
                <div v-else>
                    <input style="width: 100%" v-on:input="updateSearch" v-model="searchQuery" type="text">

                    <select style="margin: 10px;" v-model="queryLogical">
                        <option value="$and">and</option>
                        <option value="$or">or</option>
                        <option value="$not">not</option>
                        <option value="$nor">nor</option>
                    </select>


                    <!-- Field Name -->
                    <select style="margin: 10px;" v-model="queryFieldName">
                        <option value="" v-bind:value="[]">Select a field</option>
                        <option v-for="field in fields" v-bind:value="field">{{field.name}}</option>
                    </select>

                    <select style="margin: 10px;" v-model="queryComparison" :disabled="queryFieldName.length">
                        <option value="$eq">equal</option>
                        <option value="$ne">not equal</option>
                        <option value="$regex">contains (regex)</option>
                        <option value="$gt">greater than</option>
                        <option value="$gte">greater than or equal</option>
                        <option value="$lt">less than</option>
                        <option value="$lte">less than or equal</option>
                    </select>

                    <input v-model="queryTargetValue" type="text">

                    <button class="generic-button-light" v-on:click="addQuery">Add</button>

                    <br>
                    <div v-for="(comparison, logical) in filters" style="text-align: left">
                        {{logical}}

                        <div v-for="c in comparison">
                            {{c}}
                        </div>
                    </div>

                    <div v-if="users.length != 0">
                        <hr>
                        <button class="generic-button-light" v-on:click="exportUsersCSV">Export</button>
                        <button class="generic-button-light" v-for="p in totalPages" :key="p" v-on:click="switchPage(p)">page {{p}}</button>
                        <hr>
                        <table>
                            <tr id="table-header"><td>NAME</td><td>V/S/A/C/W</td><td>VOTES</td><td>EMAIL</td><td>SCHOOL</td><td>GRADE</td></tr>
                            <tr v-for="user in users">
                                <td>{{user.fullName}}</td>
                                <td><span v-html="userStatusConverter(user)"></span></td>
                                <td>{{user.numVotes}}</td>
                                <td>{{user.email}}</td>
                                <td>N/A</td>
                                <td>N/A</td>
                            </tr>
                        </table>
                    </div>
                    <p v-else>
                        No results match this query
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import $ from 'jquery';
    import { saveAs } from 'file-saver/FileSaver';

    export default {
        data() {
            return {
                page: 1,
                totalPages: 1,

                filters: {"$and":[{}], "$or":[{}]},
                searchQuery: '',

                fields: {},
                queryFieldName: [],
                queryLogical: '$and', // and, or, not, nor
                queryComparison: 'equals', // equals, contains, greater, less, greater or equal, lesser or equal, not include, not in array
                queryTargetValue: '', // 5 apples

                loading: true,
                err: '',

                users: {}
            }
        },
        beforeMount() {
            ApiService.getFields((err, data) => {
                if (err || !data) {
                    this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                } else {
                    this.fields = data
                }
            })

            ApiService.getUsers({ page: this.page, size: 100 }, (err, data) => {
                this.loading = false

                if (err || !data) {
                    this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                } else {
                    this.users = data.users
                    this.totalPages = data.totalPages
                }
            })
        },
        methods : {
            addQuery: function() {


                var query = {}
                var subQuery = {}
                subQuery[this.queryComparison] = this.queryTargetValue
                query[this.queryFieldName.name] = subQuery

                console.log(query)

                if (this.queryLogical in this.filters) {
                    this.filters[this.queryLogical].push(query)
                } else {
                    this.filters[this.queryLogical] = [query]
                }

                this.updateSearch()
            },
            updateSearch: function() {
                this.page = 1

                ApiService.getUsers({ page: this.page, size: 100, text: this.searchQuery, filters : this.filters }, (err, data) => {
                    if (err || !data) {
                        this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                    } else {
                        this.users = data.users;
                        this.totalPages = data.totalPages
                    }
                })
            },
            exportUsersCSV: function () {
                ApiService.getUsers({ page: 1, size: 100000, text: this.searchQuery }, (err, data) => {
                    if (err || !data) {
                        this.err = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                    } else {
                        var csvArray = [];
                        for(var i = 0; i < data.users.length; i++){
                            csvArray[i] = this.flattenObject(data.users[i]);
                        }
                        this.genCSV(csvArray);
                    }
                })
            },
            flattenObject: function (data,prefix="",level=0){
                var tempObj = {};
                if(level < 6){
                    Object.keys(data).forEach((key) => {
                        if(data[key] === Object(data[key])){
                            //iterate again!
                            tempObj = Object.assign(tempObj,this.flattenObject(data[key],prefix+key+"/",level+=1));
                        }
                        else{
                            //log the value
                            tempObj[prefix+key] = data[key];
                        }
                    });
                    if(prefix === "") {
                        tempObj["documentKeys"] = Object.keys(tempObj);
                    }
                    return tempObj;
                }
                else{
                    console.log("recursion limit reached!");
                    return {};
                }
            },
            genCSV: function (objArray) {
                var output = [];
                var headers = [];

                //get all the headers
                for(var i=0;i<objArray.length;i++){
                    headers = this.mergeArray(headers,objArray[i]["documentKeys"]);
                }

                output[0] = headers.toString();

                //generate the output
                for(var i=0;i<objArray.length;i++){
                    output[i+1] = "";
                    for(var j=0;j<headers.length;j++){
                        if(objArray[i][headers[j]] !== undefined){
                            output[i+1] += objArray[i][headers[j]]+",";
                        }
                        else{
                            output[i+1] += ",";
                        }
                    }
                    output[i+1] = output[i+1].slice(0,-1);
                }

                var outputStr = "";
                for(var i=0;i<output.length;i++){
                    outputStr += output[i]+"\n";
                }

                var filename = "Users-export-" + new Date() + ".csv";
                var blob = new Blob([outputStr], {
                    type: "text/csv;charset=utf-8"
                });

                saveAs(blob,filename);

            },
            mergeArray: function (){
                /** Courtesy of George Ruth on Stack Overflow **/
                var args = arguments;
                var hash = {};
                var arr = [];
                for (var i = 0; i < args.length; i++) {
                    for (var j = 0; j < args[i].length; j++) {
                        if (hash[args[i][j]] !== true) {
                            arr[arr.length] = args[i][j];
                            hash[args[i][j]] = true;
                        }
                    }
                }
                return arr;
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
            },

            switchPage: function(page) {
                this.page = page
            }
        }
    }
</script>