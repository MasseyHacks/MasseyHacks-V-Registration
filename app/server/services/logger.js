var Logs  = require('../models/Logs');

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

        /**
         * To-Do: Fix this bash...
         */

        // Creates log object
        Logs.buildLoggingData(actionFrom, function(data) {
            var event = new Logs();

            event.from = data;

            Logs.buildLoggingData(actionTo, function(data) {

                event.to = data;

                event.message = message;
                event.timestamp = Date.now();

                console.log(event.toJSON());

                event.save(function(err) {
                    if (err) {
                        console.log("Unable to log.", err);
                    }
                });
            });
        });
    }
};