var express = require('express');
var router = express.Router();
var notifModel = require('../models/notifM');
var userModel = require('../models/userM');
const matchimetro = require('../models/matchM');

router.get('/', function(req, res)
{
    if (req.session && req.session.user)
    {
        console.log('sesion iniciada');
        console.log(req.session.user);
        userModel.getUserById(req.session.user.id).then( user1 => {
            if (user1)
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

                userModel.getUserBySex(sex).then(userTab => {
                    console.log("Perfiles:");
                    console.log(userTab);
                    userTab.forEach(element => {
                        const puntos = [];
                        puntos.push(matchimetro.getPtsDistance(user1.lat, user1.lon, element.lat, element.lon))
                        Promise.all(puntos).then(punts => {
                            console.log(punts);
                        });
                        
                    });
                });
            }
            
        });
        notifModel.getNotifs(req.session.user.id).then(notif => {
            console.log(notif);
            res.render('pages/index', {
                title: 'Matcha !',
                login: req.session.user.login,
                notif: notif
            });
        });
        
    }
    else
    {
        console.log('session no iniciada');
        res.render('pages/signup', { title: 'Signup Matcha !', message: '', error: '' });
    }
        
});

module.exports = router;
