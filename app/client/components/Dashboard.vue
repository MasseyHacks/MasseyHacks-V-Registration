<template>
    <div>
        <h2>Dashboard</h2>
        <p>{{data}}</p>
    </div>
</template>

<script>
    import Session from '../src/Session'
    export default {
        data() {
            return {
                data: JSON.stringify(Session.getUser())
            }
        }
    }
</script>