'use strict';

import express from 'express';
import logger from 'winston';
import config from '../../config';

export const defaultLoggedView = 'dashboard';
const adminViews = [
    'accounting',
    'dashboard',
    'occupant',
    'owner',
    'property',
    'rent',
    'selectrealm',
];

function buildModel(view, req) {
    return {
        config,
        view,
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
        router.get('/signup', (req, res) => {
            renderPage('signup', req, res);
        });
    }

    if (!config.demomode) {
        router.get('/login', (req, res) => {
            renderPage('login', req, res);
        });
    }

    router.get('/selectrealm', (req, res) => {
        renderPage('selectrealm', req, res);
    });

    router.get('/view/:view', (req, res) => {
        const view = req.params.view;
        if (adminViews.indexOf(view) === -1) {
            res.redirect(`/page/${defaultLoggedView}`);
            logger.info(`View ${view} is not valid. Redirecting to /page/${defaultLoggedView}`);
            return;
        }
        renderView(view, req, res);
    });

    router.get('/page/:view?', (req, res) => {
        const view = req.params.view;
        if (adminViews.indexOf(view) === -1) {
            res.redirect(`/page/${defaultLoggedView}`);
            logger.info(`View ${view} is not valid. Redirecting to /page/${defaultLoggedView}`);
            return;
        }
        renderPage(view, req, res);
    });

    router.get('/', (req, res) => renderPage('website', req, res));

    return router;
}
