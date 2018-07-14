var Settings  = require('../models/Settings');

module.exports = {
    defaultResponse : function(req, res){
        return function(err, data){
            if (err){
                // Only send error to slack if in production
                // Keep everyone happy
                if (process.env.NODE_ENV === 'production'){
                    request
                        .post(process.env.SLACK_HOOK,
                            {
                                form: {
                                    payload: JSON.stringify({
                                        "text":
                                        process.env.ADMIN_UIDS + "\nAn issue was detected with the server.\n\n``` \n" +
                                        "Request: \n " +
                                        req.method + ' ' + req.url +
                                        "\n ------------------------------------ \n" +
                                        "Body: \n " +
                                        JSON.stringify(req.body, null, 2) +
                                        "\n ------------------------------------ \n" +
                                        "\nError:\n" +
                                        JSON.stringify(err, null, 2) +
                                        "``` \n"
                                    })
                                }
                            },
                            function (error, response, body) {
                                return res.status(500).json(data);
                            }
                        );
                } else {
                    return res.status(500).send(err);
                }
            } else {
                console.log(data);
                return res.json(data);
            }
        };
    },
    logAction : function (actionFrom, actionTo, message) {

        console.log(actionFrom, actionTo, message);

        Settings.findOneAndUpdate(
            {},
            {
                $push : {
                    'log' : {
                        "from" : actionFrom,
                        "to" : actionTo,
                        "message" : message
                    }
                }
            },
            {
                new: true
            }, function (err, settings) {

            }
        )
        
    }
};