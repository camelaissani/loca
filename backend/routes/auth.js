const express = require('express');
const passport = require('passport');
const passportLocal = require('passport-local');
const logger = require('winston');
const config = require('../../config');
const loginManager = require('../managers/loginmanager');

module.exports = function() {
    ////////////////////////////////////////////////////////////////////////////////
    // Set up passport
    ////////////////////////////////////////////////////////////////////////////////
    passport.use(new passportLocal.Strategy({
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

    passport.serializeUser((user, done) => done(null, user.email));
    passport.deserializeUser(loginManager.getUserByEmail);

    ////////////////////////////////////////////////////////////////////////////////
    // Session routes
    ////////////////////////////////////////////////////////////////////////////////
    const router = express.Router();
    router.use(loginManager.updateRequestWithRealmsOfUser);

    if (config.subscription) {
        router.post('/signup', loginManager.signup);
        router.post('/signedup', (req, res) => {
            res.redirect('/signin');
        });
    }

    if (config.demomode) {
        router.get('/signin', loginManager.loginDemo);
    } else {
        router.post('/signin', loginManager.login);
    }

    router.all('/signedin', (req, res) => {
        // TODO remove harcoded page dashboard
        res.redirect('/dashboard');
    });

    router.get('/signout', (req, res) => {
        logger.info('sign out and redirect to /');
        req.session.destroy(() => res.redirect('/'));
    });

    return router;
};
