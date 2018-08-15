<template>
    <div>
        <div class="ui-card dash-card-large">
            <h3>{{userObj.fullName}}</h3>
            <div id="detailed-info" style="column-count: 3; column-width: 150px;">
                <ul>
                    <li v-for="(value, key) in flatten(userObj)" style="overflow-wrap: break-word; text-align: left;">
                        <span v-if="key != Application">
                            {{key}}: {{value}}
                        </span>
                    </li>
                </ul>
            </div>
            <hr>
            {{userApp}}
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
                userObj : {},
                userApp : {}
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
                            if (!(keys == "hacker")) {
                                flattened[this.prettify(keys)] = obj[keys]
                            } else {
                                var profileObj = this.flatten(obj[keys])
                                flattened["Application"] = profileObj
                                this.userApp = profileObj
                            }
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
                return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
            }
        }

    }
</script>