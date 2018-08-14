<template>
    <div>
        <div class="ui-card dash-card-large">
            <h3>{{userObj.fullName}}</h3>
            <div id="detailed-info" style="column-count: 3; column-width: 150px;">
                <ul>
                    <li v-for="(value, key) in flatten(userObj)" style="overflow-wrap: break-word; text-align: left;">
                        {{key}}: {{value}}
                    </li>
                </ul>
            </div>
            <router-link to="/organizer/users"><button class="generic-button-light">Back</button></router-link>
        </div>
    </div>
</template>

<script type="text/javascript">
    import Session     from '../src/Session'
    import AuthService from '../src/AuthService.js'
    import swal        from 'sweetalert2'
    import ApiService  from '../src/ApiService.js'

    export default {
        data() {
            return {
                error : '',
                userID : '',
                userObj : {}
            }
        },

        mounted() {
            this.userID = this.$route.query["username"]
            console.log(this.userID)
            ApiService.getUser(this.userID, (err, data) => {
                if (err || !data) {
                    console.log("ERROR")
                } else {
                    console.log("data2")
                    this.userObj = data
                }
            })
        },

        methods: {
            flatten: function(obj) {
                var flattened = {}
                for (var keys in obj) {
                    if (typeof obj[keys] != "object") {
                        if (!(keys == "QRCode" || keys == "authSecret" || keys == "_id")) {
                            flattened[this.prettify(keys)] = obj[keys]
                        }
                    } else {
                        for (var depthKey in obj[keys]) {
                            flattened[this.prettify(depthKey)] = obj[keys][depthKey]
                        }
                    }
                }
                return flattened
            },

            prettify: function(str) {
/*                var newWordIndex = []
                for (var i in str.length) {
                    char = str.charAt(i)
                    if (isNaN(char * 1)) {
                        if (char === char.toUpperCase()) {
                            newWordIndex.push(i)
                        }
                    }
                }

                var newString = ''
                for (var i in newWordIndex.length) {
                    if (i == 0) {
                        newString += str.splice(i, newWordIndex[i])
                    }
                }*/

                return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
            }
        }

    }
</script>