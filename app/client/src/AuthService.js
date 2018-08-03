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
                this.updateLoginState(true)
                Session.create(data['token'], data['user']);
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
                this.updateLoginState(true)
                Session.create(data['token'], data['user']);
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
                this.updateLoginState(true)
                Session.create(data['token'], data['user']);
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