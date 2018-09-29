

const session = {
    isOkLogin: function(req, res, next) {
        if (req.session && req.session.user)
            return next();
        res.redirect('/user/login');
    },
    isOkSignup: function(req, res, next) {
        if (req.session && req.session.user)
            return next();
        res.redirect('/');
    }
};

module.exports = session;