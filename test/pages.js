'use strict';

var helpers = require('./helpers'),
    mocks = require('./mocks');

var configPackage = {
    relativePath: '../config',
    instance: {
        subscription: true
    }
};

var loggerPackage = {
    relativePath: 'winston',
    instance: new mocks.Logger()
};

var testSet = [{
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['mustSessionLessArea']
        }
    ],
    httpMethod: 'get',
    route: '/'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['mustSessionLessArea']
        }
    ],
    httpMethod: 'get',
    route: '/login'
}, {
    mockedPackages: [{
        relativePath: '../config',
        instance: {
            productive: true,
            demomode: true
        }
    }, {
        relativePath: './managers/loginmanager',
        instance: new mocks.LoginManager(),
        ensureCallMethods: ['loginDemo']
    }, {
        relativePath: 'winston',
        instance: new mocks.Logger()
    }, {
        relativePath: './requeststrategy',
        instance: new mocks.RequestStrategy(),
        ensureCallMethods: ['mustSessionLessArea']
    }],
    httpMethod: 'get',
    route: '/login'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['mustSessionLessArea']
        }
    ],
    httpMethod: 'get',
    route: '/signup'
}, {
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
    route: '/loggedin'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }
    ],
    httpMethod: 'post',
    route: '/loggedin'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }
    ],
    httpMethod: 'post',
    route: '/signedin'
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
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/invoice'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/rentcall'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/recovery1'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/recovery2'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/recovery3'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/paymentorder'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/insurance'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/guarantycertificate'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/guarantypaybackcertificate'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/guarantyrequest'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/contract'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/customcontract'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/domcontract'
}, {
    mockedPackages: [
        configPackage, loggerPackage, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedAreaAndRedirect', 'mustRealmSetAndRedirect']
        }, {
            relativePath: './managers/printmanager',
            instance: new mocks.PrintManager(),
            ensureCallMethods: ['renderModel']
        }
    ],
    httpMethod: 'get',
    route: '/checklist'
}];

describe('pages', function() {
    helpers.testRoutes('../server/pages', testSet);
});