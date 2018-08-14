/* globals localStorage */

import $       from 'jquery';
import Session from './Session';

module.exports = {

    changePassword(oldPassword, newPassword, callback) {
        Session.sendRequest('POST', '/auth/changePassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                Session.create(data['token'], data['user']);
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
                Session.create(data['token'], data['user']);
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    loginWithPassword (email, password, recaptchaToken, callback) {
        Session.sendRequest('POST', '/auth/login', {
            email: email,
            password: password,
            recaptchaToken: recaptchaToken
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                console.log(data)
                if (data["user"]["2FA"]) {
                    Session.create2FA(data['token'], data["user"])
                    return callback(null, data["user"])
                } else {
                    Session.create(data['token'], data['user']);
                    this.updateLoginState(true)

                    if (callback) callback(null, data)
                }
            }
        })
    },

    loginWithToken (callback) {
        Session.sendRequest('POST', '/auth/login', {

        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true)

                if (callback) callback(null, data)
            }
        })
    },

    loginWithCode (code, callback) {
        Session.sendRequest('POST', '/auth/2FA', {
            "code":code
        }, (err, data) => {
            if (err) {
                if (callback) callback(JSON.parse(err.responseText)['error'])
            } else {
                Session.create(data['token'], data['user']);
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