'use strict';

var logger = require('winston');

function RequestStrategy() {}

RequestStrategy.prototype.mustSessionLessArea = function (req, res, next) {
    if ((req.session && req.session.user && req.session.user)) {
        res.redirect('/index');
        logger.info('redirect to /index');
    } else {
        next();
    }
};

RequestStrategy.prototype.restrictedArea = function (req, res, next) {
    if (!req.session || !req.session.user || !req.session.user) {
        res.send(401);
    } else {
        next();
    }
};

RequestStrategy.prototype.restrictedAreaAndRedirect = function (req, res, next) {
    if (!req.session || !req.session.user || !req.session.user) {
        res.redirect('/login');
        logger.info('User not defined redirect to /login');
    } else {
        next();
    }
};

RequestStrategy.prototype.mustRealmSetAndRedirect = function (req, res, next) {
    if (!req.session || !req.session.user || !req.session.user.realm) {
        res.redirect('/selectrealm');
        logger.info('Realm not defined redirect to /selectrealm');
    } else {
        next();
    }
};

RequestStrategy.prototype.mustRealmSet = function (req, res, next) {
    if (!req.session || !req.session.user || !req.session.user.realm) {
        res.send(401);
    } else {
        next();
    }
};

module.exports = new RequestStrategy();