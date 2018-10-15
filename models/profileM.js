var database = require('../config/database');
var fse = require('fs-extra');
var bcrypt = require('bcrypt');


database.query('USE db_matcha');

var profileM = {

    initProfil: function(id_user)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("INSERT INTO profil (id_user) VALUES (?)", id_user, function (err, results)
            {
                if (err) reject(err);
                resolve(results.affectedRows);
            });
        });
    },
    updateImg: function(id_user, username, folder, files)
    {

        return new Promise(function(resolve, reject)
        {
            var tabla = [];

            //console.log(files);
            Object.keys(files).forEach(function(key)  {
                console.log(files[key].name);
                if (files[key].size > 0)
                {
                    tabla.push(new Promise(function (resolve, reject)
                    {
                        var oldpath = files[key].path;
                        var imgName = files[key].name;
                        var newpath = folder + files[key].name;

                        fse.move(oldpath, newpath, {overwrite: true}, function(err)
                        {
                            if (err) reject(err);
                            var newImg = '/img/user/' + username + '/' + imgName;
                            var sql = "UPDATE `users` SET " + key + "='" + newImg + "' WHERE id=" + id_user;
                            database.query(sql, function (err, results)
                            {
                                //console.log(results);
                                if (err) reject(err);
                                resolve(results.affectedRows);
                            });
                        });
                    }));
                }
            });
            resolve(tabla);
        });
    },
    profil: function(tab)
    {
        database.query("INSERT INTO `profil` (`id_user`, `genre`, `age`, `orientation`, `bio`, `ville`) VALUES (?)", [tab], function (err, results)
        {
            if (err) throw (err);
        });
    },
    update: function(tab)
    {
        //console.log(tab);
        return new Promise(function(resolve, reject)
        {
            database.query("UPDATE `users` SET `genre`=?, `age`=?, `orientation`=?, `ville`=?, `bio`=?, `complet` = 1 WHERE id=?", [tab[1], tab[2], tab[3], tab[4], tab[5], tab[0]], function (err, results)
            {
                if (err) reject (err);
                resolve("Votre profil a été mis à jour.");
            });
        });
        
    },
    updatePerso: function(tab)
    {
        //console.log(tab);
        return new Promise(function(resolve, reject)
        {
            var pass = bcrypt.hashSync(tab[4], 10);

            
            database.query("UPDATE `users` SET `login`=?, `prenom`=?, `nom`=?, `passwd`=?, `mail`=? WHERE id=?", [tab[1], tab[2], tab[3], pass, tab[5], tab[0]], function (err, results)
            {
                if (err) reject (err);
                resolve("Votre profil a été mis à jour.");
            });
        });
        
    },
    getImg: function(id_user)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT `img0`, `img1`, `img2`, `img3`, `img4` FROM users WHERE id = ?", id_user, function (err, results)
            {
                //console.log(results)
                if (err) reject (err);
                resolve (results[0]);
            });
        });
        
    },
    getProfile: function(id_user)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT `genre`, `age`, `orientation`, `bio`, `ville` FROM profil WHERE id_user = ?", id_user, function (err, results)
            {
                //console.log(results)
                if (err) reject (err);
                resolve (results[0]);
            });
        });
        
    },
    getProfileLike: function(id_user)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT login, prenom, nom, genre, age, orientation, img0 FROM users INNER JOIN likes ON users.id = likes.id_user WHERE likes.id_user_like = ?", id_user, function(err, miniProfiles)
            {
                if (err) reject(err);
                resolve(miniProfiles);
            });
        });
    },
    getProfileVues: function(user)
    {
        return new Promise(function(resolve, reject)
        {
            database.query("SELECT DISTINCT login, prenom, nom, genre, age, orientation, img0 FROM users INNER JOIN historique ON users.login = historique.username WHERE historique.visited = ?", user, function(err, miniProfiles)
            {
                if (err) reject(err);
                resolve(miniProfiles);
            });
        });
    }
};

module.exports = profileM;