'use strict';

var sugar = require('sugar'),
    express = require('express'),
    request = require('supertest'),
    assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire');

module.exports = {
    testRoutes: function(packagePath, testSet) {
        testSet.each(function(test) {
            it('['+test.httpMethod.toUpperCase()+'] ' + test.route, function (done) {
                var app = express();
                var router = express.Router();
                var API;
                var mocks = {};

                test.mockedPackages.each(function(mock) {
                    mocks[mock.relativePath] = mock.instance;
                    if (mock.ensureCallMethods) {
                        mock.ensureCallMethods.each(function(methodName) {
                            sinon.spy(mock.instance, methodName);
                        });
                    }
                });

                app.use(router);
                app.engine('ejs', function (filePath, options, callback) { // define the template engine
                    return callback(null, '');
                });
                app.set('views', __dirname + '/../server/views');
                app.set('view engine', 'ejs');
                API = proxyquire(packagePath, mocks);
                API(router);

                request(app)[test.httpMethod](test.route)
                .expect(200)
                .end(function(err, res) {
                    test.mockedPackages.each(function(mock) {
                        if (mock.ensureCallMethods) {
                            mock.ensureCallMethods.each(function(methodName) {
                                assert(mock.instance[methodName].called, 'Ensure call of method ' + methodName);
                            });
                        }
                    });
                    done();
                });
            });
        });
    }
};
