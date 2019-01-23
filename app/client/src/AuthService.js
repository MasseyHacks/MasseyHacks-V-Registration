/* globals localStorage */

import $ from 'jquery'
import Session from './Session'
import swal from 'sweetalert2'

module.exports = {

    sendRequest (type, url, data, callback, contentType, async) {
        var request = {
            type: type,
            url: url,
            async: async,
            contentType: contentType || 'application/json; charset=utf-8',
            dataType: 'json',
            success: data => {
                if (callback) callback(null, data)
            },
            error: data => {
                if (data && (data.status == 401 || data.status == 403) && Session.loggedIn() && !url.includes('changePassword')) {
                    this.logout(null, 'Permission error occurred. Please login again.')
                }

                if (!'error' in data) {
                    data['error'] = 'Something went wrong'
                }

                if (callback) callback(data)
            }
        };

        if (data) {
            request['data'] = type == 'POST' ? JSON.stringify(data) : data
        }

        if (Session.loggedIn() || Session.getToken()) {
            request['beforeSend'] = xhr => {xhr.setRequestHeader('x-access-token', Session.getToken())}
        }

        $.ajax(request)
    },
    
    skillTest(callback) {
        swal.showLoading();

        var sudoMode = sessionStorage.getItem('sudoMode') ? sessionStorage.getItem('sudoMode') : false;

        this.sendRequest('GET', '/api/skill', {}, (err, data) => {

            if (err || sudoMode) {
                swal({
                    title: (sudoMode ? '[SUDO MODE]\n' : '') + 'Disastrous Action Final Confirmation',
                    html: 'Security policy requires that all \'disastrous\' actions be confirmed with a skill test. By proceeding, you understand and assume full responsibility of all risks and/or damage (potentially) incurred.<br><br>To promote mathematics and STEM, MasseyHacks Platform Department will issue a SkillTest Fail Bad no good point if you bypass using SUDO mode. K thx bye.<br><br>',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm',
                    dangerMode: true,
                    footer: 'MasseyHacks | Platform Division',
                }).then((result) => {
                    if (result.value) {
                        this.sendRequest('POST', '/api/skillFail', {}, (err, data) => {});

                        callback()
                    } else {
                        swal({
                            title: 'Action aborted',
                            type: 'error'
                        })
                    }
                });

                swal.showValidationError(
                    sudoMode ? 'SUDO MODE ENABLED' : `Unable to get skill question`
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

                            this.sendRequest('POST', '/api/skillFail', {}, (err, data) => {});

                            swal.showValidationError(
                                `Wrong answer!`
                            )

                        } else {
                            this.sendRequest('POST', '/api/skillPass', {}, (err, data) => {});

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

    adminChangePassword(fullName, userID, callback) {
        swal({
            title: 'Change user password',
            html: 'Enter a new password for ' + fullName,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Change',
            input: 'password',
            footer: 'MasseyHacks | Platform Division',
            preConfirm: (pw) => {

                if (pw.length < 6) {
                    swal.showValidationError(
                        `Must be at least 6 characters long!`
                    )
                } else {
                    return pw
                }
            }
        }).then((result) => {

            if (result.value) {

                this.skillTest(() => {

                    this.sendRequest('POST', '/auth/adminChangePassword', {
                        userID: userID,
                        password: result.value
                    }, (err, data) => {
                        if (err) {
                            if (callback) callback(err.responseJSON.error)
                        } else {
                            if (callback) callback(null, data)
                        }
                    })

                })

            }
        });
    },

    changePassword(oldPassword, newPassword, callback) {
        this.sendRequest('POST', '/auth/changePassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true);

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
                Session.create(data['token'], data['user']);
                this.updateLoginState(true);

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
                console.log(data);
                if (data['user']['2FA']) {
                    Session.create2FA(data['token'], data['user']);
                    return callback(null, data['user'])
                } else {
                    Session.create(data['token'], data['user']);
                    this.updateLoginState(true);

                    if (callback) callback(null, data)
                }
            }
        })
    },

    refreshToken() {
        // Login with token if it exists
        if (Session.loggedIn()) {
            console.log('Token refreshed!');
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
                Session.create(data['token'], data['user']);
                this.updateLoginState(true)
            }
        }, null, false)
    },

    loginWithCode (code, callback) {
        this.sendRequest('POST', '/auth/2FA', {
            'code':code
        }, (err, data) => {
            if (err) {
                if (callback) callback(err.responseJSON.error)
            } else {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true);

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
                this.logout(null, 'The session has expired');
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
        Session.destroy(callback);
        this.updateLoginState(false, message)
    },

    updateLoginState(state) {}
};