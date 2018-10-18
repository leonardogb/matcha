var database = require('../config/database');

database.query('USE db_matcha');

function distance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    dist = dist * 1.609344
    return dist
}

var matchM = {
    getPtsDistance: function(lat1, lon1, lat2, lon2)
    {
        return new Promise(function(resolve, reject)
        {
            const distancia = distance(lat1, lon1, lat2, lon2);
            var puntos = 1000 - distancia;
            puntos = puntos / 1000;
            puntos = puntos * 50;
            if (puntos < 0)
                puntos = 0;
            resolve(puntos);
        });
    },
    getPtsTags: function(user1Id, user2Id)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT tags.tag FROM tags INNER JOIN usertags ON tags.id = usertags.id_tag WHERE usertags.id_user = ?", user1Id, function(err, tags1)
            {
                if (err) reject(err);
                database.query("SELECT tags.tag FROM tags INNER JOIN usertags ON tags.id = usertags.id_tag WHERE usertags.id_user = ?", user2Id, function(err, tags2)
                {
                    if (err) reject(err);
                    var puntos = 0;
                    tags1.forEach(elem1 => {
                        tags2.forEach(elem2 => {
                            if (elem1.tag == elem2.tag)
                                puntos = puntos + 10;
                        });
                    });
                    if (puntos > 40)
                        puntos = 40;
                    resolve(puntos);
                });
            });
        });
    },
    getPtsPopul: function(popularite)
    {
        return new Promise(function(resolve, reject)
        {
            var puntos = popularite / 500;
            puntos =puntos * 25;
            resolve(puntos);
        });
    },
    setPuntos: function(user2Id, total)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("UPDATE users SET puntos = ? WHERE id = ?", [total, user2Id], function(err, ok)
            {
                if (err) reject(err);
                if (ok && ok.affectedRows == 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });
    },
}

module.exports = matchM;