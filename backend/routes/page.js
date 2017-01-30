'use strict';

const express = require('express');
const logger = require('winston');
const render = require('../render');
const rs = require('./requeststrategy');

const defaultAdminView = 'dashboard';

const adminViews = [
    // 'account',
    'accounting',
    'dashboard',
    'occupant',
    'owner',
    'property',
    'rent',
    'website'
];

const restrictedWithRealmSetRouter = express.Router();
restrictedWithRealmSetRouter.use(rs.restrictedArea);
restrictedWithRealmSetRouter.use(rs.mustRealmSet);

restrictedWithRealmSetRouter.route('/dashboard').get(function(req, res) {
    res.render('dashboard/index', {
        user: req.user
    });
});

restrictedWithRealmSetRouter.route('/rent').get(function(req, res) {
    res.render('rent/index');
});

restrictedWithRealmSetRouter.route('/occupant').get(function(req, res) {
    res.render('occupant/index');
});

restrictedWithRealmSetRouter.route('/accounting').get(function(req, res) {
    res.render('accounting/index');
});

restrictedWithRealmSetRouter.route('/property').get(function(req, res) {
    res.render('property/index');
});

restrictedWithRealmSetRouter.route('/owner').get(function(req, res) {
    res.render('owner/index');
});

restrictedWithRealmSetRouter.route('/account').get(function(req, res) {
    res.render('account/index');
});

const router = express.Router();

router.route('/selectrealm').get(rs.restrictedAreaAndRedirect, function(req, res) {
    render('selectrealm', req, res);
});

router.route('/index').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
    if (!req.query.view || adminViews.indexOf(req.query.view) === -1) {
        res.redirect(`/index?view=${defaultAdminView}`);
        logger.info(`View ${req.query.view} is not valid. Redirecting to /index?view=${defaultAdminView}`);
        return;
    }
    render(req.query.view, req, res);
});

router.use('/page', restrictedWithRealmSetRouter);

module.exports = router;
