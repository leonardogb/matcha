var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var iplocation = require('iplocation');
var fse = require('fs-extra');
var path = require('path');
//var iplocation = require('iplocation')
var userModel = require('../models/userM');
var profileModel = require('../models/profileM');
var tagModel = require('../models/tagsM');
var likesModel = require('../models/likesM');
var visitsModel = require('../models/visitsM');
var chatModel = require('../models/chatM');
var notifModel = require('../models/notifM');
var validator = require('../middleware/validator');
var sessionOk = require('../middleware/session').isOkLogin;


router.use(sessionOk);

router.post('/update', function(req, res)
{
    var user = req.session.user.login;
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;
    var update = validator.isValidUpdate(req.body);

    if (update != true)
    {
        console.log(req.body);
        userModel.getUserById(user_id).then(result => {
            delete result.passwd;
            delete result.cle;
            //console.log(result);
            tagModel.getTags(user_id).then( tagsTab => {
                console.log(tagsTab);
                notifModel.getNotifs(req.session.user.id).then(notif => {
                    res.render('pages/profileUpdate', {
                        title: "Profil de " + result.prenom,
                        message: "",
                        error: update,
                        login: user_login,
                        tabuser: result,
                        tabTags: tagsTab,
                        notif: notif,
                        userImg: req.session.user.img0
                    });
                });
                
            }).catch(function(err)
            {
                console.log(err);
                //res.redirect('/');
            });
            
        }).catch(function(err)
        {
            console.log(err);
            //res.redirect('/');
        });
    }
    else
    {
        console.log(req.body);
        var tab = [user_id, req.body.genre, req.body.age, req.body.orientation, req.body.ville, req.body.bio];
        
        profileModel.update(tab).then(respuesta => {
            console.log(req.body);
        userModel.getUserById(user_id).then(result => {
            delete result.passwd;
            delete result.cle;
            //console.log(result);
            tagModel.getTags(user_id).then( tagsTab => {
                console.log(tagsTab);
                var datos = [];
                datos.push(likesModel.getNbLikes(user_id));
                datos.push(visitsModel.getNbVisits(user));
                Promise.all(datos).then(datos => {
                    notifModel.getNotifs(req.session.user.id).then(notif => {
                        res.render('pages/profile', {
                            title: "Profil de " + result.prenom,
                            message: respuesta,
                            error: "",
                            login: result.login,
                            tabuser: result,
                            tabTags: tagsTab,
                            datos: datos,
                            notif: notif,
                            userImg: req.session.user.img0
                        });
                    });
                });
            }).catch(function(err)
            {
                console.log(err);
                //res.redirect('/');
            });
        }).catch(function(err)
            {
                console.log(err);
                //res.redirect('/pages/profileUpdate');
            });
        });
    }
});

router.post('/updatePerso', function(req, res)
{
    var user_id = req.session.user.id;
    //console.log(req.body);
    if (validator.isValidUsername(req.body.login) == true && validator.isValidNom(req.body.prenom, req.body.nom) == true && validator.isValidPass(req.body.mdp, req.body.mdp) == true && validator.isValidEmail(req.body.mail) == true)
    {
        var tab = [user_id, req.body.login, req.body.prenom, req.body.nom, req.body.mdp, req.body.mail];

        profileModel.updatePerso(tab).then(respuesta => {
            console.log(respuesta);

            //Actualizar la sesion
            req.session.user.login = req.body.login;
            req.session.user.prenom = req.body.prenom;
            req.session.user.nom = req.body.nom;
            req.session.user.mail = req.body.mail;
            console.log(req.session.user);
            res.redirect("/user/profile");
        }).catch(function(err)
        {
            console.log(err);
        });
    }
    else
    {
        console.log(req.body);
        userModel.getUserById(user_id).then(result => {
            delete result.passwd;
            delete result.cle;
            //console.log(result);
            tagModel.getTags(user_id).then( tagsTab => {//cambiar id de usuario
                console.log(tagsTab);
                notifModel.getNotifs(req.session.user.id).then(notif => {
                    res.render('pages/profileUpdate', {
                        title: "Profil de " + result.prenom, //cambiar por el login
                        message: "",
                        error: "Vérifier les champs",
                        login: result.login,
                        tabuser: result,
                        tabTags: tagsTab,
                        notif: notif,
                        userImg: req.session.user.img0
                    });
                });
                
            }).catch(function(err)
            {
                console.log(err);
                //res.redirect('/');
            });
        }).catch(function(err)
            {
                console.log(err);
                //res.redirect('/pages/profileUpdate');
            });
    }
});

