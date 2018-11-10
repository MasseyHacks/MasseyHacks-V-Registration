<template>
    <div class="app-screen">
        <div class="row">
            <div class="title-card col-md-12">
                <h2>CONFIRMATION</h2>
            </div>
        </div>

        <div class="row">
            <div class="ui-card dash-card">

              <div v-if="user.status.name == 'confirmed' || user.status.name == 'declined'">
                  {{user.status.name}}
              </div>
              <div v-else>
                  <button class="generic-button" v-on:click="acceptInvitation">Confirm</button>
                  <button class="generic-button" v-on:click="denyInvitation">Deny</button>
              </div>

        </div>
    </div>
  </div>
</template>

<script>

    import Session from '../src/Session'
    import AuthService from '../src/AuthService'
    import swal from 'sweetalert2'

    export default {
        data(){
          return {
            user: Session.getUser()
          }
        },
        methods:{
          acceptInvitation(){
              swal({
                title: "Hey!",
                text: "Are you sure you want to accept your invitation?",
                type: "question",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes!'
              }).then((result) =>{
                if(result.value){
                  AuthService.sendRequest('POST','/api/acceptInvitation',{
                    userID: this.user._id
                  },(err,data) =>{
                    if(err || !data){
                      swal("Error",err.error,"error");
                    }
                    else{
                      swal({
                        title:"Success",
                        text: "You have confirmed your spot!",
                        type: "success"
                      })
                      this.user = Session.getUser()
                    }

                })
              }

            })
          },
          denyInvitation(){
              swal({
                title: "Hey!",
                text: "Are you sure you want to decline your invitation?",
                type: "question",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes!'
              }).then((result) =>{
                if(result.value){
                  AuthService.sendRequest('POST','/api/declineInvitation',{
                    userID: this.user._id
                  },(err,data) =>{
                    if(err || !data){
                      swal("Error",err.error,"error");
                    }
                    else{
                      swal({
                        title:"Success",
                        text: "You have declined your invitation.",
                        type: "success"
                      })
                      this.user = Session.getUser()
                    }

                })
              }

            })
          }
        }
    }
</script>
