const express = require('express');
const logger = require('winston');
const api = require('./api');
const auth = require('./auth');
const page = require('./page');
const pages = require('../pages');

function _shouldBeLogged(req, res, next) {
    if (!req.session || !req.user) {
        res.sendStatus(401);
        return;
    }
    next();
}

function _shouldBeLoggedThenRedirect(req, res, next) {
    if (!req.session || !req.user) {
        logger.info('redirect to /signin');
        res.redirect('/signin');
        return;
    }
    next();
}

function _shouldNotBeLoggedThenRedirect(req, res, next) {
    if (req.session && req.user) {
        // TODO remove harcoded page dashboard
        logger.info('redirect to /dashboard');
        res.redirect('/dashboard');
        return;
    }
    next();
}

module.exports = [
    // control route access
    () => express.Router().use(/^\/api/, _shouldBeLogged),
    () => pages.restrictedList.reduce((router, pageDesc) => {
        const path = `/${pageDesc.id}${pageDesc.params || ''}`;
        router.use(path, _shouldBeLoggedThenRedirect);
        if (pageDesc.supportView) {
            router.use(`/view${path}`, _shouldBeLogged);
        }
        return router;
    }, express.Router()),
    () => pages.publicList.reduce((router, pageDesc) => {
        const path = `/${pageDesc.id}${pageDesc.params || ''}`;
        router.use(path, _shouldNotBeLoggedThenRedirect);
        if (pageDesc.supportView) {
            router.use(`/view${path}`, _shouldNotBeLoggedThenRedirect);
        }
        return router;
    }, express.Router()),
    () => express.Router().use('/signedin', _shouldBeLogged),
    () => express.Router().use('/signedup', _shouldNotBeLoggedThenRedirect),
    () => express.Router().use('/signout', _shouldBeLogged),
    // add routes
    auth,
    api,
    page
];
