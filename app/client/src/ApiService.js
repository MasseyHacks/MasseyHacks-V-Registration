/* globals localStorage */

import $       from 'jquery'
import Session from './Session'

module.exports = {

    getApplications(callback) {
        Session.sendRequest('GET', '/api/applications', {}, callback)
    },

    getFields(callback) {
        Session.sendRequest('GET', '/api/fields', {}, callback)
    },

    getStatistics(callback) {
        Session.sendRequest('GET', '/api/stats', {}, callback)
    },

    refreshStatistics(callback) {
        Session.sendRequest('POST', '/api/refreshStatistics', {}, callback)
    },

    getUsers(query, callback) {
        Session.sendRequest('GET', '/api/users', query, callback)
    },

    getUser(id, callback) {
        Session.sendRequest('GET', '/api/user/' + id, {}, callback)
    },

    getLog(query, callback) {
        Session.sendRequest('GET', '/api/systemLog', query, callback)
    }
}