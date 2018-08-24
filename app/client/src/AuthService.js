/* globals localStorage */

import $       from 'jquery'
import Session from './Session'
import swal    from 'sweetalert2'

module.exports = {

    sendRequest (type, url, data, callback) {
        var request = {
            type: type,
            url: url,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: data => {
                if (callback) callback(null, data)
            },
            error: data => {
                if (data && (data.status == 401 || data.status == 403) && Session.loggedIn()) {
                    this.logout(null, 'Permission error occurred. Please login again.')
                }

                if (!'error' in data) {
                    data['error'] = 'Something went wrong'
                }

                if (callback) callback(data)
            }
        }

        if (data) {
            request['data'] = type == 'POST' ? JSON.stringify(data) : data
        }

        if (Session.loggedIn() || Session.getToken()) {
            request['beforeSend'] = xhr => {xhr.setRequestHeader('x-access-token', Session.getToken())}
        }

        $.ajax(request)
    },
    
    skillTest(callback) {
        swal.showLoading()

        this.sendRequest('GET', '/api/skill', {

        }, (err, data) => {

            if (err) {
                swal({
                    title: 'Disastrous Action Final Confirmation',
                    text: 'MasseyHacks Security policy requires that all \'disastrous\' actions be confirmed with a skill test. By proceeding, you understand and assume full responsibility of all risks and/or damage (potentially) incurred.',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm',
                    footer: 'MasseyHacks | Platform Division',
                }).then((result) => {
                    if (result.value) {
                        callback()
                    } else {
                        swal({
                            title: 'Action aborted',
                            type: 'error'
                        })
                    }
                })

                swal.showValidationError(
                    `Unable to get skill question`
                )
            } else {
                swal({
                    title: 'Disastrous Action Final Confirmation',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm',
                    html: 'Security policy requires that all \'disastrous\' actions be confirmed with a skill test. By proceeding, you understand and assume full responsibility of all risks and/or damage (potentially) incurred.<br><br>' + data.instruction + '<br>' + data.question,
                    input: 'text',
                    footer: 'MasseyHacks | Platform Division',
                    preConfirm: (answer) => {

                        if (answer != data.answer) {
                            swal.showValidationError(
                                `Wrong answer!`
                            )
                        } else {
                            return 'ok'
                        }
                    }
                }).then((result) => {
                    if (result.value) {
                        callback()
                    } else {
                        swal({
                            title: 'Action aborted',
                            type: 'error'
                        })
                    }
                })
            }
        })
    },

    changePassword(oldPassword, newPassword, callback) {
        this.sendRequest('POST', '/auth/changePassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                Session.create(data['token'], data['user'])
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    register(email, firstName, lastName, password, callback) {
        this.sendRequest('POST', '/auth/register', {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                Session.create(data['token'], data['user'])
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    loginWithPassword (email, password, callback) {
        this.sendRequest('POST', '/auth/login', {
            email: email,
            password: password
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                console.log(data)
                if (data['user']['2FA']) {
                    Session.create2FA(data['token'], data['user'])
                    return callback(null, data['user'])
                } else {
                    Session.create(data['token'], data['user'])
                    this.updateLoginState(true)

                    if (callback) callback(null, data)
                }
            }
        })
    },

    refreshToken() {
        // Login with token if it exists
        if (Session.loggedIn()) {
            console.log('Token refreshed!')
            this.loginWithToken()
        } else {
            console.log('Session does not exist')
        }
    },

    loginWithToken () {
        this.sendRequest('POST', '/auth/tokenLogin', {

        }, (err, data) => {
            if (err) {
                this.logout()
            } else {
                Session.create(data['token'], data['user'])
                this.updateLoginState(true)
            }
        })
    },

    loginWithCode (code, callback) {
        this.sendRequest('POST', '/auth/2FA', {
            'code':code
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                Session.create(data['token'], data['user'])
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    verify(token, callback) {
        this.sendRequest('POST', '/auth/verify', {
            token: token
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                if (callback) callback(null)
            }
        })
    },

    resetPasswordWithToken(token, password, callback) {
        this.sendRequest('POST', '/auth/reset', {
            token: token,
            password: password
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                this.logout(null, 'The session has expired')
                if (callback) callback(null, data)
            }
        })
    },

    requestReset (email, callback) {
        this.sendRequest('POST', '/auth/requestReset', {
            email: email
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                if (callback) callback(null, data)
            }
        })
    },

    requestVerify(callback) {
        this.sendRequest('POST', '/auth/requestVerify', {

        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                if (callback) callback(null, data)
            }
        })
    },

    logout (callback, message) {
        Session.destroy(callback)
        this.updateLoginState(false, message)
    },

    updateLoginState(state) {}
}