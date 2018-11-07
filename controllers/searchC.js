var express = require('express');
var router = express.Router();
var userModel = require('../models/userM');
var matchimetro = require('../models/matchM');
var tagsModel = require('../models/tagsM');
var sessionOk = require('../middleware/session').isOkLogin;

router.use(sessionOk);

function isValidAge(ageMin, ageMax)
{
    if (ageMin.length != 0 && ageMin != "" && ageMax.length != 0 && ageMax != "")
    {
        if (/^[0-9]+$/g.test(ageMin) && /^[0-9]+$/g.test(ageMax))
        {
            if (ageMin >= 18 && ageMin <= 99 && ageMax >= 18 && ageMax <= 99)
            {
                if (ageMin <= ageMax)
                    return {ageMin: ageMin, ageMax: ageMax};
                else
                    return {ageMin: ageMax, ageMax: ageMin}
            }
        }
    }
    return (false);
}

function isValidPopul(populMin, populMax)
{
    if (populMin.length != 0 && populMin != "" && populMax.length != 0 && populMax != "")
    {
        if (/^[0-9]+$/g.test(populMin) && /^[0-9]+$/g.test(populMax))
        {
            if (populMin >= 0 && populMin <= 9999 && populMax >= 0 && populMax <= 9999)
            {
                if (populMin <= populMax)
                    return {populMin: populMin, populMax: populMax};
                else
                    return {populMin: populMax, populMax: populMin}
            }
        }
    }
    return (false);
}

function isValidTag(tag)
{
    var tags = tag.split(',');
    var error = [];

    tags.forEach(element => {
        if (element.length == 0 || element == "")
            error.push("Le tag n\'est peut pas être vide");
        if (!/^[a-zA-Z0-9 ]+$/g.test(element))
            error.push("Le format du tag n\'est pas valide");
        if (element.length > 20 || element.length < 0)
            error.push("Le tag doit avoir moins de 20 caractères");
    });
    
    return ( (error.length > 0 ? false : tags) );
  }

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

function compareMatch(a, b) {
    if (a[0] > b[0])
       return -1;
    if (a[0] < b[0])
       return 1;
    // a doit être égal à b
    return 0;
}

function compareTags(a, b) {
    if (a[2] > b[2])
       return -1;
    if (a[2] < b[2])
       return 1;
    // a doit être égal à b
    return 0;
}

router.post('/', function(req, res)
{
    //console.log(req.body);
    if (req.session && req.session.user)
    {
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
                var age = isValidAge(req.body.ageMin, req.body.ageMax);
                var popul = isValidPopul(req.body.populMin, req.body.populMax);
                var location = escapeHtml(req.body.location);
                var tags = isValidTag(req.body.tags);
                var tri;

                if (req.body.tri == "age" || req.body.tri == "location" || req.body.tri == "popularite" || req.body.tri == "tags")
                    tri = req.body.tri;
                else
                    tri = "default";
                if (age && popul)
                {
                    userModel.getUsersLimits(user1.id, sex, user1.orientation, age, popul, tri).then(userTab => {
                        //console.log(userTab);
                        var usuarios = [];
                        var i = 0;

                        userTab.forEach(element => {
                            delete element.active;
                            delete element.passwd;
                            delete element.cle;
                            delete element.mail;
                            delete element.img1;
                            delete element.img2;
                            delete element.img3;
                            delete element.img4;
                            delete element.ville;
                            delete element.complet;
                            delete element.visite;
                            const puntos = [];
                            puntos.push(matchimetro.getPtsDistance(user1.lat, user1.lon, element.lat, element.lon));
                            puntos.push(matchimetro.getPtsTags(user1.id, element.id));
                            puntos.push(matchimetro.getPtsPopul(element.popularite));
                            puntos.push(tagsModel.getTags(element.id));
                            Promise.all(puntos).then(punts => {
                                // console.log("Puntos: ");
                                // console.log(punts);
                                var total = 0;
                                total = punts[0] + punts[1] + punts[2];
                                total = parseInt(total, 10);

                                if (location.length != 0 || location != "")
                                {
                                    if (location == element.location)
                                        usuarios.push([total, element]);
                                }
                                if (tags)
                                {
                                    tags.forEach(ele => {
                                        punts[3].forEach(el => {
                                            if (ele == el)
                                                usuarios.push([total, element, punts[1]]);
                                        });
                                    });
                                }
                                if (location.length == 0 && location == "" && !tags)
                                    usuarios.push([total, element]);
                                
                                if (++i == userTab.length)
                                {
                                    if (tri == "default")
                                        usuarios.sort(compareMatch);
                                    else if (tri == "tags")
                                        usuarios.sort(compareTags);
                                    res.send(usuarios);
                                }
                            });
                        });
                        //res.send("Bien...");
                    });
                }
            }
        });
    }
});

module.exports = router;