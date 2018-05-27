'use strict';

const path = require('path');
const express = require('express');
const config = require('../../config');
const pages = require('../pages');

function buildModel(pageId, req, callback) {
    req.model = {
        config,
        view: pageId,
        isLogged: req.user ? true : false,
        isRealmSelected: req.realm ? true : false,
        isDefaultRealmSelected: req.realm && req.realm.name === '__default_',
        isMultipleRealmsAvailable: req.realms && req.realms.length > 1,
        user: req.user,
        realm: req.realm,
        realms: req.realms,
        errors: null
    };
    const modelFn = require(path.join('..', 'pages', pageId, 'model'));
    modelFn(req, callback);
}

function renderPage(pageId, req, res, pageWithHeaders=true) {
    const page = pageWithHeaders ? 'index' : `${pageId}/view/index`;
    res.render(page, req.model);
}

module.exports = function () {
    const router = express.Router();

    pages.list.forEach(page => {
        const params = page.params || '';
        const path = page.id === 'website' ? params || '/' : `/${page.id}${params}`;
        router.get(path, (req, res) => {
            buildModel(page.id, req, () => renderPage(page.id, req, res, page.supportView));
        });
        if (page.supportView) {
            router.get(`/view/${page.id}${params}`, (req, res) => {
                buildModel(page.id, req, () => renderPage(page.id, req, res, false));
            });
        }
    });

    return router;
};