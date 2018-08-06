/* globals localStorage */

const $       = require('jquery');
const Session = require('./Session');

/*
*
beforeSend: xhr => {
    xhr.setRequestHeader('x-access-token', Session.getToken())
}
* */

module.exports = {

    isAuthorized(permissionName) {
        if (Session.getSettings()) {
            const permission = Session.getSettings().permissions

            if (permissionName in permission) {
                return permission[permissionName].permissionLevel <= Session.getUser().permissions.level
            }
        }

        return false
    },

    register(email, firstName, lastName, password, callback) {
        $.ajax({
            type: 'POST',
            url: '/auth/register',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            }),
            success: data => {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true)
                if (callback) callback(null, data)
            },
            error: data => {
                if (callback) callback(JSON.parse(data.responseText)['error'])
            }
        });
    },

    loginWithPassword (email, password, callback) {
        $.ajax({
            type: 'POST',
            url: '/auth/login',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            success: data => {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true)
                if (callback) callback(null, data)
            },
            error: data => {
                if (callback) callback(JSON.parse(data.responseText)['error'])
            }
        });
    },

    loginWithToken (token, callback) {
        $.ajax({
            type: 'POST',
            url: '/auth/login',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                token: token
            }),
            success: data => {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true)
                if (callback) callback(null, data)
            },
            error: data => {
                Session.destroy()
                this.updateLoginState(false)
                if (callback) callback(JSON.parse(data.responseText)['error'])
            }
        });
    },

    verify(token, callback) {
        $.ajax({
            type: 'POST',
            url: '/auth/verify',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                token: token
            }),
            success: data => {
                if (callback) callback(null)
            },
            error: data => {
                if (callback) callback(JSON.parse(data.responseText)['error'])
            }
        });
    },

    resetPasswordWithToken(token, password, callback) {
        $.ajax({
            type: 'POST',
            url: '/auth/reset',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                token: token,
                password: password
            }),
            success: data => {
                if (callback) callback(null, data)
            },
            error: data => {
                if (callback) callback(JSON.parse(data.responseText)['error'])
            }
        });
    },

    requestReset (email, callback) {
        $.ajax({
            type: 'POST',
            url: '/auth/requestReset',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                email: email
            }),
            success: data => {
                if (callback) callback(null, data)
            },
            error: data => {
                if (callback) callback(JSON.parse(data.responseText)['error'])
            }
        });
    },

    logout (callback) {
        this.updateLoginState(false)
        Session.destroy(callback)
    },

    updateLoginState(state) {}
}