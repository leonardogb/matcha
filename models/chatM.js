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
    },
    newMsg: function(userId, destId, msg, date)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("INSERT INTO messages (id_user, id_dst, message, date_msg) VALUES (?, ?, ?, ?)", [userId, destId, msg, date], function(err, result)
            {
                if (err) reject(err);
                if(result.affectedRows == 1)
                    resolve("Message: " + msg + " added to the database");
                else
                    resolve("The message " + msg + " could not be added to the database");
            });
        });
    },
    getMsgs: function(userId, destId)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT id_user, message, TIME_FORMAT(date_msg, '%H:%i %p') AS time FROM messages WHERE id_user = ? AND id_dst = ? OR id_user = ? AND id_dst = ? ORDER BY date_msg DESC LIMIT 5", [userId, destId, destId, userId], function(err, results)
            {
                if (err) reject(err);
                resolve(results.reverse());
            });
        });
    },
};

module.exports = chatM;