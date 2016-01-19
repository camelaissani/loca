'use strict';

var sugar = require('sugar'),
    express = require('express'),
    request = require('supertest'),
    assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    mocks = require('./mocks');

var testSet = [
    {
        label: '/signup',
        mockedPackages: [
            {
                relativePath: './managers/loginmanager',
                instance: new mocks.LoginManager(),
                ensureCallMethods: ['signup']
            },
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/signup'
    },
    {
        label: '/login',
        mockedPackages: [
            {
                relativePath: './managers/loginmanager',
                instance: new mocks.LoginManager(),
                ensureCallMethods: ['login']
            },
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/login'
    },
    {
        label: '/logout',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/logout'
    },
    {
        label: '/api/selectrealm',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/api/selectrealm'
    },
    {
        label: '/occupants/one',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/occupants/one'
    },
    {
        label: '/occupants/add',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/occupants/add'
    },
    {
        label: '/occupants/update',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/occupants/update'
    },
    {
        label: '/occupants/remove',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/occupants/remove'
    },
    {
        label: '/api/occupants',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/occupants'
    },
    {
        label: '/api/occupants/overview',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/occupants/overview'
    },
    {
        label: '/documents/update',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/documents/update'
    },
    {
        label: '/api/notifications',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/notifications'
    },
    {
        label: '/rents/one',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/rents/one'
    },
    {
        label: '/rents/update',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/rents/update'
    },
    {
        label: '/api/rents/occupant',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/rents/occupant'
    },
    {
        label: '/api/rents',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/rents'
    },
    {
        label: '/api/rents/overview',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/rents/overview'
    },
    {
        label: '/properties/add',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/properties/add'
    },
    {
        label: '/properties/update',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/properties/update'
    },
    {
        label: '/properties/remove',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/properties/remove'
    },
    {
        label: '/api/properties',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/properties'
    },
    {
        label: '/api/properties/overview',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/properties/overview'
    },
    {
        label: '/api/owner',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'get',
        route:'/api/owner'
    },
    {
        label: '/owner/update',
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
            {
                relativePath: '../config',
                instance: { productive: true }
            }
        ],
        httpMethod: 'post',
        route:'/owner/update'
    }
];

describe('api', function () {

    testSet.each(function(test) {
        it(test.label, function (done) {
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
            API = proxyquire('../server/api', mocks);
            API(router);

            request(app)[test.httpMethod](test.route)
            .expect(200)
            .end(function(err, res) {
                test.mockedPackages.each(function(mock) {
                    if (mock.ensureCallMethods) {
                        mock.ensureCallMethods.each(function(methodName) {
                            assert(mock.instance[methodName].called);
                        });
                    }
                });
                done();
            });
        });
    });
});
