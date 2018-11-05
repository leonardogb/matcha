var database = require('../config/database');
var bcrypt = require('bcrypt');
var ent = require('ent');
var uniqid = require('uniqid');
var nodemailer = require('nodemailer');
var base64url = require('base64url');
const request = require('request');

database.query('USE db_matcha');
var userM = {
    loginExists: function(login)
    {
        login = ent.encode(login);

        return new Promise(function(resolve, reject)
        {
            database.query('SELECT `login` FROM users WHERE login=?', login, function (err, results)
            {
                if (err) reject(err);
                resolve(results.length);
            });
        });
    },
    emailExists: function(email)
    {
        return new Promise(function(resolve, reject)
        {
            database.query('SELECT `mail` FROM users WHERE mail=?', email, function (err, results)
            {
                if (err) reject(err);
                if (results)
                    resolve(results.length);
                else
                    resolve(false);
            });
        });
    },
    addUser: function(tab)
    {
        if (tab.login != "" && tab.email != "" && tab.nombre != "" && tab.apellido != "" && tab.passwd1 != "")
        {
            var tab2 = Object.values(tab);
            //tab2 = tab2.map(function(elem) {return ent.encode(elem)});
            //console.log(tab2);
            var passwd = bcrypt.hashSync(tab2[4], 10);

            var cle = bcrypt.hashSync(uniqid(tab2[0]), 10);
            cle = base64url(cle);
            tab2.splice(4, 2, passwd, cle);

            console.log(tab2);
            return new Promise(function(resolve, reject)
            {
                database.query("INSERT INTO `users` (`login`, `mail`, `prenom`, `nom`, `passwd`, `cle`) VALUES (?)", [tab2], function (err, results)
                {
                    if (err) reject(err);
                    resolve(results.affectedRows);
                });

            }).then(function(result)
            {
                if (result == 1)
                {
                    var transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            type: 'OAuth2',
                            user: 'hercules.le101@gmail.com',
                            clientId: '297940244352-6kp2r7cei6307aeh2vfgc7pvkmt1k12c.apps.googleusercontent.com',
                            clientSecret: 'x3zxH4cpRLmQCg24qFbtsEU3',
                            refreshToken: '1/rFA3EGVpfNx4E7S0FB58aEkIyuLLc1sGVsoRjSj8KNc',
                            accessToken: 'ya29.GlsQBhUek2ReCSoGNzuu_B7n-BD6pdpgPxP8AA5G9Gr4fw1kIKPoDpQphoeoLz1Fqq8Oo76V-h-ItRZA0vpU-yT9M79yAOuIgb2WyFfLH8dmj6kMzEWJCcZs3LGs',
                            expires: 3600
                        }
                      });

                    var mailOptions = {
                        from: 'info@matcha.com',
                        to: tab.email,
                        subject: 'Welcome to Matchat ! 👭👫👬',
                        html: '<html>\
                        <head>\
                            <title>Welcome to Matcha ! ♥️</title>\
                        </head>\
                        <body>\
                            Bienvenue sur Matcha ' + tab.login + '. </br>\
                            Pour activer votre compte, veuillez cliquer sur le lien ci dessous\
                            ou copier/coller dans votre navigateur internet. </br>\
                            <a href="http://localhost:8080/user/activation/' + encodeURI(tab.login) + '/' + encodeURI(cle) + '">Verifier compte</a>\
                            <p>---------------\
                            Ceci est un mail automatique, merci de ne pas y répondre.\
                            </p>\
                        </body>\
                        </html>'
                    };
                      
                    transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    });
                    return result;
                }
                else
                {
                    return false;
                }
            });
        }
        else
        {
            return new Promise(function(resolve, reject)
            {
                resolve(false);
            });
        }
    },
    userActivation: function(login, cle)
    {
        var username = ent.encode(login);
        var clave = ent.encode(cle);

        return new Promise(function (resolve, reject)
        {
            database.query("SELECT cle, active FROM `users` WHERE login=?", username, function (err, results)
            {
                if (err) reject(err);
                if (results.length == 1)
                {
                    if (results[0].active == 1)
                        reject('L\'utilisateur est déjà activé.');
                    else if (results[0].cle != clave)
                        reject("Le lien d\'activation n\'est pas valide.");
                    else
                        resolve(true);
                }
                else
                    reject("Le lien d\'activation n\'est pas valide.");
                
            });
        }).then(function(result) {
            if (result == true)
            {
                database.query("UPDATE `users` SET cle = null, active = 1 WHERE login=?", username, function (err, results)
                {
                    if (err) reject(err);
                });
            }
            return result;
        });
    },
    auth: function(username, passwd)
    {
        //valider username y passwd

        return new Promise(function(resolve, reject)
        {
            database.query("SELECT id, login, prenom, nom, passwd, mail, active, img0 FROM users WHERE login=?", username, function (err, results)
            {
                if (err) reject(err);
                console.log(results);
                if (results[0])
                {
                    if (results[0].active == 1)
                    {
                        bcrypt.compare(passwd, results[0].passwd, function(err, res)
                        {
                            
                            if (res == true)
                                resolve(results[0]);
                            else
                                reject("Le login ou le mot de passe n\'est pas valide.");
                        });
                    }
                    else
                        reject("Vous devez activer votre compte.");
                }
                else
                    reject("Êtes-vous inscrit ?");
                
            });
        });
    },
    verifMDP: function(username, mdp)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT passwd, active FROM `users` WHERE login=?", username, function (err, results)
            {
                if (err) reject(err);
                if (results[0])
                {
                    bcrypt.compare(mdp, results[0].passwd, function(err, res)
                    {
                        if (err) reject (err);
                        resolve(res);
                    });
                }
                else
                    reject(false);
                
            });
        });
    },
    getUserByUsername: function(username)
    {
        return new Promise(function(resolve, reject)
        {
            database.query('SELECT * FROM users WHERE login=?', username, function (err, results)
            {
                if (err) reject(err);
                if (results && results.length == 1)
                    resolve(results[0]);
                else
                    resolve(false);
            });
        });
    },
    getUserById: function(id)
    {
        return new Promise(function(resolve, reject)
        {
            database.query('SELECT * FROM users WHERE id=?', id, function (err, results)
            {
                if (err) reject(err);
                if (results.length == 1)
                    resolve(results[0]);
                else
                    reject("Verifica la base de datos.");
            });
        });
    },
    getUserBySex: function(sex, orientation)
    {
        return new Promise(function(resolve, reject)
        {
            var sql;
            var params;
            if (sex == "Autre")
            {
                sql = 'SELECT * FROM users WHERE complet = 1 AND orientation = ?';
                params = orientation;
            }
            else
            {
                sql = 'SELECT * FROM users WHERE complet = 1 AND orientation = ? AND genre=?';
                params = [orientation, sex];
            }
            database.query(sql, params, function(err, users)
            {
                if (err) reject(err);
                if (users)
                    resolve(users);
                else
                    resolve(false);
            });
        });
    },
    getUsersLimits: function(sex, orientation, age, popul, tri)
    {
        return new Promise(function(resolve, reject)
        {
            var sql;
            var params;

            if (sex == "Autre")
            {
                sql = 'SELECT * FROM users WHERE complet = 1 AND orientation = ? AND age >= ? AND age <= ? AND popularite >= ? AND popularite <= ?';
                if (tri == "age")
                    sql += ' ORDER BY age';
                else if (tri == "location")
                    sql += ' ORDER BY location';
                else if (tri == "popularite")
                    sql += ' ORDER BY popularite';
                params = [orientation, age.ageMin, age.ageMax, popul.populMin, popul.populMax, tri];
            }
            else
            {
                sql = 'SELECT * FROM users WHERE complet = 1 AND orientation = ? AND age >= ? AND age <= ? AND popularite >= ? AND popularite <= ? AND genre = ?';
                if (tri == "age")
                    sql += ' ORDER BY age';
                else if (tri == "location")
                    sql += ' ORDER BY location';
                else if (tri == "popularite")
                    sql += ' ORDER BY popularite';
                params = [orientation, age.ageMin, age.ageMax, popul.populMin, popul.populMax, sex, tri];
            }
            database.query(sql, params, function(err, users)
            {
                console.log("Tri: " + tri);
                if (err) reject(err);
                if (users)
                    resolve(users);
                else
                    resolve(false);
            });
        });
    },
    getIdUser: function(username)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT id FROM users WHERE login = ?", username, function(err, resultado)
            {
                if (err) reject(err);
                if (resultado && resultado.length == 1)
                    resolve(resultado[0]);
                else
                    resolve(false);
            });
        });
    },
    setPopularite: function(valeur, id_user)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("UPDATE users SET popularite = popularite + ? WHERE id = ?", [valeur, id_user], function(err, result)
            {
                if (err) reject(err);
                if (result && result.affectedRows == 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });
    },
    setVisite: function(userId, estado)
    {
        return new Promise(function(resolve, reject)
        {
            if (estado == "on")
            {
                database.query("UPDATE users SET visite = 'online' WHERE id = ?", userId, function(err, result)
                {
                    if (err) reject(err);
                    if (result && result.affectedRows == 1)
                        resolve(true);
                    else
                        resolve(false);
                });
            }
            else if (estado == "off")
            {
                var d = new Date(),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;
                var fecha = day + "-" + month + "-" + year;
                database.query("UPDATE users SET visite = ? WHERE id = ?", [fecha, userId], function(err, result)
                {
                    if (err) reject(err);
                    if (result.affectedRows == 1)
                        resolve(true);
                    else
                        resolve(false);
                });
            }
        });
    },
    getLatLon: function()
    {
        return new Promise(function(resolve, reject)
        {
            request('http://ip-api.com/json', { json: true }, (err, res, body) => {
            if (err) reject(err);
            console.log(body);
            resolve({lat: body.lat, lon: body.lon, city: body.city});
            });
        });
    },
    setLatLon: function(lat, lon, direccion, user_id)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("UPDATE users SET lat = ?, lon = ?, location = ? WHERE id = ?", [lat, lon, direccion, user_id], function(err, result)
            {
                if (err) reject(err);
                if (result && result.affectedRows == 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });
    },
    getLocation: function(address)
    {
        return new Promise(function(resolve, reject)
        {
            address = address.replace(/^\s+|\s+$|[\s]+/g, ' ').trim();
            address = address.replace(/[ ]/g, '+');
            request("https://api.tomtom.com/search/2/geocode/" + address + ".JSON?key=14hKz7D9ojvNcaHNaBAqvePAM4QTu6ki&limit=1", (err, res, body) => {
                if (err) reject(err);
                //console.log(body);
                resolve(body);
            });
        });
    }

};

module.exports = userM;