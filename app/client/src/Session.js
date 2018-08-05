import Raven        from 'raven-js';
import RavenVue     from 'raven-js/plugins/vue';

module.exports = {
    setSettings(settings) {
        sessionStorage.settings = JSON.stringify(settings)
    },

    getSettings() {
        return JSON.parse(sessionStorage.settings)
    },

    create(token, user) {
        localStorage.token = token;
        localStorage.userID = user._id;
        localStorage.user = JSON.stringify(user);
        document.cookie = token;

        Raven.setUserContext({
            email: user.email,
            id: user._id,
            name: user.fullName
        })
    },

    destroy(callback) {
        delete localStorage.token;
        delete localStorage.userID;
        delete localStorage.user;
        delete document.cookie;

        Raven.setUserContext()

        if (callback) {
            callback();
        }
    },

    getTokenData() {
        const token = this.getToken();

        if (token) {
            return JSON.parse(atob(token.split('.')[1]))
        }

        return {}
    },

    getToken() {
        return localStorage.token;
    },

    getUserID() {
        return localStorage.userID;
    },

    getUser() {
        return this.loggedIn() ? JSON.parse(localStorage.user) : null;
    },

    setUser(user) {
        localStorage.user = JSON.stringify(user);
    },

    loggedIn() {
        return !!localStorage.token;
    }
};