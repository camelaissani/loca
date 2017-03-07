'use strict';

import logger from 'winston';

function mustSessionLessArea(req, res, next) {
    if (req.session && req.user) {
        logger.info('redirect to /index');
        res.redirect('/index');
    } else {
        next();
    }
}

function restrictedArea(req, res, next) {
    if (!req.session || !req.user) {
        res.sendStatus(401);
    } else {
        next();
    }
}

function restrictedAreaAndRedirect(req, res, next) {
    if (!req.session || !req.user) {
        res.redirect('/login');
        logger.info('User not defined redirect to /login');
    } else {
        next();
    }
}

function mustRealmSetAndRedirect(req, res, next) {
    if (!req.session || !req.user || !req.realm) {
        res.redirect('/selectrealm');
        logger.info('Realm not defined redirect to /selectrealm');
    } else {
        next();
    }
}

function mustRealmSet(req, res, next) {
    if (!req.session || !req.user || !req.realm) {
        res.sendStatus(401);
    } else {
        next();
    }
}

export default {
    mustSessionLessArea,
    restrictedArea,
    restrictedAreaAndRedirect,
    mustRealmSetAndRedirect,
    mustRealmSet
};
