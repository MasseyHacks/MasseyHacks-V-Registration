import Raven        from 'raven-js'
//import AuthService  from './AuthService'
import RavenVue     from 'raven-js/plugins/vue'
import $ from 'jquery'

module.exports = {

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
        console.log(token)
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