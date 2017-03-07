import express from 'express';
import passport from 'passport';
import passportLocal from 'passport-local';
import logger from 'winston';
import rs from './requeststrategy';
import config from '../../config';
import realmModel from '../models/realm';
import loginManager from '../managers/loginmanager';
import accountModel from '../models/account';

export default function() {
    ////////////////////////////////////////////////////////////////////////////////
    // Init passport local strategy
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

    if (config.subscription) {
        router.post('/signup', rs.mustSessionLessArea, loginManager.signup);
    }

    router.post('/login', rs.mustSessionLessArea, config.demomode ? loginManager.loginDemo : loginManager.login);

    router.get('/logout', (req, res) => {
        req.logout();
        req.session = null;
        logger.info('Logout and redirect to /');
        res.redirect('/');
    });

    return router;
}
