// 'use strict';

// var sugar = require('sugar'),
//     express = require('express'),
//     request = require('supertest'),
//     assert = require('assert'),
//     sinon = require('sinon'),
//     proxyquire = require('proxyquire');

// sugar.extend();
// module.exports = {
//     testRoutes: function(packagePath, testSet) {
//         testSet.forEach(function(test) {
//             it('['+test.httpMethod.toUpperCase()+'] ' + test.route, function (done) {
//                 var app = express();
//                 var mocks = {};

//                 test.mockedPackages.forEach(function(mock) {
//                     if (mock.toInstantiate) {
//                         mock.instance = new mock.toInstantiate();
//                     }
//                     mocks[mock.relativePath] = mock.instance;
//                     if (mock.ensureCallMethods) {
//                         mock.ensureCallMethods.forEach(function(methodName) {
//                             sinon.spy(mock.instance, methodName);
//                         });
//                     }
//                 });

//                 app.engine('ejs', function (filePath, options, callback) { // define the template engine
//                     return callback(null, '');
//                 });
//                 app.set('views', __dirname + '/../frontend/view');
//                 app.set('view engine', 'ejs');
//                 app.use(proxyquire(packagePath, mocks));

//                 request(app)[test.httpMethod](test.route)
//                 .expect(200)
//                 .end(function(err, res) {
//                     test.mockedPackages.forEach(function(mock) {
//                         if (mock.ensureCallMethods) {
//                             mock.ensureCallMethods.forEach(function(methodName) {
//                                 assert(mock.instance[methodName].called, 'Ensure call of method ' + methodName);
//                             });
//                         }
//                     });
//                     done();
//                 });
//             });
//         });
//     }
// };
