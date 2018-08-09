<template>
    <div class="app-screen">
        <div class="title-card">
            <h2>Dashboard</h2>
        </div>
        <div class="grid-layout-main">
            <p>hello</p>
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