'use strict';

var express = require('express'),
    request = require('supertest'),
    assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    mocks = require('./mocks');

describe('api', function () {

    it('test signup route', function (done) {
        var app = express();
        var router = express.Router();
        var mockedLoginManager = new mocks.LoginManager();
        var API = proxyquire('../server/api', {
            './managers/loginmanager': mockedLoginManager,
            '../config': { productive: true }
        });
        sinon.spy(mockedLoginManager, 'signup');
        app.use(router);
        API(router);
        
        request(app).post('/signup')
        .expect(200)
        .end(function(err, res) {
            assert(mockedLoginManager.signup.called);
            done();
        });
    });

    it('test login route', function (done) {
        var app = express();
        var router = express.Router();
        var mockedLoginManager = new mocks.LoginManager();
        var API = proxyquire('../server/api', {
            './managers/loginmanager': mockedLoginManager,
            '../config': { productive: true }
        });
        sinon.spy(mockedLoginManager, 'login');
        app.use(router);
        API(router);
        
        request(app).post('/login')
        .expect(200)
        .end(function(err, res) {
            assert(mockedLoginManager.login.called);
            done();
        });
    });

    it('test logout route', function (done) {
        var app = express();
        var router = express.Router();
        var mockedLoginManager = new mocks.LoginManager();
        var mockedRequestStrategy = new mocks.RequestStrategy();
        var API = proxyquire('../server/api', {
            './managers/loginmanager': mockedLoginManager,
            '../config': { productive: true },
            './requeststrategy': mockedRequestStrategy
        });
        sinon.spy(mockedLoginManager, 'logout');
        sinon.spy(mockedRequestStrategy, 'restrictedAreaAndRedirect');
        app.use(router);
        API(router);
        
        request(app).get('/logout')
        .expect(200)
        .end(function(err, res) {
            assert(mockedRequestStrategy.restrictedAreaAndRedirect.called);
            assert(mockedLoginManager.logout.called);
            done();
        });
    });

    it('test selectrealm route', function (done) {
        var app = express();
        var router = express.Router();
        var mockedLoginManager = new mocks.LoginManager();
        var mockedRequestStrategy = new mocks.RequestStrategy();
        var API = proxyquire('../server/api', {
            './managers/loginmanager': mockedLoginManager,
            '../config': { productive: true },
            './requeststrategy': mockedRequestStrategy
        });
        sinon.spy(mockedLoginManager, 'selectRealm');
        sinon.spy(mockedRequestStrategy, 'restrictedArea');
        app.use(router);
        API(router);
        
        request(app).post('/api/selectrealm')
        .expect(200)
        .end(function(err, res) {
            assert(mockedRequestStrategy.restrictedArea.called);
            assert(mockedLoginManager.selectRealm.called);
            done();
        });
    });
});