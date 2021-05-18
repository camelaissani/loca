'use strict';
const path = require('path');
const express = require('express');
const request = require('supertest');

module.exports = function (router, { httpMethod, uri }, viewEngineStub) {
  const app = express();

  if (viewEngineStub) {
    viewEngineStub.callsArgWith(2, '');
    app.engine('ejs', viewEngineStub);
    app.set('views', path.join(__dirname, '..', 'backend', 'pages'));
    app.set('view engine', 'ejs');
  }
  app.use((req, res, next) => {
    // to bypass login
    req.session = {};
    req.user = {};
    next();
  });
  app.use(router);

  return request(app)[httpMethod](uri);
};
