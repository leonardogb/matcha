var express = require('express');
//var session = require('express-session');
var router = express.Router();
var userModel = require('../models/userM');
var tagModel = require('../models/tagsM');
var likesModel = require('../models/likesM');
var visitsModel = require('../models/visitsM');
var notifModel = require('../models/notifM');
//var profileModel = require('../models/profileM');
var validator = require('../middleware/validator');
var sessionOk = require('../middleware/session').isOkLogin;


router.get('/activation/:login/:cle', function(req, res)
{
    var login = req.params.login;
    var cle = req.params.cle;

    userModel.userActivation(login, cle).then(result => {
        if (result == true)
        {
            res.redirect('/user/login');
        }
        else
        {
            res.render('pages/signup', {title: 'Signup Matcha !', message: '', error: 'Votre lien d\'activation n\'est pas valide.'});
        }
            
    }).catch(function(error)
    {
        console.log("Error: ", error);
        res.render('pages/signup', {title: 'Signup Matcha !', message: '', error: error});
    });

});

router.get('/login', function(req, res)
{
    if (!req.session.user)
        res.render('pages/login', {title: 'Login Matcha !', message: '', error: ''});
    else
        res.redirect('/');
});

router.post('/login', function(req, res)
{
    if (!req.session.user)
    {
        //validar datos?
        userModel.auth(req.body.login, req.body.passwd).then(result => {
            console.log(result);
            var sesion = {id: result.id, login: result.login, prenom: result.prenom, nom: result.nom, mail: result.mail, img0: result.img0};

            req.session.user = sesion;
            res.redirect('/');

        }).catch(function(error)
        {
            console.log("Error: ", error);
            res.render('pages/login', {title: 'Login Matcha !', message: '', error: error});
        });

    }
    else
        res.redirect('/');
    
    
});

router.post('/addUser', function(req, res)
{
    if (!req.session.user)
    {
        var username = validator.isValidUsername(req.body.login);
        if (username != true)
        {
            res.render('pages/signup', { title: 'Signup Matcha !', message: "", error: username });
        }
        else
        {
            const yo = userModel.loginExists(req.body.login);
            yo.then(result => {
                if (result == 0)
                {
                    var mail = validator.isValidEmail(req.body.email);

                    if (mail != true)
                    {
                        res.render('pages/signup', { title: 'Signup Matcha !', message: "", error: mail });
                    }
                    else
                    {
                        userModel.emailExists(req.body.email)
                        .then(result => {
                            if (result == 0)
                            {
                                var contrasena = validator.isValidPass(req.body.passwd1, req.body.passwd2);

                                if (contrasena != true)
                                {
                                    res.render('pages/signup', { title: 'Signup Matcha !', message: "", error: contrasena });
                                }
                                else
                                {
                                    var nompre = validator.isValidNom(req.body.nombre, req.body.apellido);

                                    if (nompre != true)
                                    {
                                        res.render('pages/signup', { title: 'Signup Matcha !', message: "", error: nompre });
                                    }
                                    else
                                    {
                                        console.log(req.body);
                                        var addUser = userModel.addUser(req.body);
                                        addUser.then(result => {
                                            if (result == 1)
                                            {
                                                res.render('pages/signup', { title: 'Signup Matcha !', message: "Thank you for signing up. Please check your email to activate your account.", error: "" });
                                            }
                                            else
                                                throw "No se ha podido añadir el usuario a la base de datos";
                                        })
                                        .catch(function(error)
                                        {
                                            console.log("Error: ", error);
                                            res.render('pages/signup', { title: 'Signup Matcha !', message: "", error: "" });
                                        });
                                    }
                                }
                                
                            }
                            else
                            {
                                res.render('pages/signup', { title: 'Signup Matcha !', message: "", error: "User alredy exists" });
                            }
                        })
                        .catch(function(error) {
                            console.log("Error: ", error);
                        });
                    }
                    
                }
                else
                {
                    res.render('pages/signup', { title: 'Signup Matcha !', message: "", error: "Username not available" });
                }
            })
            .catch(function(error) {
                console.log("Error: ", error);
            });
        }
        
    }
    else
    {
        res.redirect('/');
    }

});

router.use(sessionOk);

router.get('/profile', function(req, res)
{
    var id_user = req.session.user.id;
    var user = req.session.user.login;

    userModel.getUserById(id_user).then(result => {
        delete result.passwd;
        delete result.cle;
        //console.log(result);
        tagModel.getTags(id_user).then( tagsTab => {
            //console.log(tagsTab);
            var datos = [];
            datos.push(likesModel.getNbLikes(id_user));
            datos.push(visitsModel.getNbVisits(user));
            Promise.all(datos).then(datos => {
                notifModel.getNotifs(req.session.user.id).then(notif => {
                    res.render('pages/profile', {
                        title: "Profil de " + result.prenom,
                        message: "",
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
    })
    .catch(function(err)
    {
        console.log(err);
        //res.redirect('/');
    });
    
});

router.get('/logout', function(req, res)
{
    req.session.destroy(function(err)
    {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
    
});


/* GET home page. */
router.get('/', function(req, res)
{
    //si la sesión está iniciada
    res.render('pages/index', {title: 'Matcha !', login: 'Cambiame'});
});

module.exports = router;