router.post('/update/images', function(req, res)
{
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;
    var folder = path.join(__dirname, '../public/img/user', user_login + '/');

    if (!fse.existsSync(folder))
        fse.mkdirSync(folder);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //console.log(files);

        profileModel.updateImg(user_id, user_login, folder, files).then(result => {
            //console.log(result);
            Promise.all(result).then(function(values)
            {
                console.log(values);
                res.redirect('/profile');
            });
            
        });
        
    });
    
});

router.post('/updateTags', function(req, res)
{
    var user_id = req.session.user.id;
    var tags = req.body.tags;
    var tags = tags.split(',');

    //console.log(tags);
    //Validar antes los tags

    tags.forEach(function(element)
    {
        var validTag = validator.isValidTag(element);

        if (validTag == true)
        {
            tagModel.tagExists(element).then(result => {
                //console.log(result);
                if (result)
                {
                    //Recuperar los tag del usuario,
                    tagModel.userTagExists(user_id, result[0].id).then(respuesta => {
                        if (!respuesta)
                        tagModel.addUserTag(user_id, result[0].id);
                    }).catch(function(error) {
                        console.log("Error: ", error);
                    });
                }
                else
                {
                    tagModel.addTag(element).then(result => {
                        //Comprobar resultado
                        Promise.all(result).then( valores => {
                            console.log(valores);
                            if (valores[1])
                                tagModel.addUserTag(user_id, valores[1].id);
                        });
                            //res.redirect('/user/profile');
                    }).catch(function(error) {
                        console.log("Error: ", error);
                    });
                }
            });
        }// else mensaje de error (session)
        
    });
    res.redirect('/profile');
});

router.get('/deleteTag/:tag', function(req, res)
{
    var valido = validator.isValidTag(req.params.tag);
    var user_id = req.session.user.id;

    if (valido == true)
    {
        tagModel.getTagById(req.params.tag).then(result => {
            if (result)
            {
                tagModel.deleteTag(user_id, result); //Utilizar promise?
            }
             res.redirect('/profile');
        });
        
    }
    //else error el tag no es válido
});

router.get('/user/:login', function(req, res)
{
    var username = req.params.login;
    var user = req.session.user.login;
    var user_login = req.session.user.login;
    var user_id = req.session.user.id;
    var userImg = req.session.user.img0;

    console.log(req.session.user);
    userModel.getUserByUsername(username).then(result => {
        if (result && result.id != user_id)
        {
            delete result.passwd;
            delete result.cle;
            //console.log(result);
            tagModel.getTags(result.id).then( tagsTab => {
                //console.log(tagsTab);
                visitsModel.addVisit(user, result.login).then(ok => {
                    if(ok)
                    {
                        var datos = [];
                        datos.push(likesModel.likeExists(user_id, result.id));
                        datos.push(likesModel.likeExists(result.id, user_id));
                        datos.push(likesModel.getNbLikes(result.id));
                        datos.push(visitsModel.getNbVisits(result.login));
                        datos.push(userModel.setPopularite(1, result.id));
                        Promise.all(datos).then(resultado => {
                            //console.log(resultado);
                            chatModel.getMsgs(user_id, result.id).then(response => {
                                console.log(response);
                                notifModel.getNotifs(req.session.user.id).then(notif => {
                                    res.render('pages/profile-autre', {
                                        title: "Profil de " + result.prenom,
                                        message: "",
                                        error: "",
                                        login: user_login,
                                        id: user_id,
                                        tabuser: result,
                                        tabTags: tagsTab,
                                        datos: resultado,
                                        userImg: userImg,
                                        msg: response,
                                        notif: notif,
                                        userImg: req.session.user.img0
                                    });
                                });
                                
                            });
                            
                        }).catch(function(err)
                        {
                            console.log(err);
                            //res.redirect('/');
                        });
                    }
                    else
                        res.redirect('/user/profile');
                    
                });
                
                
            }).catch(function(err)
            {
                console.log(err);
                //res.redirect('/');
            });
        }
        else
            res.redirect('/user/profile');//hacer una mejor redirección
        
        
    }).catch(function(err)
    {
        console.log(err);
        //res.redirect('/');
    });
});

