const _              = require('underscore');
const Team           = require('../models/Team');
const User           = require('../models/User');
const TeamFields     = require('../models/data/TeamFields');
const Settings       = require('../models/Settings');
const UserController = require('../controllers/UserController');

const logger         = require('../services/logger');
const uuidv4         = require('uuid/v4');

var TeamController   = {};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}


TeamController.teamAccept = function(adminUser, teamCode, callback) {
    console.log(teamCode)
    TeamController.getByCode(teamCode, function (err, team) {
        if (err || !team) {
            console.log(err)
            return callback(err);
        }

        logger.logAction(adminUser._id, -1, 'Admitted team ' + team.name, 'EXECUTOR IP: ' + adminUser.ip);

        for (var teamMember in team.memberNames) {
            UserController.admitUser(adminUser, team.memberNames[teamMember].id, function (err, user) {
                if (err || !user){
                    console.log(err)
                }
            })
        }

        return callback(false, team);
    })
};

TeamController.teamReject = function(adminUser, teamCode, callback) {
    console.log(teamCode)
    TeamController.getByCode(teamCode, function (err, team) {
        if (err || !team) {
            console.log(err)
            return callback(err);
        }

        logger.logAction(adminUser._id, -1, 'Rejected team ' + team.name, 'EXECUTOR IP: ' + adminUser.ip);

        for (var teamMember in team.memberNames) {
            UserController.rejectUser(adminUser, team.memberNames[teamMember].id, function (err, user) {
                if (err || !user){
                    console.log(err)
                }
            })
        }

        return callback(false, team);
    })
};

TeamController.createTeam = function(id, teamName, callback) {

    if (!id || !teamName) {
        return callback({error : 'Invalid arguments'});
    }

    if (teamName.length > 50) {
        return callback({error : 'Name is too long! (Max 50)'})
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            return callback({error : 'Unable to get user'});
        }

        if (user.teamCode && user.teamCode.length != 0) {
            return callback({error : 'You are already in a team!'});
        }

        Team.create({
            name: teamName,
            code: uuidv4().substring(0, 7),
            memberIDs: [user._id]
        }, function(err, team) {

            if (err) {
                return callback({error: 'Unable to create team'})
            }

            User.findOneAndUpdate({
                _id: id
            }, {
                teamCode: team.code
            }, {
                new: true
            }, function(err, newUser) {
                logger.logAction(id, -1, 'Created the team: ' + teamName + ' (' + team.code + ')');

                team = team.toJSON();
                team.memberNames = [newUser.fullName];

                return callback(null, team);
            });
        });
    });
};

TeamController.joinTeam = function(id, teamCode, callback) {

    if (!id || !teamCode) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            return callback({error : 'Unable to get user'});
        }

        if (user.teamCode && user.teamCode.length != 0) {
            return callback({error : 'You are already in a team!'});
        }

        Team
            .findOne({
                code : teamCode.trim()
            })
            .select('+memberIDs')
            .exec(function (err, team) {
                if (err || !team) { // Team doesn't exist yet
                    return callback({ error : 'Team doesn\'t exist' });
                }

                if (team.memberIDs.length < process.env.TEAM_MAX_SIZE) { // Can still join team
                    Team
                        .findOneAndUpdate({
                            code : teamCode.trim()
                        }, {
                            $push : {
                                memberIDs: user._id
                            }
                        }, {
                            new: true
                        })
                        .populate('memberNames')
                        .exec(function(err, newTeam) {
                            if (err || !newTeam) {
                                return callback({ error : 'Unable to join team' });
                            }

                            User.findOneAndUpdate({
                                _id : id
                            }, {
                                $set : {
                                    teamCode: newTeam.code
                                }
                            }, {
                                new: true
                            }, function(err, newUser) {
                                if (err || !newUser) {
                                    return callback({error : 'Something went wrong' });
                                }

                                // Substitutes user objects with their names
                                for (var u in newTeam.memberNames) {
                                    newTeam.memberNames[u] = newTeam.memberNames[u].fullName
                                }

                                // Add new user's name
                                // Not populated yet
                                newTeam.memberNames.push(newUser.fullName);

                                logger.logAction(id, -1, 'Joined the team: ' + newTeam.name + ' (' + newTeam.code + ')', newTeam);
                                return callback(null, newTeam);
                            });
                        });
                } else {
                    return callback({ error : 'Team is full' });
                }
            });
    });
};

TeamController.leaveTeam = function(id, callback) {

    if (!id) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            return callback(err ? err : {error : 'Unable to get user'});
        }

        if (user.teamCode.length == 0) {
            return callback({error : 'You are not in a team'});
        }

        User.findOneAndUpdate({
            _id : user._id
        }, {
            $set : {
                teamCode : ''
            }
        }, {
            new: true
        }, function(err, newUser) {
            if (err || !newUser) {
                return callback(err ? err : {error: 'Unable to leave team', code: 500});
            }

            Team
                .findOneAndUpdate({
                    code : user.teamCode
                }, {
                    $pull : {
                        memberIDs : user._id
                    }
                }, {
                    new: true
                })
                .select('+memberIDs')
                .exec(function(err, newTeam) {

                    logger.logAction(id, -1, 'Left the team: ' + newTeam.name + ' (' + user.teamCode + ')');

                    if (newTeam && newTeam.memberIDs.length == 0) { // Team is dead, kill it for good
                        Team.findOneAndRemove({
                            _id : newTeam._id
                        }, function(err) {
                            logger.logAction(-1, -1, 'Deleted the team: ' + newTeam.name + ' (' + user.teamCode + ')');
                        });
                    }

                    if (!newTeam) {
                        newTeam.name = 'null';
                    }

                    return callback(null, {message:'Success'})
                });
        })
    });
};

