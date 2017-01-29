'use strict';

var helpers = require('./helpers'),
    mocks = require('./mocks');

var configPackage = {
    relativePath: '../../config',
    instance: {
        subscription: true
    }
};

var loginConfigPackage = JSON.parse(JSON.stringify(configPackage));
loginConfigPackage.instance.demomode = false;

var loggerPackage = {
    relativePath: 'winston',
    instance: new mocks.Logger()
};

var testSet = [{
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect']
        }
    ],
    httpMethod: 'get',
    route: '/selectrealm'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }
    ],
    httpMethod: 'get',
    route: '/index'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }
    ],
    httpMethod: 'get',
    route: '/index?view=dashboard'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea', 'mustRealmSet']
        }
    ],
    httpMethod: 'get',
    route: '/page/dashboard'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea', 'mustRealmSet']
        }
    ],
    httpMethod: 'get',
    route: '/page/rent'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea', 'mustRealmSet']
        }
    ],
    httpMethod: 'get',
    route: '/page/occupant'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea', 'mustRealmSet']
        }
    ],
    httpMethod: 'get',
    route: '/page/property'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea', 'mustRealmSet']
        }
    ],
    httpMethod: 'get',
    route: '/page/owner'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea', 'mustRealmSet']
        }
    ],
    httpMethod: 'get',
    route: '/page/account'
}];

describe('page routes', function() {
    helpers.testRoutes('../server/routes/page', testSet);
});
