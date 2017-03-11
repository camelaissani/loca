'use strict';

import express from 'express';
import logger from 'winston';
import config from '../../config';
import rs from './requeststrategy';

const defaultAdminView = 'dashboard';
const adminViews = [
    'accounting',
    'dashboard',
    'occupant',
    'owner',
    'property',
    'rent',
    'selectrealm',
    'website'
];
const allViews = [
    ...adminViews,
    'login',
    'signup'
];

function buildModel(view, req) {
    return {
        config,
        view,
        isValidView: allViews.indexOf(view) !== -1,
        isLogged: req.user ? true : false,
        isRealmSelected: req.realm ? true : false,
        isDefaultRealmSelected: req.realm && req.realm.name === '__default_',
        isMultipleRealmsAvailable: req.realms && req.realms.length > 1,
        user: req.user,
        realm: req.realm,
        realms: req.realms,
        errors: null
    };
}

function renderPage(view, req, res) {
    const model = buildModel(view, req);
    res.render('index', model);
}

function renderView(view, req, res) {
    const model = buildModel(view, req);
    res.render(`${view}/index`, model);
}

export default function () {

    const router = express.Router();

    if (config.subscription) {
        router.get('/signup', rs.mustSessionLessArea, (req, res) => {
            renderPage('signup', req, res);
        });
        router.post('/signedin', rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, (req, res) => {
            res.redirect('/login');
        });
    }

    if (!config.demomode) {
        router.get('/login', rs.mustSessionLessArea, (req, res) => {
            renderPage('login', req, res);
        });
    }

    router.all('/loggedin', rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, (req, res) => {
        res.redirect(`/page/${defaultAdminView}`);
    });

    router.get('/selectrealm', rs.restrictedAreaAndRedirect, (req, res) => {
        renderPage('selectrealm', req, res);
    });

    router.get('/view/:view', rs.restrictedArea, rs.mustRealmSet, (req, res) => {
        const view = req.params.view;
        if (adminViews.indexOf(view) === -1) {
            res.redirect(`/page/${defaultAdminView}`);
            logger.info(`View ${view} is not valid. Redirecting to /page/${defaultAdminView}`);
            return;
        }
        renderView(view, req, res);
    });

    router.get('/page/:view?', rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, (req, res) => {
        const view = req.params.view;
        if (adminViews.indexOf(view) === -1) {
            res.redirect(`/page/${defaultAdminView}`);
            logger.info(`View ${view} is not valid. Redirecting to /page/${defaultAdminView}`);
            return;
        }
        renderPage(view, req, res);
    });

    router.get('/', (req, res) => renderPage('website', req, res));

    return router;
}
