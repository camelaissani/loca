'use strict';

var helpers = require('./helpers'),
    mocks = require('./mocks');

var configPackage = {
    relativePath: '../../config',
    instance: {
        subscription: true
    }
};

var loggerPackage = {
    relativePath: 'winston',
    instance: new mocks.Logger()
};

var printManagerPackage_checkRentModel = {
    relativePath: '../managers/printmanager',
    toInstantiate: mocks.PrintManager,
    ensureCallMethods: ['rentModel']
};

var printManagerPackage_checkRenderModel = {
    relativePath: '../managers/printmanager',
    toInstantiate: mocks.PrintManager,
    ensureCallMethods: ['renderModel']
};

var testSet = [{
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRentModel
    ],
    httpMethod: 'get',
    route: '/print/invoice'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRentModel
    ],
    httpMethod: 'get',
    route: '/print/rentcall'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRentModel
    ],
    httpMethod: 'get',
    route: '/print/recovery1'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRentModel
    ],
    httpMethod: 'get',
    route: '/print/recovery2'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRentModel
    ],
    httpMethod: 'get',
    route: '/print/recovery3'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRentModel
    ],
    httpMethod: 'get',
    route: '/print/paymentorder'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/insurance'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/guarantycertificate'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/guarantypaybackcertificate'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/guarantyrequest'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/contract'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/customcontract'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/domcontract'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        },
        printManagerPackage_checkRenderModel
    ],
    httpMethod: 'get',
    route: '/print/checklist'
}];

describe('print routes', function() {
    helpers.testRoutes('../server/routes/print', testSet);
});
