<template>
    <div>
        <h2>Users</h2>
        <p>O wow i like users!</p>

        <div v-if="loading">
            <p>Loading...</p>
        </div>
        <div v-else-if="fail">
            <p>Failed</p>
        </div>
        <div v-else>
            <ul>
                <li v-for="user in users">
                    {{user.fullName}} {{user}}
                </li>
            </ul>

        </div>
    </div>
</template>

<script>
    import Session from '../src/Session'
    import ApiService from '../src/ApiService'
    import $ from 'jquery';

    export default {
        data() {
            return {
                loading: true,
                fail: false,
                users: {}
            }
        },
        beforeMount() {
            ApiService.getUsers({ page: 1, size: 100 }, (err, users) => {
                this.loading = false

                if (err || !users) {
                    this.fail = true
                } else {
                    this.users = users
                }
            })
        }
    }
</script>