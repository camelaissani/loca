/* eslint-env node, mocha */

'use strict';
import assert from 'assert';
import sinon from 'sinon';
import requester from './requester';
import apiRouter from '../backend/routes/api';
import * as loginManager from '../backend/managers/loginmanager';
import * as rentManager from '../backend/managers/rentmanager';
import * as occupantManager from '../backend/managers/occupantmanager';
import * as documentManager from '../backend/managers/documentmanager';
import * as printManager from '../backend/managers/printmanager';
import * as propertyManager from '../backend/managers/propertymanager';
import * as ownerManager from '../backend/managers/ownermanager';
import * as notificationManager from '../backend/managers/notificationmanager';
import * as accountingManager from '../backend/managers/accountingmanager';

describe('api', () => {
    // TODO: move these tests in auth.js
    // describe('session', () => {
    //     it('POST   /api/signup', (done) => {
    //         config.default.subscription = true;
    //         loginManager.default.signup = () => {};
    //         const mocked_signup = sinon.stub(loginManager.default, 'signup', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'post', uri: '/api/signup'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_signup.calledOnce);
    //             config.default.subscription = false;
    //             loginManager.default.signup.restore();
    //             delete loginManager.default.signup;
    //             done();
    //         });
    //     });
    //     it('POST   /api/login', (done) => {
    //         const mocked_login = sinon.stub(loginManager.default, 'login', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'post', uri: '/api/login'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_login.calledOnce);
    //             loginManager.default.login.restore();
    //             done();
    //         });
    //     });
    //     it('POST   /api/login (demo mode)', (done) => {
    //         config.default.demomode = true;
    //         loginManager.default.loginDemo = () => {};
    //         const mocked_loginDemo = sinon.stub(loginManager.default, 'loginDemo', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'post', uri: '/api/login'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_loginDemo.calledOnce);
    //             config.default.demomode = false;
    //             loginManager.default.loginDemo.restore();
    //             delete loginManager.default.loginDemo;
    //             done();
    //         });
    //     });
    //     it('GET    /api/logout', (done) => {
    //         const mocked_logout = sinon.stub(loginManager.default, 'logout', (req, res) => {res.json({});});
    //         requester(apiRouter(), {httpMethod: 'get', uri: '/api/logout'})
    //         .expect(200)
    //         .end((err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             assert(mocked_logout.calledOnce);
    //             loginManager.default.logout.restore();
    //             done();
    //         });
    //     });
    // });

    describe('documents', () => {
        it('PATCH  /api/documents/:id', (done) => {
            const mocked_update = sinon.stub(documentManager.default, 'update', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'patch', uri: '/api/documents/1234'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_update.calledOnce);
                documentManager.default.update.restore();
                done();
            });
        });
        it('GET    /api/documents/print/:id/occupants/:ids/:year/:month', (done) => {
            const mocked_print = sinon.stub(printManager.default, 'print', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/documents/print/adoc/occupants/1234/2017/02'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_print.calledOnce);
                printManager.default.print.restore();
                done();
            });
        });
        it('GET    /api/documents/print/:id/occupants/:ids/:year', (done) => {
            const mocked_print = sinon.stub(printManager.default, 'print', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/documents/print/adoc/occupants/1234/2017'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_print.calledOnce);
                printManager.default.print.restore();
                done();
            });
        });
        it('GET    /api/documents/print/:id/occupants/ids', (done) => {
            const mocked_print = sinon.stub(printManager.default, 'print', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/documents/print/adoc/occupants/1234'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_print.calledOnce);
                printManager.default.print.restore();
                done();
            });
        });
    });

    describe('notifications', () => {
        it('GET    /api/notifications', (done) => {
            const mocked_all = sinon.stub(notificationManager.default, 'all', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/notifications'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_all.calledOnce);
                notificationManager.default.all.restore();
                done();
            });
        });
    });

    describe('realms', () => {
        it('GET    /api/realms/:id', (done) => {
            const mocked_selectRealm = sinon.stub(loginManager.default, 'selectRealm', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/realms/1234'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_selectRealm.calledOnce);
                loginManager.default.selectRealm.restore();
                done();
            });
        });
    });

    describe('occupants', () => {
        it('POST   /api/occupants', (done) => {
            const mocked_add = sinon.stub(occupantManager.default, 'add', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'post', uri: '/api/occupants'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_add.calledOnce);
                occupantManager.default.add.restore();
                done();
            });
        });
        it('PATCH  /api/occupants/:id', (done) => {
            const mocked_update = sinon.stub(occupantManager.default, 'update', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'patch', uri: '/api/occupants/1234'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_update.calledOnce);
                occupantManager.default.update.restore();
                done();
            });
        });
        it('DELETE /api/occupants/:ids', (done) => {
            const mocked_remove = sinon.stub(occupantManager.default, 'remove', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'delete', uri: '/api/occupants/1,2,3'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_remove.calledOnce);
                occupantManager.default.remove.restore();
                done();
            });
        });
        it('GET    /api/occupants', (done) => {
            const mocked_all = sinon.stub(occupantManager.default, 'all', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/occupants'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_all.calledOnce);
                occupantManager.default.all.restore();
                done();
            });
        });
        it('GET    /api/occupants/overview', (done) => {
            const mocked_overview = sinon.stub(occupantManager.default, 'overview', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/occupants/overview'})
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                assert(mocked_overview.calledOnce);
                occupantManager.default.overview.restore();
                done();
            });
        });
    });

    describe('rents', () => {
        it('PATCH  /api/rents/:id', (done) => {
            const mocked_update = sinon.stub(rentManager.default, 'update', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'patch', uri: '/api/rents/1234'})
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
            const mocked_rentsOfOccupant = sinon.stub(rentManager.default, 'rentsOfOccupant', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/rents/occupant/1234'})
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
            const mocked_all = sinon.stub(rentManager.default, 'all', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/rents/2017/02'})
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
            const mocked_overview = sinon.stub(rentManager.default, 'overview', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/rents/overview'})
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
            const mocked_overview = sinon.stub(rentManager.default, 'overview', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/rents/overview/2017/02'})
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
            const mocked_add = sinon.stub(propertyManager.default, 'add', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'post', uri: '/api/properties'})
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
            const mocked_update = sinon.stub(propertyManager.default, 'update', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'patch', uri: '/api/properties/1234'})
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
            const mocked_remove = sinon.stub(propertyManager.default, 'remove', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'delete', uri: '/api/properties/1,2,3,4'})
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
            const mocked_all = sinon.stub(propertyManager.default, 'all', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/properties'})
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
            const mocked_overview = sinon.stub(propertyManager.default, 'overview', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/properties/overview'})
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
            const mocked_update = sinon.stub(ownerManager.default, 'update', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'patch', uri: '/api/owner/1234'})
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
            const mocked_all = sinon.stub(ownerManager.default, 'all', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/owner'})
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
            const mocked_all = sinon.stub(accountingManager.default, 'all', (req, res) => {res.json({});});
            requester(apiRouter(), {httpMethod: 'get', uri: '/api/accounting/2017'})
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
