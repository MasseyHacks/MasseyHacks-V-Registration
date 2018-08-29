/* globals localStorage */

import AuthService from './AuthService'

module.exports = {

    createTeam(teamName, callback) {
        AuthService.sendRequest('POST', '/api/createTeam', {
            teamName: teamName
        }, callback)
    },

    joinTeam(teamCode, callback) {
        AuthService.sendRequest('POST', '/api/joinTeam', {
            teamCode: teamCode
        }, callback)
    },

    leaveTeam(callback) {
        AuthService.sendRequest('POST', '/api/leaveTeam', {}, callback)
    },

    getTeam(callback) {
        AuthService.sendRequest('GET', '/api/getTeam', {}, callback)
    },

    getApplications(callback) {
        AuthService.sendRequest('GET', '/api/applications', {}, callback)
    },

    getFields(callback) {
        AuthService.sendRequest('GET', '/api/fields', {}, callback)
    },

    getStatistics(callback) {
        AuthService.sendRequest('GET', '/api/stats', {}, callback)
    },

    refreshStatistics(callback) {
        AuthService.sendRequest('POST', '/api/refreshStatistics', {}, callback)
    },

    getUsers(query, callback) {
        AuthService.sendRequest('GET', '/api/users', query, callback)
    },

    getUser(id, callback) {
        AuthService.sendRequest('GET', '/api/user/' + id, {}, callback)
    },

    getTeamFields(callback) {
        AuthService.sendRequest('GET', '/api/teams/fields', {}, callback)
    },

    getTeams(query, callback) {
        AuthService.sendRequest('GET', '/api/teams', query, callback)
    },

    getLog(query, callback) {
        AuthService.sendRequest('GET', '/api/systemLog', query, callback)
    },

    getPendingSchools(callback) {
        AuthService.sendRequest('GET', '/api/pendingSchools', {}, callback)
    },

    approveSchool(school, callback) {
        AuthService.sendRequest('POST', '/api/approveSchools', {
            school: school
        }, callback)
    },

    rejectSchool(school, callback) {
        AuthService.sendRequest('POST', '/api/rejectSchools', {
            school: school
        }, callback)
    }
}