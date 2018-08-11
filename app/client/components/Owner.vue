<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>OWNER</h2>
                </div>
            </div>
        </div>
        <p>Current status: {{$parent.user.status.name.toUpperCase()}}<br>Logged in as: {{$parent.user.fullName}}</p>
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