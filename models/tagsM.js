var database = require('../config/database');

database.query('USE db_matcha');

var tagsM = {
    tagExists: function(tag)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT COUNT(*) AS rows, `id`, `tag` FROM tags WHERE `tag` = ?", tag, function(err, result)
            {
                if (err) reject(err);
                if (result[0].rows == 1)
                    resolve(result);
                else
                    resolve(false);
            });
        });
    },
    userTagExists: function(id_user, id_tag)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT COUNT(*) AS rows, `id`, `id_user`, `id_tag` FROM usertags WHERE `id_user` = ? AND `id_tag` = ?", [id_user, id_tag], function(err, result)
            {
                if (err) reject(err);
                if (result && result[0].rows == 1)
                    resolve(result);
                else
                    resolve(false);
            });
        });
    },
    addTag: function(tag)
    {
        var promesas = [];

        return new Promise(function(resolve, reject)
        {
            promesas.push(new Promise(function(resolve, reject)
            {
                database.query("INSERT INTO `tags` (`tag`) VALUES (?)", tag, function(err, result)
                {
                    if (err) reject(err);
                    if (result.affectedRows == 1)
                        resolve(true);
                    else
                        resolve(false);
                });
            }));
            promesas.push(new Promise(function(resolve, reject)
            {
                database.query("SELECT COUNT(*) AS rows, `id`, `tag` FROM tags WHERE `tag` = ?", tag, function(err, result)
                {
                    if (err) reject(err);
                    if (result[0].rows == 1)
                        resolve(result[0]);
                    else
                        resolve(false);
                });
            }));
            resolve(promesas);
        });
    },
    addUserTag: function(id_user, id_tag)
    {
        database.query("INSERT INTO `usertags` (`id_user`, `id_tag`) VALUES (?, ?)", [id_user, id_tag], function(err, result)
        {
            if (err) throw(err);
        });
    },
    getTags: function(id_user)
    {
        return new Promise(function(resolve, reject)
        {
            
            database.query("SELECT tags.tag FROM tags INNER JOIN usertags ON usertags.id_tag = tags.id WHERE usertags.id_user = ?", id_user, function(err, result)
            {
                if (err) reject(err);
                var tagsTab = [];
                Object.keys(result).forEach(function(value)
                {
                    tagsTab.push(result[value].tag);
                });
                resolve(tagsTab);
            });
            
        });
    },
    getTagById: function(tag)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT COUNT(*) AS count, id FROM tags WHERE tag = ?", tag, function(err, result)
            {
                if (err) reject(err);
                if (result[0].count == 1)
                    resolve(result[0].id);
                else
                    resolve(false);
            });
            
        });
    },
    deleteTag: function(id_user, id_tag)
    {
        database.query("DELETE FROM usertags WHERE id_user = ? AND id_tag = ?", [id_user, id_tag], function(err, result)
        {
            if (err) throw(err);
        });
    }
};

module.exports = tagsM;