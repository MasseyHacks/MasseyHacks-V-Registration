/* globals localStorage */

import $       from 'jquery'
import Session from './Session'
import swal    from 'sweetalert2'

module.exports = {

    skillTest(callback) {
        swal.showLoading()

        Session.sendRequest('GET', '/api/skill', {

        }, (err, data) => {

            // Try to parse answer first
            // If it fails, just give up
            if (data) {
                try {
                    var correctAnswer = parseInt(data.choices[data.correct_choice].replace(new RegExp(/[^0-9\-.]/, 'g'), ''))
                } catch (e) {
                    err = true
                }
            }

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

                        if (answer != correctAnswer) {
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
        Session.sendRequest('POST', '/auth/changePassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                Session.create(data['token'], data['user'])
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    register(email, firstName, lastName, password, callback) {
        Session.sendRequest('POST', '/auth/register', {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                Session.create(data['token'], data['user'])
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    loginWithPassword (email, password, callback) {
        Session.sendRequest('POST', '/auth/login', {
            email: email,
            password: password
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
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

    loginWithToken () {
        Session.sendRequest('POST', '/auth/tokenLogin', {

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
        Session.sendRequest('POST', '/auth/2FA', {
            'code':code
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                Session.create(data['token'], data['user'])
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    verify(token, callback) {
        Session.sendRequest('POST', '/auth/verify', {
            token: token
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                if (callback) callback(null)
            }
        })
    },

    resetPasswordWithToken(token, password, callback) {
        Session.sendRequest('POST', '/auth/reset', {
            token: token,
            password: password
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                this.logout()
                if (callback) callback(null, data)
            }
        })
    },

    requestReset (email, callback) {
        Session.sendRequest('POST', '/auth/requestReset', {
            email: email
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                if (callback) callback(null, data)
            }
        })
    },

    requestVerify(callback) {
        Session.sendRequest('POST', '/auth/requestVerify', {

        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                if (callback) callback(null, data)
            }
        })
    },

    logout (callback) {
        Session.destroy(callback)
        this.updateLoginState(false)
    },

    updateLoginState(state) {}
}