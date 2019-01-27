/* eslint-env node, mocha */

'use strict';
const assert = require('assert');
const sinon = require('sinon');
const requester = require('./requester');
const apiRouter = require('../backend/routes/api');
const loginManager = require('../backend/managers/loginmanager');
const rentManager = require('../backend/managers/rentmanager');
const occupantManager = require('../backend/managers/occupantmanager');
const documentManager = require('../backend/managers/documentmanager');
const propertyManager = require('../backend/managers/propertymanager');
const ownerManager = require('../backend/managers/ownermanager');
const notificationManager = require('../backend/managers/notificationmanager');
const accountingManager = require('../backend/managers/accountingmanager');

describe('api', () => {
    // TODO: move these tests in auth.js
    // describe('session', () => {
    //     it('POST   /api/signup', (done) => {
    //         config.subscription = true;
    //         loginManager.signup = () => {};
    //         const mocked_signup = sinon.stub(loginManager, 'signup', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'post', uri: '/api/signup'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_signup.calledOnce);
    //             config.subscription = false;
    //             loginManager.signup.restore();
    //             delete loginManager.signup;
    //             done();
    //         });
    //     });
    //     it('POST   /api/login', (done) => {
    //         const mocked_login = sinon.stub(loginManager, 'login', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'post', uri: '/api/login'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_login.calledOnce);
    //             loginManager.login.restore();
    //             done();
    //         });
    //     });
    //     it('POST   /api/login (demo mode)', (done) => {
    //         config.demomode = true;
    //         loginManager.loginDemo = () => {};
    //         const mocked_loginDemo = sinon.stub(loginManager, 'loginDemo', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'post', uri: '/api/login'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_loginDemo.calledOnce);
    //             config.demomode = false;
    //             loginManager.loginDemo.restore();
    //             delete loginManager.loginDemo;
    //             done();
    //         });
    //     });
    //     it('GET    /api/logout', (done) => {
    //         const mocked_logout = sinon.stub(loginManager, 'logout', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'get', uri: '/api/logout'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_logout.calledOnce);
    //             loginManager.logout.restore();
    //             done();
    //         });
    //     });
    // });

    describe('documents', () => {
        it('PATCH  /api/documents/:id', (done) => {
            const mocked_update = sinon.stub(documentManager, 'update').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'patch', uri: '/api/documents/1234' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_update.calledOnce);
                    documentManager.update.restore();
                    done();
                });
        });
    });

    describe('notifications', () => {
        it('GET    /api/notifications', (done) => {
            const mocked_all = sinon.stub(notificationManager, 'all').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/notifications' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_all.calledOnce);
                    notificationManager.all.restore();
                    done();
                });
        });
    });

    describe('realms', () => {
        it('GET    /api/realms/:id', (done) => {
            const mocked_selectRealm = sinon.stub(loginManager, 'selectRealm').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/realms/1234' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_selectRealm.calledOnce);
                    loginManager.selectRealm.restore();
                    done();
                });
        });
    });

    describe('occupants', () => {
        it('POST   /api/occupants', (done) => {
            const mocked_add = sinon.stub(occupantManager, 'add').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'post', uri: '/api/occupants' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_add.calledOnce);
                    occupantManager.add.restore();
                    done();
                });
        });
        it('PATCH  /api/occupants/:id', (done) => {
            const mocked_update = sinon.stub(occupantManager, 'update').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'patch', uri: '/api/occupants/1234' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_update.calledOnce);
                    occupantManager.update.restore();
                    done();
                });
        });
        it('DELETE /api/occupants/:ids', (done) => {
            const mocked_remove = sinon.stub(occupantManager, 'remove').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'delete', uri: '/api/occupants/1,2,3' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_remove.calledOnce);
                    occupantManager.remove.restore();
                    done();
                });
        });
        it('GET    /api/occupants', (done) => {
            const mocked_all = sinon.stub(occupantManager, 'all').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/occupants' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_all.calledOnce);
                    occupantManager.all.restore();
                    done();
                });
        });
        it('GET    /api/occupants/overview', (done) => {
            const mocked_overview = sinon.stub(occupantManager, 'overview').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/occupants/overview' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_overview.calledOnce);
                    occupantManager.overview.restore();
                    done();
                });
        });
    });

    describe('rents', () => {
        it('PATCH  /api/rents/:id', (done) => {
            const mocked_update = sinon.stub(rentManager, 'update').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'patch', uri: '/api/rents/1234' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_update.calledOnce);
                    mocked_update.restore();
                    done();
                });
        });
        it('GET    /api/rents/occupant/:id', (done) => {
            const mocked_rentsOfOccupant = sinon.stub(rentManager, 'rentsOfOccupant').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/rents/occupant/1234' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_rentsOfOccupant.calledOnce);
                    mocked_rentsOfOccupant.restore();
                    done();
                });
        });
        it('GET    /api/rents/:year/:month', (done) => {
            const mocked_all = sinon.stub(rentManager, 'all').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/rents/2017/02' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_all.calledOnce);
                    mocked_all.restore();
                    done();
                });
        });
        it('GET    /api/rents/overview', (done) => {
            const mocked_overview = sinon.stub(rentManager, 'overview').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/rents/overview' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_overview.calledOnce);
                    mocked_overview.restore();
                    done();
                });
        });
        it('GET    /api/rents/overview/:year/:month', (done) => {
            const mocked_overview = sinon.stub(rentManager, 'overview').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/rents/overview/2017/02' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_overview.calledOnce);
                    mocked_overview.restore();
                    done();
                });
        });
    });

    describe('properties', () => {
        it('POST   /api/properties', (done) => {
            const mocked_add = sinon.stub(propertyManager, 'add').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'post', uri: '/api/properties' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_add.calledOnce);
                    mocked_add.restore();
                    done();
                });
        });
        it('PATCH  /api/properties/:id', (done) => {
            const mocked_update = sinon.stub(propertyManager, 'update').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'patch', uri: '/api/properties/1234' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_update.calledOnce);
                    mocked_update.restore();
                    done();
                });
        });
        it('DELETE /api/properties/:ids', (done) => {
            const mocked_remove = sinon.stub(propertyManager, 'remove').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'delete', uri: '/api/properties/1,2,3,4' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_remove.calledOnce);
                    mocked_remove.restore();
                    done();
                });
        });
        it('GET    /api/properties', (done) => {
            const mocked_all = sinon.stub(propertyManager, 'all').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/properties' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_all.calledOnce);
                    mocked_all.restore();
                    done();
                });
        });
        it('GET    /api/properties/overview', (done) => {
            const mocked_overview = sinon.stub(propertyManager, 'overview').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/properties/overview' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_overview.calledOnce);
                    mocked_overview.restore();
                    done();
                });
        });
    });

    describe('owner', () => {
        it('PATCH  /api/owner/:id', (done) => {
            const mocked_update = sinon.stub(ownerManager, 'update').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'patch', uri: '/api/owner/1234' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_update.calledOnce);
                    mocked_update.restore();
                    done();
                });
        });
        it('GET    /api/owner', (done) => {
            const mocked_all = sinon.stub(ownerManager, 'all').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/owner' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_all.calledOnce);
                    mocked_all.restore();
                    done();
                });
        });
    });

    describe('accounting', () => {
        it('GET    /api/accounting/:year', (done) => {
            const mocked_all = sinon.stub(accountingManager, 'all').callsFake((req, res) => res.json({}));
            requester(apiRouter(), { httpMethod: 'get', uri: '/api/accounting/2017' })
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    assert(mocked_all.calledOnce);
                    mocked_all.restore();
                    done();
                });
        });
    });
});
