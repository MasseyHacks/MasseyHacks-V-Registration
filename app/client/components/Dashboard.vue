<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>DASHBOARD</h2>
                    <h3>STATUS: {{$parent.user.status.name.toUpperCase()}}</h3>
                </div>
            </div>
            <div class="row">
                <b-card>
                    <h3 class="card-title">Status</h3>
                    <p class="card-text">Logged in as: {{$parent.user.fullName}}</p>
                </b-card>
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