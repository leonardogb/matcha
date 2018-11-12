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
var message = false;
var error = false;


router.use(sessionOk);

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

router.post('/update', function(req, res)
{
    var user = req.session.user.login;
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;
    var update = validator.isValidUpdate(req.body);

    if (update != true)
    {
        req.session.user.error = update;
        res.redirect('/profile');
        // console.log(req.body);
        // userModel.getUserById(user_id).then(result => {
        //     delete result.passwd;
        //     delete result.cle;
        //     //console.log(result);
        //     tagModel.getTags(user_id).then( tagsTab => {
        //         console.log(tagsTab);
        //         notifModel.getNotifs(req.session.user.id).then(notif => {
        //             res.render('pages/profileUpdate', {
        //                 title: "Profil de " + result.prenom,
        //                 message: false,
        //                 error: update,
        //                 login: user_login,
        //                 tabuser: result,
        //                 tabTags: tagsTab,
        //                 notif: notif,
        //                 userImg: req.session.user.img0
        //             });
        //         });
                
        //     }).catch(function(err)
        //     {
        //         console.log(err);
        //         res.redirect('/');
        //     });
            
        // }).catch(function(err)
        // {
        //     console.log(err);
        //     res.redirect('/');
        // });
    }
    else
    {
        console.log(req.body);
        var tab = [user_id, req.body.genre, req.body.age, req.body.orientation, req.body.ville, req.body.bio];
        
        profileModel.update(tab).then(respuesta => {
            if(respuesta)
            {
                req.session.user.message = "Votre profil a été mis à jour";
            }
            else
                req.session.user.error = "Votre profil n'est pas a jour"
            res.redirect('/user/profile');
        // console.log(req.body);
        // userModel.getUserById(user_id).then(result => {
        //     delete result.passwd;
        //     delete result.cle;
        //     //console.log(result);
        //     tagModel.getTags(user_id).then( tagsTab => {
        //         console.log(tagsTab);
        //         var datos = [];
        //         datos.push(likesModel.getNbLikes(user_id));
        //         datos.push(visitsModel.getNbVisits(user));
        //         Promise.all(datos).then(datos => {
        //             notifModel.getNotifs(req.session.user.id).then(notif => {
        //                 res.render('pages/profile', {
        //                     title: "Profil de " + result.prenom,
        //                     message: respuesta,
        //                     error: false,
        //                     login: result.login,
        //                     tabuser: result,
        //                     tabTags: tagsTab,
        //                     datos: datos,
        //                     notif: notif,
        //                     userImg: req.session.user.img0
        //                 });
        //             });
        //         });
        //     }).catch(function(err)
        //     {
        //         console.log(err);
        //         res.redirect('/');
        //     });
        // }).catch(function(err)
        //     {
        //         console.log(err);
        //         res.redirect('/');
        //     });
        });
    }
});

router.post('/updatePerso', function(req, res)
{
    var user_id = req.session.user.id;
    var validUsername = validator.isValidUsername(req.body.login);
    var validNomPrenom = validator.isValidNom(req.body.prenom, req.body.nom);
    var validPass = validator.isValidPass(req.body.mdp, req.body.mdp);
    var validMail = validator.isValidEmail(req.body.mail);
    console.log(req.body);

    if ( validUsername == true && validNomPrenom == true && validPass == true && validMail == true)
    {
        userModel.loginExists(req.body.login).then(loginExists => {

            if (loginExists == 0 || req.body.login == req.session.user.login)
            {
                var tab = [user_id, req.body.login, req.body.prenom, req.body.nom, req.body.mdp, req.body.mail];

                profileModel.updatePerso(tab).then(respuesta => {
                    if (respuesta)
                    {
                        //Actualizar la sesion
                        req.session.user.login = req.body.login;
                        req.session.user.prenom = req.body.prenom;
                        req.session.user.nom = req.body.nom;
                        req.session.user.mail = req.body.mail;
                        req.session.user.message = "Votre profil a été mis à jour";
                        console.log(req.session.user);
                    }
                    else
                        req.session.user.error = "Votre profil n'a pas été mis à jour";
                    res.redirect("/user/profile");
                }).catch(function(err)
                {
                    console.log(err);
                    res.redirect("/user/profile");
                });
            }
            else
            {
                req.session.user.error = "Le login n'est pas disponible";
                res.redirect("/profile");
            }
        }).catch(function(err)
        {
            console.log(err);
            res.redirect("/user/profile");
        });
        
    }
    else
    {
        if (validUsername != true)
            req.session.user.error = "Le login n'est pas valide";
        else if (validNomPrenom != true)
            req.session.user.error = "Le nom ou prénom n'est pas valide";
        else if (validPass != true)
            req.session.user.error = "Votre mot de passe doit avoir des chiffres, des lettres, un caractère special [@$!%*#?&] et au moins 8 caractères";
        else if (validMail != true)
            req.session.user.error = "Le mail n'est pas valide";
        res.redirect('/profile');
        // console.log(req.body);
        // userModel.getUserById(user_id).then(result => {
        //     delete result.passwd;
        //     delete result.cle;
        //     //console.log(result);
        //     tagModel.getTags(user_id).then( tagsTab => {//cambiar id de usuario
        //         console.log(tagsTab);
        //         notifModel.getNotifs(req.session.user.id).then(notif => {
        //             res.render('pages/profileUpdate', {
        //                 title: "Profil de " + result.prenom, //cambiar por el login
        //                 message: "",
        //                 error: "Vérifier les champs",
        //                 login: result.login,
        //                 tabuser: result,
        //                 tabTags: tagsTab,
        //                 notif: notif,
        //                 userImg: req.session.user.img0
        //             });
        //         });
                
        //     }).catch(function(err)
        //     {
        //         console.log(err);
        //         //res.redirect('/');
        //     });
        // }).catch(function(err)
        //     {
        //         console.log(err);
        //         //res.redirect('/pages/profileUpdate');
        //     });
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
        console.log(files);

        if (files.img0.size > 0 && files.img0.type == 'image/png' || files.img0.type == 'image/jpeg')
            req.session.user.img0 = "/img/user/" + req.session.user.login + "/" + files.img0.name;

        profileModel.updateImg(user_id, user_login, folder, files).then(result => {
            Promise.all(result).then(values =>
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
        }
        else
            req.session.user.error = "Le format des tags n'est pas valide";
        
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
    else
    {
        req.session.user.error = "Le tag n'est pas valide";
        res.redirect('/profile');
    }
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
            var event = new Date(result.visite);
            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

            result.visite = event.toLocaleDateString('fr-FR', options);
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
                res.redirect('/');
            });
        }
        else
            res.redirect('/user/profile');//hacer una mejor redirección
        
        
    }).catch(function(err)
    {
        console.log(err);
        res.redirect('/');
    });
});

