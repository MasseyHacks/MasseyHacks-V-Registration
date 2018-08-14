import Raven        from 'raven-js'
import RavenVue     from 'raven-js/plugins/vue'
import $ from "jquery"

module.exports = {

    sendRequest (type, url, data, callback) {
        var request =   {
                            type: type,
                            url: url,
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            success: data => {
                                if (callback) callback(null, data)
                            },
                            error: data => {
                                if (callback) callback(data)
                            }
                        }

        if (data) {
            request['data'] = type == 'POST' ? JSON.stringify(data) : data
        }

        if (this.loggedIn() || this.getToken()) {
            request['beforeSend'] = xhr => {xhr.setRequestHeader('x-access-token', this.getToken())}
        }

        $.ajax(request)
    },

    setSettings(settings) {
        sessionStorage.settings = JSON.stringify(settings)
    },

    getSettings() {
        return sessionStorage.settings ? JSON.parse(sessionStorage.settings) : {}
    },

    create(token, user) {

        var date = new Date()
        var expiration = date.setMonth(date.getMonth() + 1)

        localStorage.token = token
        localStorage.userID = user._id
        localStorage.user = JSON.stringify(user)

        Raven.setUserContext({
            email: user.email,
            id: user._id,
            name: user.fullName
        })
    },

    create2FA(token, data) {
        localStorage.token = token
        localStorage.qr = data.qr
        console.log(token)
    },

    getQR() {
      return localStorage.qr
    },

    destroy(callback) {
        delete localStorage.token
        delete localStorage.userID
        delete localStorage.user

        Raven.setUserContext()

        if (callback) {
            callback()
        }
    },

    getTokenData() {
        const token = this.getToken()

        if (token) {
            return JSON.parse(atob(token.split('.')[1]))
        }

        return {}
    },

    getToken() {
        return localStorage.token
    },

    getUserID() {
        return localStorage.userID
    },

    getUser() {
        return this.loggedIn() ? JSON.parse(localStorage.user) : null
    },

    setUser(user) {
        localStorage.user = JSON.stringify(user)
    },

    loggedIn() {
        return !!localStorage.token && !!localStorage.user
    }
}