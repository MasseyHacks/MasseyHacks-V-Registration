<template>
    <div class="app-screen">
        <div class="title-card">
            <h2>DASHBOARD</h2>
            <h3>STATUS: {{$parent.user.status.name.toUpperCase()}}</h3>
        </div>
        <div class="grid-layout-main">
            <p>hello</p>
        </div>
        <p>Logged in as: {{$parent.user.fullName}}</p>
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