router.post('/setLoc', function(req, res)
{
    var address = req.body.address;

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
        res.send({address: "L'address n'est pas valide", lat: "undefined", lon: "undefined"});
    });
});

router.get('/like/:login', function(req, res)
{
    var user_id = req.session.user.id;
    var username = req.params.login;

    userModel.getIdUser(username).then(result => {
        if (result && user_id != result.id && result.img0 != "" && result.img0 != "/img/no-img.png")
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
                res.send({action: false});
            });
        }
        else
            res.send({action: false});
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

router.post('/report', function(req, res)
{
    const login = escapeHtml(req.body.login);
    userModel.getIdUser(login).then(loginOk => {
        if (loginOk)
        {
            if (req.body.report == "faux")
            {
                profileModel.reportFauxExists(req.session.user.id, loginOk.id).then(fauxExists => {
                    if (fauxExists)
                    {
                        res.send(false);
                    }
                    else
                    {
                        profileModel.addReportFaux(req.session.user.id, loginOk.id).then(fauxadded => {
                            if (fauxadded)
                                res.send(true);
                            else
                                res.send(false);
                        });
                    }
                }).catch(function(err)
                {
                    console.log(err);
                    res.send(false);
                });
            }
            else if (req.body.report == "block")
            {
                profileModel.reportBlockExists(req.session.user.id, loginOk.id).then(blockExists => {
                    if (blockExists)
                    {
                        res.send(false);
                    }
                    else
                    {
                        profileModel.addReportBlock(req.session.user.id, loginOk.id).then(blockadded => {
                            likesModel.suprimeLike(req.session.user.id, loginOk.id).then(removeOk => {
                                if (blockadded)
                                    res.send(true);
                                else
                                    res.send(false);
                            }).catch(function(err)
                            {
                                console.log(err);
                                res.send(false);
                            });
                        }).catch(function(err)
                        {
                            console.log(err);
                            res.send(false);
                        });
                    }
                }).catch(function(err)
                {
                    console.log(err);
                    res.send(false);
                });
            }
        }
        else
            res.send(false);
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

router.get('/map', function(req, res)
{
    userModel.getUserById(req.session.user.id).then(user => {
        if (user)
        {
            if(user.lat && user.lon)
            {
                res.send({key: 'pk.917b163c0e500ff60c7679805ad6b270', lat: user.lat, lon: user.lon});
            }
            else
                res.send(false);
        }
        else
            res.send(false);
    });
});

router.get('/', function(req, res)
{
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;

    if(req.session.user.message)
    {
        message = req.session.user.message;
        req.session.user.message = null;
    }
    if (req.session.user.error)
    {
        error = req.session.user.error;
        req.session.user.error = null;
    }
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
                        console.log(result);
                        tagModel.getTags(user_id).then( tagsTab => {
                            console.log(tagsTab);
                            notifModel.getNotifs(req.session.user.id).then(notif => {
                                res.render('pages/profileUpdate', {
                                    title: "Profil de " + result.prenom,
                                    message: message,
                                    error: error,
                                    login: user_login,
                                    tabuser: result,
                                    tabTags: tagsTab,
                                    notif: notif,
                                    userImg: req.session.user.img0
                                });
                                message = false;
                                error = false;
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