var express = require('express');
var router = express.Router();

router.get('/', function(req, res)
{
    if (req.session && req.session.user)
    {
        console.log('sesion iniciada');
        console.log(req.session.user);
        res.render('pages/index', {title: 'Matcha !', login: req.session.user.login});
    }
    else
    {
        console.log('session no iniciada');
        res.render('pages/signup', { title: 'Signup Matcha !', message: '', error: '' });
    }
        
});

module.exports = router;
