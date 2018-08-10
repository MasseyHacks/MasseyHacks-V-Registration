/* globals localStorage */

import $       from 'jquery';
import Session from './Session';

module.exports = {
    getStatistics(callback) {
        Session.sendRequest('GET', '/api/stats', {}, (err, data) => {
            return callback(err, data)
        })
    },

    getUsers(query, callback) {
        Session.sendRequest('GET', '/api/users', query, (err, data) => {
            return callback(err, data)
        })
    }
}