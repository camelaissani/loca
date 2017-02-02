'use strict';

var helpers = require('./helpers'),
    mocks = require('./mocks');

var configPackage = {
    relativePath: '../../config',
    instance: {
        default: {
            subscription: true
        }
    }
};

var loginConfigPackage = JSON.parse(JSON.stringify(configPackage));
loginConfigPackage.instance.default.demomode = false;

var testSet = [{
    mockedPackages: [{
            relativePath: '../managers/loginmanager',
            instance: new mocks.LoginManager(),
            ensureCallMethods: ['selectRealm']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/selectrealm'
}, {
    mockedPackages: [{
            relativePath: '../managers/occupantmanager',
            instance: new mocks.OccupantManager(),
            ensureCallMethods: ['one']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/occupants/one'
}, {
    mockedPackages: [{
            relativePath: '../managers/occupantmanager',
            instance: new mocks.OccupantManager(),
            ensureCallMethods: ['add']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/occupants/add'
}, {
    mockedPackages: [{
            relativePath: '../managers/occupantmanager',
            instance: new mocks.OccupantManager(),
            ensureCallMethods: ['update']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/occupants/update'
}, {
    mockedPackages: [{
            relativePath: '../managers/occupantmanager',
            instance: new mocks.OccupantManager(),
            ensureCallMethods: ['remove']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/occupants/remove'
}, {
    mockedPackages: [{
            relativePath: '../managers/occupantmanager',
            instance: new mocks.OccupantManager(),
            ensureCallMethods: ['findAllOccupants']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/occupants'
}, {
    mockedPackages: [{
            relativePath: '../managers/occupantmanager',
            instance: new mocks.OccupantManager(),
            ensureCallMethods: ['findAllOccupants']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/occupants/overview'
}, {
    mockedPackages: [{
            relativePath: '../managers/documentmanager',
            instance: new mocks.DocumentManager(),
            ensureCallMethods: ['update']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/documents/update'
}, {
    mockedPackages: [{
            relativePath: '../managers/notificationmanager',
            instance: new mocks.NotificationManager(),
            ensureCallMethods: ['findAll']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/notifications'
}, {
    mockedPackages: [{
            relativePath: '../managers/rentmanager',
            instance: new mocks.RentManager(),
            ensureCallMethods: ['one']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/rents/one'
}, {
    mockedPackages: [{
            relativePath: '../managers/rentmanager',
            instance: new mocks.RentManager(),
            ensureCallMethods: ['update']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/rents/update'
}, {
    mockedPackages: [{
            relativePath: '../managers/rentmanager',
            instance: new mocks.RentManager(),
            ensureCallMethods: ['findOccupantRents']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/rents/occupant'
}, {
    mockedPackages: [{
            relativePath: '../managers/rentmanager',
            instance: new mocks.RentManager(),
            ensureCallMethods: ['findAllOccupantRents']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/rents'
}, {
    mockedPackages: [{
            relativePath: '../managers/rentmanager',
            instance: new mocks.RentManager(),
            ensureCallMethods: ['findAllOccupantRents']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/rents/overview'
}, {
    mockedPackages: [{
            relativePath: '../managers/propertymanager',
            instance: new mocks.PropertyManager(),
            ensureCallMethods: ['add']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/properties/add'
}, {
    mockedPackages: [{
            relativePath: '../managers/propertymanager',
            instance: new mocks.PropertyManager(),
            ensureCallMethods: ['update']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/properties/update'
}, {
    mockedPackages: [{
            relativePath: '../managers/propertymanager',
            instance: new mocks.PropertyManager(),
            ensureCallMethods: ['remove']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/properties/remove'
}, {
    mockedPackages: [{
            relativePath: '../managers/propertymanager',
            instance: new mocks.PropertyManager(),
            ensureCallMethods: ['findAllResources']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/properties'
}, {
    mockedPackages: [{
            relativePath: '../managers/propertymanager',
            instance: new mocks.PropertyManager(),
            ensureCallMethods: ['findAllResources']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/properties/overview'
}, {
    mockedPackages: [{
            relativePath: '../managers/ownermanager',
            instance: new mocks.OwnerManager(),
            ensureCallMethods: ['findOwner']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'get',
    route: '/api/owner'
}, {
    mockedPackages: [{
            relativePath: '../managers/ownermanager',
            instance: new mocks.OwnerManager(),
            ensureCallMethods: ['update']
        }, {
            relativePath: './requeststrategy',
            instance: new mocks.RequestStrategy(),
            ensureCallMethods: ['restrictedArea']
        },
        configPackage
    ],
    httpMethod: 'post',
    route: '/api/owner/update'
}];

describe('api', function() {
    helpers.testRoutes('../backend/routes/api', testSet);
});
