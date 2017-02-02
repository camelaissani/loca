const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('../../config').default;
const rs = require('./requeststrategy');
const render = require('../render');
const realmModel = require('../models/realm');
const loginManager = require('../managers/loginmanager');
const accountModel = require('../models/account');

////////////////////////////////////////////////////////////////////////////////
// Init passport local strategy
////////////////////////////////////////////////////////////////////////////////
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'secretword'
},
(email, password, done) => {
    loginManager.authenticate(email, password, (err, user) => {
        if (err) {
            return done(null, false, {message: err});
        }
        return done(null, user);
    });
}));

////////////////////////////////////////////////////////////////////////////////
// Set user in current session
////////////////////////////////////////////////////////////////////////////////
passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser((email, done) => {
    accountModel.findOne(email, (err, user) => {
        if (err) {
            done(err);
            return;
        }
        done(err, user);
    });
});

////////////////////////////////////////////////////////////////////////////////
// Set realms in current session
////////////////////////////////////////////////////////////////////////////////
const router = express.Router();
router.use((req, res, next) => {
    if (req.user) {
        realmModel.findByEmail(req.user.email, (err, realms) => {
            if (err) {
                next(err);
                return;
            }
            req.realms = realms ? realms : [];
            next();
        });
        return;
    }
    delete req.realms;
    next();
});

router.use((req, res, next) => {
    if (req.session && req.session.realmId) {
        realmModel.findOne(req.session.realmId, (err, realm) => {
            if (err) {
                next(err);
                return;
            }
            req.realm = realm;
            next();
        });
        return;
    }
    if (req.realms && req.realms.length === 1) {
        req.realm = req.realms[0];
        next();
        return;
    }
    delete req.realm;
    next();
});

////////////////////////////////////////////////////////////////////////////////
// login/signup
////////////////////////////////////////////////////////////////////////////////
if (config.subscription) {
    router.post('/signup', loginManager.signup);
    router.get('/signup', rs.mustSessionLessArea, function(req, res) {
        render('signup', req, res);
    });
    router.post('/signedin', rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        res.redirect('/login');
    });
}
if (!config.demomode) {
    router.post('/login', loginManager.login);
    router.get('/login', rs.mustSessionLessArea, function(req, res) {
        render('login', req, res);
    });
} else {
    router.get('/login', rs.mustSessionLessArea, loginManager.loginDemo);
}

router.all('/loggedin', rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
    res.redirect('/index');
});

router.get('/logout', loginManager.logout);

module.exports = router;
