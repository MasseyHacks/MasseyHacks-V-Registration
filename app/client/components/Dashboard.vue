<template>
    <div>
        <h2>Dashboard</h2>
        <p>Current status: {{status}}</p>
    </div>
</template>

<script>
    import Session from '../src/Session'

    export default {
        data() {
            return {
                data: JSON.stringify(Session.getUser()),
                status: Session.getUser().status.name.toUpperCase()
            }
        }
    }
</script>