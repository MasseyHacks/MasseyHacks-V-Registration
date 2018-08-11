<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>OWNER</h2>
                </div>
            </div>
             <div class="row">
                <div class="ui-card" id="dash-card">
                    <h3>YOUR STATUS:</h3>
                    <h4>{{$parent.user.status.name.toUpperCase()}}</h4>
                    <hr>
                    <p><span class="emphasis">Welcome {{$parent.user.fullName}},</span><br>
                        This is the MasseyHacks V Dashboard
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    /*
    import Session from '../src/Session'

    export default {
        data() {

        }
    }*/
</script>