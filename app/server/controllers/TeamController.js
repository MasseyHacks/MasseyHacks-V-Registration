const _              = require('underscore');
const Team           = require('../models/Team');
const User           = require('../models/User');
const TeamFields     = require('../models/data/TeamFields');
const Settings       = require('../models/Settings');

const logger         = require('../services/logger');
const uuidv4         = require('uuid/v4');

var TeamController   = {};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}


TeamController.teamAccept = function(adminUser, userID, callback) {
    User.getbyID(userID, function (err, user) {
        if (err || !user){
            return callback(err, user);
        } else {

            Team.getByCode(user.teamCode, '+memberIDs', function (err, team) {
                if (err || !team) {
                    return callback(err, user);
                }

                logger.logAction(adminUser._id, -1, 'Admitted team ' + team.name);

                for (id in team.memberIDs) {
                    UserController.admitUser(adminUser, id, function (err, user) {
                        if (err || !user){
                            console.log(err)
                        }
                    })
                }

                return callback(err, user);
            })
        }
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

TeamController.getFields = function (userExcute, callback) {
    var fieldsOut = [];
    var current = TeamFields

    for (var runner in current) {
        if (!TeamFields[runner]['permission'] || TeamFields[runner]['permission'] <= userExecute.permissions.level) {
                fieldsOut.push({'name' : runner, 'type' : TeamFields[runner]['type'].name});
        }
    }

    fieldsOut.push({'name' : "memberNames", })
    console.log("testing " + fieldsOut)

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

    console.log(appPage)

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

    console.log(filters)

    Team.count(filters, function(err, count) {

        if (err) {
            console.log(err)
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
                    console.log(err)
                    return callback({error:err.message})
                }

                console.log(teams, count, size)

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