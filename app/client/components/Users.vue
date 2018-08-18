<template>
    <div>
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

                    <div v-if="advancedQuery">
                        <textarea v-model="advancedQueryContent" v-on:input="updateAdvancedFilter" placeholder="Enter query here"></textarea>
                    </div>
                    <div v-else>
                        <select style="margin: 10px;" v-model="queryLogical">
                            <option value="$and">and</option>
                            <option value="$or">or</option>
                            <option value="$not">not</option>
                            <option value="$nor">nor</option>
                        </select>

                        <!-- Field Name -->
                        <select style="margin: 10px;" v-model="queryField" v-on:change="changeFieldName">
                            <option v-bind:value="{}">Select a field</option>
                            <option v-for="field in fields" v-bind:value="field">{{prettify(field.name)}}</option>
                        </select>

                        <select style="margin: 10px;" v-model="queryComparison" :disabled="!queryField.name">
                            <option value="$eq" :disabled="queryField.type=='Boolean'">equal</option>
                            <option value="$ne" :disabled="queryField.type=='Boolean'">not equal</option>
                            <option value="$regex" :disabled="queryField.type!='String'">contains (regex)</option>
                            <option value="$gt" :disabled="queryField.type=='Boolean'">greater than</option>
                            <option value="$gte" :disabled="queryField.type=='Boolean'">greater than or equal</option>
                            <option value="$lt" :disabled="queryField.type=='Boolean'">less than</option>
                            <option value="$lte" :disabled="queryField.type=='Boolean'">less than or equal</option>

                            <option value="true" :disabled="queryField.type!='Boolean'">True</option>
                            <option value="false" :disabled="queryField.type!='Boolean'">False</option>
                        </select>

                        <input v-model="queryTargetValue" type="text" :disabled="(queryField && queryField.type=='Boolean') || !queryField.name">

                        <input v-model="displayOrganizers" type="checkbox" id="displayOrganizers" v-on:change="toggleNormalOnly">

                        <label for="displayOrganizers">Display organizers: {{displayOrganizers}}</label>

                    </div>

                    <br>
                    <button class="generic-button-light" v-on:click="addQuery" :disabled="!queryField.name">Add</button>
                    <button class="generic-button-light" v-on:click="clearQuery">Clear</button>
                    <button class="generic-button-light" v-on:click="advancedQuery = !advancedQuery">{{advancedQuery ? "Simple" : "Advanced"}} Query</button>

                    <br>

                    <table>
                        <div v-for="(comparison, logical) in filters">
                            <tr>
                                <div v-for="filter in comparison">
                                    <span v-if="Object.keys(filter)[0] != 'permissions.checkin'">
                                        <td>{{prettify(logical.slice(1).toUpperCase())}}</td>
                                        <td>{{prettify(Object.keys(filter)[0])}}: {{filter[Object.keys(filter)[0]]}}</td>
                                        <td><button class="generic-button-light" v-on:click="deleteFilter(logical, filter)">Delete</button></td>
                                    </span>
                                </div>
                            </tr>
                        </div>
                    </table>

                    <div v-if="users.length != 0 && !queryError">
                        <hr>
                        <button class="generic-button-light" v-on:click="exportUsersCSV">Export</button>
                        <button class="generic-button-light" :disabled="page == 1" v-on:click="switchPage(page - 1)">Previous</button>
                        <button class="generic-button-light" :disabled="page == totalPages" v-on:click="switchPage(page + 1)">Next</button>
                        <hr>
                        <table id="users-table">
                            <tr id="table-header"><td>NAME</td><td>V/S/A/C/W</td><td>VOTES</td><td>EMAIL</td><td>SCHOOL</td><td>GRADE</td></tr>
                            <router-link v-for="user in users" :to="{path: '/organizer/userview?username='+user.id, params: {username: user.fullName}}" tag="tr">
                                <td>
                                    {{user.fullName}}
                                </td>
                                <td><span v-html="userStatusConverter(user)"></span></td>
                                <td>{{user.numVotes}}</td>
                                <td class="email-col">{{user.email}}</td>
                                <td>N/A</td>
                                <td>N/A</td>
                            </router-link>
                        </table>
                    </div>
                    <p v-else>
                        {{queryError}}
                    </p>
   
                </div>
            </div>
        </div>
        <vue-context ref="menu" style="position: absolute;">
            <ul>
                <li @click="onClick($event.target.innerText, child.data)">Option 1</li>
                <li @click="onClick($event.target.innerText, child.data)">Option 2</li>
            </ul>
        </vue-context>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import $ from 'jquery';
    import { saveAs } from 'file-saver/FileSaver'
    import swal from 'sweetalert2'
    import { VueContext } from 'vue-context'

    export default {
        data() {
            return {
                page: 1,
                totalPages: 1,
                displayOrganizers: false,
                advancedQueryContent: '{}',
                filters: {
                    '$and':[
                        {
                            'permissions.checkin': 'true'
                        }
                    ]
                },
                searchQuery: '',

                fields: {},
                queryField: {},
                queryLogical: '$and', // and, or, not, nor
                queryComparison: '$eq', // equals, contains, greater, less, greater or equal, lesser or equal, not include, not in array
                queryTargetValue: '', // 5 apples
                advancedQuery: false,

                loading: true,
                loadingError: '',
                queryError: '',

                users: {}
            }
        },

        beforeMount() {
            // Get fields for filters
            ApiService.getFields((err, data) => {
                if (err || !data) {
                    this.loadingError = err ? JSON.parse(err.responseText).error : 'Unable to process request'
                } else {
                    this.fields = data
                }
            })

            ApiService.getUsers({ page: this.page, size: 100, filters: this.filters }, (err, data) => {
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

            onClick: function(text, data) {
                swal('Hello')
            },

            deleteFilter: function(logical, filter) {
                this.filters[logical].splice(this.filters[logical].indexOf(filter), 1)
                this.updateSearch()
            },

            // Changes comparison operator to valid state
            changeFieldName: function() {
                switch (this.queryField.type) {
                    case "Boolean": // Only true/false are valid in this case
                        if (['true', 'false'].indexOf(this.queryComparison) == -1) {
                            this.queryComparison =  'true'
                            this.queryTargetValue = ''
                        }

                        break
                    case "Number": // Regex cannot be used with numbers
                        if (this.queryComparison == '$regex') {
                            this.queryComparison =  '$eq'
                        }

                        break
                    default: // Strings
                        if (['true', 'false'].indexOf(this.queryComparison) != -1) {
                            this.queryComparison =  '$eq'
                        }
                }
            },

            resetQuery: function() {
                this.queryLogical = '$and'
                this.queryComparison =  this.queryField.type == 'Boolean' ? 'true' : '$eq'
                this.queryTargetValue = ''
            },

            addQuery: function() {

                var query = {}
                var subQuery = {}

                // Make it case insensitive
                if (this.queryComparison == '$regex') {
                    subQuery['$options'] = 'i'
                }

                // Generate inner query <'$eq':'foo'>
                subQuery[this.queryComparison] = this.queryTargetValue

                // Generate outer query <'firstName':subQuery>
                query[this.queryField.name] = this.queryField.type == 'Boolean' ? this.queryComparison : subQuery

                if (this.queryLogical in this.filters) {
                    if (!this.filters[this.queryLogical].map(x => JSON.stringify(x)).includes(JSON.stringify(query))) { // Figure out why this doesn't work
                        this.filters[this.queryLogical].push(query)
                    } else {
                        swal('This filter already exists!')
                    }
                } else {
                    this.filters[this.queryLogical] = [query]
                }

                this.updateSearch()
                this.resetQuery()
                this.queryField = {}
            },

            clearQuery: function() {
                this.filters = {}
                this.updateSearch()
            },

            updateAdvancedFilter: function() {
                try {
                    this.filters = JSON.parse(this.advancedQueryContent)
                    this.updateSearch()
                }  catch (e) {
                    this.queryError = 'Invalid Query'
                }
            },

            updateSearch: function(resetPage) {
                if (!resetPage) {
                    this.page = 1
                }

                // Update content of advanced query box
                this.advancedQueryContent = JSON.stringify(this.filters)

                ApiService.getUsers({ page: this.page, size: 100, text: this.searchQuery, filters : this.filters }, (err, data) => {
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

            exportUsersCSV: function () {
                ApiService.getUsers({ page: 1, size: 100000, text: this.searchQuery }, (err, data) => {
                    if (err || !data) {
                        this.loadingError = err ? JSON.parse(err.responseText).error : 'Unable to process request'
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
                this.updateSearch()
            },

            toggleNormalOnly: function() {
                if (this.filters.length > 0) {
                    if (this.filters['$and'].length > 0) {
                        this.filters['$and'][0]['permissions.checkin'] = this.displayOrganizers.toString()
                    }
                }
                console.log(this.filters)
                this.updateSearch()
            }
        }
    }
</script>


<style>
    .ql-editor {
        height: 50vh !important;
        width: 50vw !important;
        overflow-y: auto !important;
        overflow-x: auto !important;
    }

    .ql-syntax {
        display: inline-block !important;
    }

    .ql-syntax span {
        display: inline-block !important;
        white-space: nowrap;
    }

</style>
