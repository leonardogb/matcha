
var express = require('express');
var router = express.Router();

router.get('/', function(req, res)
{
    // res.render('pages/chat', {
    //     title: 'Chat'
    // });
    res.send("<div>Hola</div>");
});

module.exports = router;