TeamController.getTeam = function(id, callback) {

    if (!id) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            return callback(err ? err : {error : 'Unable to get user'});
        }

        if (!user.teamCode || user.teamCode.length == 0) {
            return callback(null, null);
        }

        Team
            .findOne({
                code : user.teamCode
            })
            .populate('memberNames')
            .exec(function (err, team) {
                if (err || !team) { // Team doesn't exist
                    return callback({ error : 'Team doesn\'t exist' });
                }

                // Substitutes user objects with their names
                for (var u in team.memberNames) {
                    team.memberNames[u] = team.memberNames[u].fullName
                }

                return callback(null, team);
            });
    });
};
TeamController.getByCode = function(code, callback) {

    if (!code) {
        return callback({error : 'Invalid arguments'});
    }

    Team
        .findOne({
            code : code
        })
        .populate('memberNames')
        .exec(function (err, team) {
            if (err || !team) { // Team doesn't exist
                return callback({ error : 'Team doesn\'t exist' });
            }

            // Substitutes user objects with their names
            for (var u in team.memberNames) {
                team.memberNames[u] = {name: team.memberNames[u].fullName, id: team.memberNames[u]._id, admissionState: team.memberNames[u].status.name}
            }

            return callback(null, team);
        });
};

TeamController.removeFromTeam = function (userExcute, id, code, callback) {
    if (!code || !id) {
        return callback({error: 'Invalid arguments'})
    }

    User.findOne({
        _id: id
    }, function (err, user) {
        if (err || !user) {
            console.log(err)
            return callback({ error : 'User doesn\'t exist' });
        }

        if (user.teamCode !== code) {
            return callback({ error : 'The user doesn\'t belong in this team'})
        }

        TeamController.leaveTeam(id, function (err, data) {
            if (err || !data) {
                return callback(err);
            }

            logger.logAction(userExcute.id, -1, 'Removed: ' + user.email + 'from team ' + code, 'EXECUTOR IP: ' + userExcute.ip);

            Team.findOne({
                code: code
            }).populate('memberNames')
                .exec(function (err, team) {
                    if (err || !team) {
                        return callback(null, {message : true})
                    } else {
                        return callback(null, {message : false})
                    }
                })
        })
    })
};

TeamController.deleteTeamByCode = function (userExcute, code, callback) {
    if (!code) {
        return callback({error : 'Invalid arguments'});
    }
    Team.findOne({
        code: code
    }, function (err, team) {
        if (err || !team) {
            return callback({ error : 'Team doesn\'t exist' });
        }
        User.updateMany({teamCode: code}, {teamCode: ''}, function (err) {
            Team.findOneAndRemove({
                code: code
            }, function (err) {
                if (err) {
                    return callback({error : 'Unable to delete Team'})
                }
                console.log(userExcute);
                logger.logAction(userExcute.id, -1, 'Deleted the team: ' + team.name + ' (' + code + ')', 'EXECUTOR IP: ' + userExcute.ip);

                return callback(null, {message : 'Success'})
            });
        });
    });
};

TeamController.getFields = function (userExcute, callback) {
    var fieldsOut = [];
    var current = TeamFields;

    for (var runner in current) {
        if (!TeamFields[runner]['permission'] || TeamFields[runner]['permission'] <= userExecute.permissions.level) {
                fieldsOut.push({'name' : runner, 'type' : TeamFields[runner]['type'].name});
        }
    }

    fieldsOut.push({'name': "memberNames",});
    console.log("testing " + fieldsOut);

    callback(null, fieldsOut)
};

TeamController.getByQuery = function (adminUser, query, callback) {

    if (!query || !query.page || !query.size) {
        return callback({error : 'Invalid arguments'});
    }

    var page    = parseInt(query.page);
    var size    = parseInt(query.size);
    var text    = query.text;
    var sort    = query.sort ? query.sort : {};
    var filters = query.filters ? query.filters : {};
    var and     = [];
    var or      = [];
    var appPage = query.appPage ? query.appPage : null;

    console.log(appPage);

    if (text) {
        var regex = new RegExp(escapeRegExp(text), 'i'); // filters regex chars, sets to case insensitive

        or.push({ name: regex });
        or.push({ 'memberNames': regex });
    }

    if (or && or.length) {
        if ('$or' in filters) {
            filters['$or'].concat(or)
        } else {
            filters['$or'] = or
        }
    }

    if (and && and.length) {
        if ('$and' in filters) {
            filters['$and'].concat(and)
        } else {
            filters['$and'] = and
        }
    }

    console.log(filters);

    Team.count(filters, function(err, count) {

        if (err) {
            console.log(err);
            return callback({error:err.message})
        }

        if (size === 0) {
            size = count
        }

        Team
            .find(filters)
            .sort(sort)
            .skip((page - 1) * size)
            .limit(size)
            .populate('memberNames')
            .exec(function(err, teams) {
                if (err) {
                    console.log(err);
                    return callback({error:err.message})
                }

                console.log(teams, count, size);

                for (var i = 0; i < teams.length; i++) {
                    teams[i] = TeamController.filterNames(teams[i])
                }

                return callback(null, {
                    teams: teams,
                    totalPages: Math.ceil(count / size),
                    count: count
                })
            });
        });

};

TeamController.filterNames = function (team) {
    // Substitutes user objects with their names
    for (var u in team.memberNames) {
        team.memberNames[u] = [team.memberNames[u].fullName, team.memberNames[u].id]
    }
    return team
};

module.exports = TeamController;