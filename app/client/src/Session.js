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

    computed: {
        tokenData() {
            const token = this.getToken();

            if (token) {
                return JSON.parse(atob(token.split('.')[1]))
            }

            return {}
        },
        token() {
            return localStorage.token;
        },
        userID() {
            return localStorage.userID;
        },
        user() {
            return localStorage.user;
        }
    },

    setUser(user) {
        localStorage.user = user;
    },

    loggedIn() {
        return !!localStorage.token;
    }
};