router.post('/setLoc', function(req, res)
{
    var address = req.body.address;

    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    address = escapeHtml(address);
    console.log(address);
    userModel.getLocation(address).then(localizacion => {
        localizacion = JSON.parse(localizacion);
        //console.log(localizacion);
        //console.log(localizacion.results);
        if (localizacion.summary.numResults == 1)
        {
            var direccion = localizacion.results[0].address.freeformAddress;
            var coordenadas = localizacion.results[0].position;
            var user_id = req.session.user.id;

            userModel.setLatLon(coordenadas.lat, coordenadas.lon, direccion, user_id).then( latLonOk => {
                if (latLonOk)
                {
                    //console.log(localizacion.results[0].address.freeformAddress);
                    //console.log(localizacion.results[0].position);
                    res.send({address: direccion, lat: coordenadas.lat, lon: coordenadas.lon});
                }
                else
                    res.send({address: "L'address n'est pas valide", lat: "undefined", lon: "undefined"});
            }).catch(function(err)
            {
                console.log(err);
            });
            
        }
        else
            res.send({address: "L'address n'est pas valide", lat: "undefined", lon: "undefined"});
        
    }).catch(function(err)
    {
        console.log(err);
    });
});

router.get('/like/:login', function(req, res)
{
    var user_id = req.session.user.id;
    var username = req.params.login;

    userModel.getIdUser(username).then(result => {
        if (result && user_id != result.id)
        {
            likesModel.likeExists(user_id, result.id).then(resultado => {

                if (resultado == 0)
                {
                    likesModel.addLike(user_id, result.id).then(results => {
                        userModel.setPopularite(5, result.id).then(popularite => {
                            if (results && popularite)
                                res.send({action: "added", value: 5});
                            else
                                res.send({action: "removed"});
                        });
                        
                    }).catch(function(err)
                    {
                        console.log(err);
                    });
                }
                else if (resultado == 1)
                {
                    likesModel.suprimeLike(user_id, result.id).then(results => {
                        userModel.setPopularite(-5, result.id).then(popularite => {
                            if (results && popularite)
                                res.send({action: "removed", value: -5});
                            else
                                res.send({action: "added"});
                        });
                    }).catch(function(err)
                    {
                        console.log(err);
                    });
                }
                else
                    res.send(false);
            }).catch(function(err)
            {
                console.log(err);
            });
        }
        else
            res.send(false);//este else esta bien?
        //res.redirect('/profile/user/' + username);
    });
});

router.get('/likes', function(req, res)
{
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;

    profileModel.getProfileLike(user_id).then(result => {
        console.log(result);
        notifModel.getNotifs(req.session.user.id).then(notif => {
            res.render('pages/profileslike', {
                title: "I like you!",
                message: "",
                error: "",
                login: user_login,
                miniProfil: result,
                notif: notif,
                userImg: req.session.user.img0
            });
        });
        
    });
});

router.get('/vues', function(req, res)
{
    var user_login = req.session.user.login;

    profileModel.getProfileVues(user_login).then(result => {
        console.log(result);
        notifModel.getNotifs(req.session.user.id).then(notif => {
            res.render('pages/vues', {
                title: "I visit you!",
                message: "",
                error: "",
                login: user_login,
                miniProfil: result,
                notif: notif,
                userImg: req.session.user.img0
            });
        });
        
    });
});

router.post('/removeNot', function(req, res)
{
    var userid = req.session.user.id;

    notifModel.removeNotif(userid).then(removeOk => {
        if (removeOk)
            res.send(true);
        else
            res.send(false);
    });
});

router.get('/', function(req, res)
{
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;

    //var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    //console.log(req.connection);
    
    userModel.getLatLon().then(latLon => {
        //console.log(latLon);
        if (latLon)
        {
            userModel.setLatLon(latLon.lat, latLon.lon, latLon.city, user_id).then(latLonOk => {
                if (latLonOk)
                {
                    userModel.getUserById(user_id).then(result => {
                        delete result.passwd;
                        delete result.cle;
                        //console.log(result);
                        tagModel.getTags(user_id).then( tagsTab => {
                            console.log(tagsTab);
                            notifModel.getNotifs(req.session.user.id).then(notif => {
                                res.render('pages/profileUpdate', {
                                    title: "Profil de " + result.prenom,
                                    message: "",
                                    error: "",
                                    login: user_login,
                                    tabuser: result,
                                    tabTags: tagsTab,
                                    notif: notif,
                                    userImg: req.session.user.img0
                                });
                            });
                            
                        }).catch(function(err)
                        {
                            console.log(err);
                            //res.redirect('/');
                        });
                        
                    }).catch(function(err)
                    {
                        console.log(err);
                        //res.redirect('/');
                    });
                }
            });
        }
    });
        
    
    // iplocation('185.15.27.37').then(res => {
    //     console.log(res);
    // })
    // .catch(err => {
    //     console.error(err)
    // });

    
});


module.exports = router;