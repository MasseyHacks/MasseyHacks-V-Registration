<template>
    <div>
        <h2>Dashboard</h2>
        <p>Current status: {{user.status.name.toUpperCase()}}<br>Logged in as: {{user.fullName}}</p>
    </div>
</template>

<script>
    import Session from '../src/Session'

    export default {
        data() {
            return {
                data: JSON.stringify(Session.getUser()),
                user: Session.getUser()
            }
        }
    }
</script>