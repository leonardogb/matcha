var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fse = require('fs-extra');
var path = require('path');
//var iplocation = require('iplocation')
var userModel = require('../models/userM');
var profileModel = require('../models/profileM');
var tagModel = require('../models/tagsM');
var likesModel = require('../models/likesM');
var visitsModel = require('../models/visitsM');
var validator = require('../middleware/validator');
var sessionOk = require('../middleware/session').isOkLogin;


router.use(sessionOk);

router.post('/update', function(req, res)
{
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;
    var update = validator.isValidUpdate(req.body);

    if (update != true)
    {
        console.log(req.body);
        userModel.getUserById(id_user).then(result => {
            delete result.passwd;
            delete result.cle;
            console.log(result);
            tagModel.getTags(id_user).then( tagsTab => {
                console.log(tagsTab);
                res.render('pages/profileUpdate', {
                    title: "Profil de " + result.prenom,
                    message: "",
                    error: update,
                    login: user_login,
                    tabuser: result,
                    tabTags: tagsTab
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
                res.render('pages/profile', {
                    title: "Profil de " + result.prenom,
                    message: respuesta,
                    error: "",
                    login: user_login,
                    tabuser: result,
                    tabTags: tagsTab
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
                res.render('pages/profileUpdate', {
                    title: "Profil de " + result.prenom, //cambiar por el login
                    message: "",
                    error: "Vérifier les champs",
                    login: result.login,
                    tabuser: result,
                    tabTags: tagsTab
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
                        Promise.all(datos).then(resultado => {
                            //console.log(resultado);
                            res.render('pages/profile-autre', {
                                title: "Profil de " + result.prenom,
                                message: "",
                                error: "",
                                login: user_login,
                                tabuser: result,
                                tabTags: tagsTab,
                                datos: resultado,
                                userImg: userImg
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
                        if (results)
                            res.send("added");
                    }).catch(function(err)
                    {
                        console.log(err);
                    });
                }
                else if (resultado == 1)
                {
                    likesModel.suprimeLike(user_id, result.id).then(results => {
                        if (results)
                            res.send("removed");
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
        res.render('pages/profileslike', {
            title: "I like you!",
            message: "",
            error: "",
            login: user_login,
            miniProfil: result
        });
    });
});

router.get('/vues', function(req, res)
{
    var user_login = req.session.user.login;

    profileModel.getProfileVues(user_login).then(result => {
        console.log(result);
        res.render('pages/vues', {
            title: "I visit you!",
            message: "",
            error: "",
            login: user_login,
            miniProfil: result
        });
    });
});

router.get('/', function(req, res)
{
    var user_id = req.session.user.id;
    var user_login = req.session.user.login;

    userModel.getUserById(user_id).then(result => {
        delete result.passwd;
        delete result.cle;
        //console.log(result);
        tagModel.getTags(user_id).then( tagsTab => {
            console.log(tagsTab);
            res.render('pages/profileUpdate', {
                title: "Profil de " + result.prenom,
                message: "",
                error: "",
                login: user_login,
                tabuser: result,
                tabTags: tagsTab
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
});


module.exports = router;