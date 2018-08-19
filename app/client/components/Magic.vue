<template>
    
</template>

<script>
    import Session from '../src/Session'
    import swal    from 'sweetalert2'
    import AuthService  from '../src/AuthService'

    export default {
        name: 'Magic',
        created () {
            swal.showLoading()
            console.log(this.$route.query.token)
            AuthService.sendRequest('POST', '/auth/magicurl', {token: this.$route.query.token}, (err, data) => {
                if (err || !data) {
                    swal('Error', 'An error has occurred', 'error')
                    console.log(err.responseJSON['error'])
                    this.$router.replace('/login')
                } else {
                    swal('Success', '', 'success')
                    console.log(data)

                    Session.create(data.token, data.user)
                    AuthService.updateLoginState(true)
                    this.$router.replace('/')
                }
            })
        },
    }
</script>

<style scoped>

</style>