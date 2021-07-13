const express = require('express');
const logger = require('winston');
const apiV1 = require('./api');
const auth = require('./auth');
const page = require('./page');
const pages = require('../pages');

function _shouldBeLogged(req, res, next) {
  if (!req.session || !req.user) {
    return res.sendStatus(401);
  }
  next();
}

function _shouldBeLoggedThenRedirect(req, res, next) {
  if (!req.session || !req.user) {
    logger.info('redirect to /signin');
    return res.redirect('/signin');
  }
  next();
}

function _shouldNotBeLoggedThenRedirect(req, res, next) {
  if (req.session && req.user) {
    // TODO remove harcoded page dashboard
    logger.info('redirect to /dashboard');
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = [
  // control route access
  () =>
    pages.restrictedList.reduce((router, pageDesc) => {
      const path = `/${pageDesc.id}${pageDesc.params || ''}`;
      router.use(path, _shouldBeLoggedThenRedirect);
      if (pageDesc.supportView) {
        router.use(`/view${path}`, _shouldBeLogged);
      }
      return router;
    }, express.Router()),
  () =>
    pages.publicList.reduce((router, pageDesc) => {
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
  apiV1,
  page,
];
