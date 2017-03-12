import express from 'express';
import logger from 'winston';
import api from './api';
import auth from './auth';
import page, {defaultAdminView} from './page';


function _shouldBeLogged(req, res, next) {
    if (!req.session || !req.user) {
        res.sendStatus(401);
        return;
    }
    next();
}

function _shouldBeLoggedThenRedirect(req, res, next) {
    if (!req.session || !req.user) {
        logger.info('redirect to /login');
        res.redirect('/login');
        return;
    }
    next();
}

function _shouldNotBeLoggedThenRedirect(req, res, next) {
    if (req.session && req.user) {
        logger.info(`redirect to /page/${defaultAdminView}`);
        res.redirect(`/page/${defaultAdminView}`);
        return;
    }
    next();
}

export default [
    // control route access
    () => express.Router().use(/^\/api/, _shouldBeLogged),
    () => express.Router().use(/^\/view/, _shouldBeLogged),
    () => express.Router().use(/^\/page/, _shouldBeLoggedThenRedirect),
    () => express.Router().use(/^\/selectrealm/, _shouldBeLoggedThenRedirect),
    () => express.Router().use(/^\/loggedin/, _shouldBeLogged),
    () => express.Router().use(/^\/login/, _shouldNotBeLoggedThenRedirect),
    () => express.Router().use(/^\/signup/, _shouldNotBeLoggedThenRedirect),
    () => express.Router().use(/^\/signedin/, _shouldNotBeLoggedThenRedirect),
    // add routes
    auth,
    api,
    page
];
