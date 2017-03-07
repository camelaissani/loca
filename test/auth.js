// 'use strict';

// var helpers = require('./helpers'),
//     mocks = require('./mocks');

// var configPackage = {
//     relativePath: '../../config',
//     instance: {
//         default: {
//             subscription: true,
//             demomode: true
//         }
//     }
// };

// var loginConfigPackage = JSON.parse(JSON.stringify(configPackage));
// loginConfigPackage.instance.default.demomode = false;

// var loggerPackage = {
//     relativePath: 'winston',
//     instance: new mocks.Logger()
// };

// var testSet = [{
//     mockedPackages: [
//         {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager(),
//             ensureCallMethods: ['signup']
//         },
//         configPackage
//     ],
//     httpMethod: 'post',
//     route: '/signup'
// }, {
//     mockedPackages: [
//         {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager(),
//             ensureCallMethods: ['login']
//         },
//         loginConfigPackage
//     ],
//     httpMethod: 'post',
//     route: '/login'
// }, {
//     mockedPackages: [
//         {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager(),
//             ensureCallMethods: ['logout']
//         },
//         configPackage
//     ],
//     httpMethod: 'get',
//     route: '/logout'
// }, {
//     mockedPackages: [
//         loginConfigPackage, {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager()
//         }, loggerPackage, {
//             relativePath: './requeststrategy',
//             instance: new mocks.RequestStrategy(),
//             ensureCallMethods: ['mustSessionLessArea']
//         }
//     ],
//     httpMethod: 'get',
//     route: '/login'
// }, {
//     mockedPackages: [
//         configPackage, {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager(),
//             ensureCallMethods: ['loginDemo']
//         }, loggerPackage, {
//             relativePath: './requeststrategy',
//             instance: new mocks.RequestStrategy(),
//             ensureCallMethods: ['mustSessionLessArea']
//         }
//     ],
//     httpMethod: 'get',
//     route: '/login'
// }, {
//     mockedPackages: [
//         configPackage, loginConfigPackage, {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager()
//         }, loggerPackage, {
//             relativePath: './requeststrategy',
//             instance: new mocks.RequestStrategy(),
//             ensureCallMethods: ['mustSessionLessArea']
//         }
//     ],
//     httpMethod: 'get',
//     route: '/signup'
// }, {
//     mockedPackages: [
//         configPackage, loginConfigPackage, {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager()
//         }, loggerPackage, {
//             relativePath: './requeststrategy',
//             instance: new mocks.RequestStrategy(),
//             ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
//         }
//     ],
//     httpMethod: 'get',
//     route: '/loggedin'
// }, {
//     mockedPackages: [
//         configPackage, loginConfigPackage, {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager()
//         }, loggerPackage, {
//             relativePath: './requeststrategy',
//             instance: new mocks.RequestStrategy(),
//             ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
//         }
//     ],
//     httpMethod: 'post',
//     route: '/loggedin'
// }, {
//     mockedPackages: [
//         configPackage, loginConfigPackage, {
//             relativePath: '../managers/loginmanager',
//             instance: new mocks.LoginManager()
//         }, loggerPackage, {
//             relativePath: './requeststrategy',
//             instance: new mocks.RequestStrategy(),
//             ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
//         }
//     ],
//     httpMethod: 'post',
//     route: '/signedin'
// }];

// describe('auth routes', function() {
//     helpers.testRoutes('../backend/routes/auth', testSet);
// });
