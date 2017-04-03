import express from 'express';
import passport from 'passport';
import passportLocal from 'passport-local';
import logger from 'winston';
import {defaultLoggedView} from './page';
import config from '../../config';
import loginManager from '../managers/loginmanager';

export default function() {
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
        router.post('/signedin', (req, res) => {
            res.redirect('/login');
        });
    }

    if (config.demomode) {
        router.get('/login', loginManager.loginDemo);
    } else {
        router.post('/login', loginManager.login);
    }

    router.all('/loggedin', (req, res) => {
        res.redirect(`/page/${defaultLoggedView}`);
    });

    router.get('/logout', (req, res) => {
        logger.info('Logout and redirect to /');
        req.logout();
        req.session = null;
        res.redirect('/');
    });

    return router;
}
