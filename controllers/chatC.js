
var express = require('express');
var router = express.Router();

router.get('/', function(req, res)
{
    res.render('pages/chat', {
        title: 'Chat'
    });
});

module.exports = router;