/* globals localStorage */

import $       from 'jquery';
import Session from './Session';

module.exports = {

    getStatistics(callback) {
        $.ajax({
            type: 'GET',
            url: '/api/stats',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: xhr => {
                xhr.setRequestHeader('token', Session.getToken())
            },
            success: data => {
                return callback(null, data)
            },
            error: data => {
                return callback(data)
            }
        });
    }

}