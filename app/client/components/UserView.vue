<template>
    <div>
        <div class="ui-card dash-card-large">
            <h3 v-if="userObj.fullName">{{userObj.fullName.toUpperCase()}}</h3>
            <div id="detailed-info" style="column-count: 2; column-width: 300px;">
                <ul style="list-style: none">
                    <li v-for="(value, key) in flatten(userObj,false)" style="overflow-wrap: break-word; text-align: left;">
                        <span v-if="key != 'Application'">
                            <b>{{key}}:</b> {{value}}
                        </span>
                    </li>
                </ul>
            </div>
            <hr>
            <span v-if="user.permissions.owner">
                <h4>APPLICATION</h4>
                <ul style="overflow-wrap: break-word; text-align: left; list-style: none">
                    <li v-for="(value, key) in userApp">
                        <b>{{key}}:</b> {{value}}<br>
                    </li>
                </ul>
            </span>
<!--             <p>User Object: </p>
            {{userObj}} -->


            <!-- TODO -->

            <!-- VIEW TEAM -->

            <!-- FLUSH EMAIL QUEUE -->
            <!-- TOGGLE ACCOUNT ACTIVATION -->
            <!-- TOGGLE WAIVER -->
            <!-- TOGGLE CHECKIN -->
            <!-- DELETE USER -->

            <router-link :to="{path: returnPath}"><button class="generic-button-light">Back</button></router-link>
            <button class="generic-button-light" @click="requestSuperToken" v-if="user.permissions.developer">PEI TOKEN</button>
            <button class="generic-button-light" v-on:click="editUser">Edit User</button>
            <button class="generic-button-light" v-on:click="forceAdmit">Force Admit</button>
            <button class="generic-button-light" v-on:click="forceReject">Force Reject</button>
            <button class="generic-button-light" v-on:click="voteAdmit">Vote Admit</button>
            <button class="generic-button-light" v-on:click="voteReject">Vote Reject</button>
            <button class="generic-button-light" v-on:click="resetAdmissionState">Reset Admission State</button>
            <button class="generic-button-light" v-on:click="resetInvitation">Reset Invitation</button>
            <button class="generic-button-light" v-on:click="resetVotes">Reset Votes</button>
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
                user: Session.getUser(),
                error : '',
                userID : '',
                userObj : {},
                userApp : {},
                returnPath: "/organizer/users",
            }
        },

        beforeMount() {
            if (this.$route.query["returnPath"]) {
                this.returnPath = this.$route.query["returnPath"]
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
            resetVotes: function() {
                ApiService.forceAdmit(this.userObj.fullName, this.userID, () => {
                    swal('Success!', 'Successfully reset votes', 'success');
                });
            },
            resetInvitation: function() {
                ApiService.forceAdmit(this.userObj.fullName, this.userID, () => {
                    swal('Success!', 'Successfully reset invitation status', 'success');
                });
            },
            resetAdmissionState: function() {
                ApiService.forceAdmit(this.userObj.fullName, this.userID, () => {
                    swal('Success!', 'Successfully reset admission state', 'success');
                });
            },
            forceAdmit: function() {
                ApiService.forceAdmit(this.userObj.fullName, this.userID, () => {
                    swal('Success!', 'Successfully force admitted user', 'success');
                });
            },
            forceReject: function() {
                ApiService.forceReject(this.userObj.fullName, this.userID, () => {
                    swal('Success!', 'Successfully force rejected user', 'success');
                });
            },
            voteAdmit: function() {
                ApiService.voteAdmit(this.userObj.fullName, this.userID, () => {
                    swal('Success!', 'Successfully voted to admit user', 'success');
                });
            },
            voteReject: function() {
                ApiService.voteReject(this.userObj.fullName, this.userID, () => {
                    swal('Success!', 'Successfully voted to reject user', 'success');
                });
            },
            flatten: function(obj,includeApplication = true) {
                var flattened = {}
                for (var keys in obj) {
                    if (typeof obj[keys] != "object") {
                        if (!(keys == "QRCode" || keys == "authSecret" || keys == "_id")) {
                            flattened[this.prettify(keys)] = obj[keys]
                        }
                    } else {
                        if (keys != "profile") {
                            for (var depthKey in obj[keys]) {
                                flattened[this.prettify(depthKey)] = obj[keys][depthKey]
                            }
                        } else{
                            var profileObj = this.flatten(obj[keys])
                            if(includeApplication){
                                flattened["Application"] = profileObj
                            }
                            this.userApp = profileObj
                        }
                    }
                }
                return flattened
            },
            requestSuperToken: function() {
                AuthService.skillTest(() => {
                    AuthService.sendRequest('POST', '/auth/requestSuperToken', {
                        id: this.userID
                    }, (err, data) => {
                        if (err) {
                            swal("Error", "This action has been logged", "error")
                        } else {
                            swal({
                                title: "PEI TOKEN ISSUED!",
                                html: "<a href=\"" + data.url + "\">"+ data.url + "</a>",
                                type: "success"
                            })
                        }
                    })
                })
            },
            editUser: function(){
                var flatWithHistory = this.flattenWithHistory(this.userObj)
                var keys = flatWithHistory.documentKeys;
                //remove values that cannot/should not be edited
                keys.splice(keys.indexOf('__v'),1);
                keys.splice(keys.indexOf('_id'),1);
                keys.splice(keys.indexOf('lowerCaseName'),1);
                keys.splice(keys.indexOf('fullName'),1);
                keys.splice(keys.indexOf('permissions.level'),1);
                keys.splice(keys.indexOf('status.name'),1);
                keys.splice(keys.indexOf('profile.isSigned'),1);
                keys.splice(keys.indexOf('lowerCaseName'),1);
                console.log(keys);

                swal({
                  title: 'Warning',
                  type: 'warning',
                  text: 'Updating a user should be done through the appropriate function. This editor will not check for any errors or update any dependent fields. Continue?',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Yes!'
                }).then(async (result) =>{
                  if(result.value){
                    const {value: field} = await swal({
                      title: 'Select a field',
                      input: 'select',
                      inputOptions: keys,
                      inputPlaceholder: 'Select a field',
                      showCancelButton: true,
                      inputValidator: (value) => {
                        return new Promise((resolve) => {
                          resolve();
                        })
                      }
                    })

                    if (field) {
                      const {value: newValue} = await swal({
                        title: 'Enter a value for '+keys[field],
                        input: 'text',
                        inputValue: flatWithHistory[keys[field]],
                        showCancelButton: true,
                        inputValidator: (value) => {
                          return !value && 'You need to write something!'
                        }
                      })

                      if (newValue) {
                        swal({
                          title: 'Are you sure?',
                          type: 'warning',
                          html: `You are directly modifying ${this.userObj.fullName}!<br>`+
                                '<br>Changes will be pushed <span style="color:red; font-weight:bold;">IMMEDIATELY</span>'+
                                '<br>There is <span style="color:red; font-weight:bold;">NO</span> value validation'+
                                `<br><br>Field: ${keys[field]}`+
                                `<br><span style="font-weight:bold;">Old</span> value: ${flatWithHistory[keys[field]]}`+
                                `<br><span style="font-weight:bold;">New</span> value: ${newValue}`,
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes!'
                        }).then((result) => {
                            if (result.value) {
                                AuthService.skillTest(() => {
                                    swal.showLoading()

                                    var postData = {};
                                    postData[keys[field]] = newValue;

                                    AuthService.sendRequest('POST', '/api/modifyUser', {
                                        userID: this.userObj._id,
                                        data: postData
                                    }, (err,data) => {
                                        if (err) {
                                            swal('Error', err.error, 'error')
                                        } else {
                                            swal('Success', 'Field has been changed', 'success').then((result) => {
                                              ApiService.getUser(this.userID, (err, data) => {
                                                  if (err || !data) {
                                                      console.log("ERROR")
                                                  } else {
                                                      console.log("data2")
                                                      this.userObj = data
                                                  }
                                              })
                                            });

                                        }
                                    })
                                })
                            }
                        })
                      }
                    }
                  }
                })
            },
            flattenWithHistory: function (data,prefix="",level=0){
                var tempObj = {};
                if(level < 7){
                    Object.keys(data).forEach((key) => {
                        if(data[key] === Object(data[key])){
                            //iterate again!
                            tempObj = Object.assign(tempObj,this.flattenWithHistory(data[key],prefix+key+".",level+=1));
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

            prettify: function(str) {
                return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
            }
        }

    }
</script>
