var database = require('../config/database');
database.query('USE db_matcha');

var likesM = {
    likeExists: function(id_user, id_user_like)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT COUNT(*) AS count FROM likes WHERE id_user = ? AND id_user_like = ?", [id_user, id_user_like], function(err, response)
            {
                if (err) reject(err);
                resolve(response[0].count);
            });
        });
    },
    addLike: function(id_user, id_user_like)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("INSERT INTO likes (id_user, id_user_like) VALUES (?, ?)", [id_user, id_user_like], function(err, response)
            {
                if (err) reject(err);
                //console.log(response);
                if (response.affectedRows == 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });
        
    },
    suprimeLike: function(id_user, id_user_like)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("DELETE FROM likes WHERE id_user = ? AND id_user_like = ?", [id_user, id_user_like], function(err, response)
            {
                if (err) reject(err);
                //console.log(response);
                if (response && response.affectedRows == 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });
        
    },
    getNbLikes: function(id_user_like)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT COUNT(*) AS count FROM likes WHERE id_user_like = ?", id_user_like, function(err, response)
            {
                if (err) reject(err);
                //console.log(response);
                resolve(response[0].count)
            });
        });
        
    },
}

module.exports = likesM;