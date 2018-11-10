const express = require('express');
const router = express.Router();
const uniqid = require('uniqid');
const request = require('request');
const bcrypt = require('bcrypt');
const notifModel = require('../models/notifM');
const userModel = require('../models/userM');
const tagModel = require('../models/tagsM');
const profileModel = require('../models/profileM');
const matchimetro = require('../models/matchM');
const tagsModel = require('../models/tagsM');
var error = false;
var message = false;


function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
  
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  router.get('/seed', function(req, res) {
      var i = 0;

    if(req.session && req.session.user && req.session.user.id == 1)
    {
        request('https://randomuser.me/api/?nat=fr&inc=login,name,email,gender,dob,picture,location,registered&results=5', { json: true }, (err, respuesta, body) => {
            if (err) console.log(err);
            body.results.forEach(user => {
                var tabuser = [];
                var orientations = ["Bisexuel", "Homosexuel", "Hétérosexuel"];
                var sexe = null;
                var orientation = orientations[Math.floor(Math.random()*orientations.length)];

                if (user.gender == "female")
                    sexe = "Féminin";
                else
                    sexe = "Masculin";

                tabuser.push(user.login.username, user.name.first, user.name.last, bcrypt.hashSync(user.login.password, 10),
                user.email, 1, sexe, user.dob.age, orientation,
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dictum gravida felis, mattis vestibulum nunc elementum ut. Quisque justo purus, interdum quis consequat quis, posuere a erat.",
                user.picture.large, user.location.city, user.location.coordinates.latitude, user.location.coordinates.longitude,
                user.location.city, Math.floor(Math.random() * 500), 1, user.registered.date);
                userModel.insertNewUser(tabuser).then(userAdded => {
                    if (userAdded)
                    {
                        console.log(tabuser[0] + " added to database");
                        userModel.getIdUser(tabuser[0]).then(user1 => {
                            if (user1)
                            {
                                tagsModel.getNbTags().then(nbTags => {
                                    if (nbTags)
                                    {
                                        tagsModel.addUserTag(user1.id, Math.floor(Math.random() * nbTags));
                                        tagsModel.addUserTag(user1.id, Math.floor(Math.random() * nbTags));
                                        tagsModel.addUserTag(user1.id, Math.floor(Math.random() * nbTags));
                                    }
                                });
                            }
                        });
                    }
                });

            });
        });
    }
    res.redirect('/');
  });

router.post('/recup', function(req, res)
{
    const mail = escapeHtml(req.body.mail);

    userModel.emailExists(mail).then(mailOk => {
        if (mailOk)
        {
            userModel.reinitMDP(mail).then(MdpTemp => {
                if (MdpTemp)
                {
                    userModel.sendMailMdp(mail, MdpTemp).then(ok => {
                        if (ok)
                        {
                            console.log("Message envoyé !");
                            message = 'Votre mot de passe a été réinitialisé. Vérifier votre mél.';
                        }
                    });
                }
            });
        }
        else
            error = 'Votre mot de passe ne peut pas être réinitialisé. Merci d\'essayer plus tard.';
        res.render('pages/login', {title: 'Login Matcha !', message: message, error: error});
        message = false;
        error = false;
    });
});

router.get('/', function(req, res)
{
    if (req.session && req.session.user)
    {
        // console.log('sesion iniciada');
        // console.log(req.session.user);
        
        userModel.getUserById(req.session.user.id).then( user1 => {
            if (user1 && user1.complet == 1)
            {
                var sex;
                if (user1.genre == "Masculin")
                {
                    if (user1.orientation == "Hétérosexuel")
                        sex = "Féminin";
                    else if (user1.orientation == "Homosexuel")
                        sex = "Masculin";
                    else
                        sex = "Autre";
                }
                else if (user1.genre == "Féminin")
                {
                    if (user1.orientation == "Hétérosexuel")
                        sex = "Masculin";
                    else if (user1.orientation == "Homosexuel")
                        sex = "Féminin";
                    else
                        sex = "Autre";
                }
                userModel.getUserBySex(user1.id, sex, user1.orientation, user1.genre).then(userTab => {
                    // console.log("Perfiles:");
                    // console.log(userTab);
                    var usuarios = [];
                    var i = 0;
                    userTab.forEach(element => {
                        delete element.passwd;
                        delete element.cle;
                        delete element.mail;
                        const puntos = [];
                        puntos.push(matchimetro.getPtsDistance(user1.lat, user1.lon, element.lat, element.lon));
                        puntos.push(matchimetro.getPtsTags(user1.id, element.id));
                        puntos.push(matchimetro.getPtsPopul(element.popularite));
                        Promise.all(puntos).then(punts => {
                            // console.log("Puntos: ");
                            // console.log(punts);
                            profileModel.reportBlockExists(user1.id, element.id).then(bloqueado => {
                                if (!bloqueado)
                                {
                                    var total = 0;
                                    punts.forEach(elem => {
                                        total = total + elem;
                                    });
                                    total = parseInt(total, 10);
                                    usuarios.push([total, element]);
                                }
                                if (++i == userTab.length)
                                {
                                    // console.log("Usuarios:");
                                    // console.log(usuarios);
                                    function compare(a, b) {
                                        if (a[0] > b[0])
                                        return -1;
                                        if (a[0] < b[0])
                                        return 1;
                                        // a doit être égal à b
                                        return 0;
                                    }
                                    usuarios.sort(compare);
                                    notifModel.getNotifs(req.session.user.id).then(notif => {
                                        //console.log(notif);
                                        res.render('pages/index', {
                                            title: 'Matcha !',
                                            login: req.session.user.login,
                                            userImg: req.session.user.img0,
                                            notif: notif,
                                            profil: usuarios
                                        });
                                    });
                                }
                            });
                            
                        });
                    });
                    // console.log("Usuarios:");
                    // console.log(usuarios);
                });
            }
            else
            {
                delete user1.passwd;
                delete user1.cle;
                error = "Vous devez completer votre profil.";
                //console.log(result);
                tagModel.getTags(user1.id).then( tagsTab => {
                    //console.log(tagsTab);
                    notifModel.getNotifs(req.session.user.id).then(notif => {
                        res.render('pages/profileUpdate', {
                            title: "Profil de " + user1.prenom,
                            message: message,
                            error: error,
                            login: user1.login,
                            tabuser: user1,
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
            }
        });
    }
    else
    {
        if (req.session)
        {
            if (req.session.message)
            {
                message = req.session.message;
                req.session.message = null;
            }
            if (req.session.error)
            {
                error = req.session.error;
                req.session.error = null;
            }
        }
        console.log('session no iniciada');
        res.render('pages/signup', { title: 'Signup Matcha !', message: message, error: error });
        message = false;
        error = false;
    }
        
});

module.exports = router;
