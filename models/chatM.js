var database = require('../config/database');
var validator = require('../middleware/validator');

database.query('USE db_matcha');

var chatM = {
    isValidData: function(data)
    {
        return new Promise(function(resolve, reject)
        {
            if (validator.isValidUsername(data.user) != true || validator.isValidUsername(data.dst) != true)
                resolve(false);
            if (!validator.isValidImg(data.userImg) || !validator.isValidImg(data.dstImg))
                resolve(false);
            resolve(true);
        });
    }
};

module.exports = chatM;