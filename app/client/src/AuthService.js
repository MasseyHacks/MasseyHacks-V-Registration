/* globals localStorage */

import $       from 'jquery';
import Session from './Session';

/*
*
beforeSend: xhr => {
    xhr.setRequestHeader('x-access-token', Session.getToken())
}
* */

module.exports = {

    changePassword(oldPassword, newPassword, callback) {
        $.ajax({
            type: 'POST',
            url: '/auth/changePassword',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                token: Session.getToken(),
                oldPassword: oldPassword,
                newPassword: newPassword
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
                this.logout()
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
                this.logout()
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
        Session.destroy(callback)
        this.updateLoginState(false)
    },

    updateLoginState(state) {}
}