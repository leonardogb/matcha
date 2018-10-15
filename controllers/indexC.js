var express = require('express');
var router = express.Router();
var notifModel = require('../models/notifM');

router.get('/', function(req, res)
{
    if (req.session && req.session.user)
    {
        console.log('sesion iniciada');
        console.log(req.session.user);
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
