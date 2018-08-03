module.exports = {
    create(token, user) {
        localStorage.token = token;
        localStorage.userID = user._id;
        localStorage.user = JSON.stringify(user);
        document.cookie = token;
    },

    destroy(callback) {
        delete localStorage.token;
        delete localStorage.userID;
        delete localStorage.user;
        delete document.cookie;

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