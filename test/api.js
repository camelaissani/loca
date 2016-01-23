'use strict';

var helpers = require('./helpers'),
    mocks = require('./mocks');

var configPackage = {
    relativePath: '../config',
    instance: { productive: true }
};

var testSet = [
    {
        mockedPackages: [
            {
                relativePath: './managers/loginmanager',
                instance: new mocks.LoginManager(),
                ensureCallMethods: ['signup']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/signup'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/loginmanager',
                instance: new mocks.LoginManager(),
                ensureCallMethods: ['login']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/login'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/loginmanager',
                instance: new mocks.LoginManager(),
                ensureCallMethods: ['logout']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedAreaAndRedirect']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/logout'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/loginmanager',
                instance: new mocks.LoginManager(),
                ensureCallMethods: ['selectRealm']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/api/selectrealm'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/occupantmanager',
                instance: new mocks.OccupantManager(),
                ensureCallMethods: ['one']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/occupants/one'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/occupantmanager',
                instance: new mocks.OccupantManager(),
                ensureCallMethods: ['add']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/occupants/add'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/occupantmanager',
                instance: new mocks.OccupantManager(),
                ensureCallMethods: ['update']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/occupants/update'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/occupantmanager',
                instance: new mocks.OccupantManager(),
                ensureCallMethods: ['remove']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/occupants/remove'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/occupantmanager',
                instance: new mocks.OccupantManager(),
                ensureCallMethods: ['findAllOccupants']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/occupants'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/occupantmanager',
                instance: new mocks.OccupantManager(),
                ensureCallMethods: ['findAllOccupants']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/occupants/overview'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/documentmanager',
                instance: new mocks.DocumentManager(),
                ensureCallMethods: ['update']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/documents/update'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/notificationmanager',
                instance: new mocks.NotificationManager(),
                ensureCallMethods: ['findAll']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/notifications'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/rentmanager',
                instance: new mocks.RentManager(),
                ensureCallMethods: ['one']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/rents/one'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/rentmanager',
                instance: new mocks.RentManager(),
                ensureCallMethods: ['update']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/rents/update'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/rentmanager',
                instance: new mocks.RentManager(),
                ensureCallMethods: ['findOccupantRents']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/rents/occupant'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/rentmanager',
                instance: new mocks.RentManager(),
                ensureCallMethods: ['findAllOccupantRents']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/rents'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/rentmanager',
                instance: new mocks.RentManager(),
                ensureCallMethods: ['findAllOccupantRents']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/rents/overview'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/resourcemanager',
                instance: new mocks.ResourceManager(),
                ensureCallMethods: ['add']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/properties/add'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/resourcemanager',
                instance: new mocks.ResourceManager(),
                ensureCallMethods: ['update']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/properties/update'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/resourcemanager',
                instance: new mocks.ResourceManager(),
                ensureCallMethods: ['remove']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/properties/remove'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/resourcemanager',
                instance: new mocks.ResourceManager(),
                ensureCallMethods: ['findAllResources']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/properties'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/resourcemanager',
                instance: new mocks.ResourceManager(),
                ensureCallMethods: ['findAllResources']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/properties/overview'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/ownermanager',
                instance: new mocks.OwnerManager(),
                ensureCallMethods: ['findOwner']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'get',
        route:'/api/owner'
    },
    {
        mockedPackages: [
            {
                relativePath: './managers/ownermanager',
                instance: new mocks.OwnerManager(),
                ensureCallMethods: ['update']
            },
            {
                relativePath: './requeststrategy',
                instance: new mocks.RequestStrategy(),
                ensureCallMethods: ['restrictedArea']
            },
            configPackage
        ],
        httpMethod: 'post',
        route:'/owner/update'
    }
];

describe('api', function () {
    helpers.testRoutes('../server/api', testSet);
});
