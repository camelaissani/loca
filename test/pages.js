/* eslint-env node, mocha */

'use strict';
const proxyquire = require('proxyquire');
proxyquire('../backend/routes/page', {
    '../pages/print/model': (req, callback) => {
        req.model = Object.assign(req.model, { document: 'adoc' });
        callback();
    }
});
const assert = require('assert');
const sinon = require('sinon');
const logger = require('winston');
const config = require('../config');
const requester = require('./requester');
const pageRouter = require('../backend/routes/page');

logger.info = sinon.stub(logger, 'info').callsFake(() => {});

describe('pages', () => {
    let viewEngine;
    beforeEach(() => {
        viewEngine = sinon.stub();
    });
    describe('rendering', () => {
        it('GET  /', (done) => {
            config.subscription = true;
            requester(pageRouter(), { httpMethod: 'get', uri: '/' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];
                    assert(filepath.endsWith('index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'website');
                    done();
                });
        });

        it('GET  /signup', (done) => {
            config.subscription = true;
            requester(pageRouter(), { httpMethod: 'get', uri: '/signup' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];
                    assert(filepath.endsWith('index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'signup');
                    done();
                });
        });

        it('GET  /signin', (done) => {
            config.demomode = false;
            requester(pageRouter(), { httpMethod: 'get', uri: '/signin' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];
                    assert(filepath.endsWith('index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'signin');
                    done();
                });
        });

        it('GET  /realm', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/realm' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];
                    assert(filepath.endsWith('index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'realm');
                    done();
                });
        });

        it('GET  /:view', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/property' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];
                    assert(filepath.endsWith('index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'property');
                    done();
                });
        });

        it('GET  /blabla (unknown view 404)', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/blabla' }, viewEngine)
                .expect(404)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    done();
                });
        });

        it('GET  /view/:view', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/view/property' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];

                    assert(filepath.endsWith('property/view/index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'property');
                    done();
                });
        });

        it('GET  /view/blabla (unknown view 404)', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/view/blabla' }, viewEngine)
                .expect(404)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    done();
                });
        });
    });
    describe('printable', () => {
        it('GET  /print/:id/occupants/:ids/:year/:month', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/print/adoc/occupants/1234/2017/02' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];

                    assert(filepath.endsWith('print/view/index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'print');
                    assert.strictEqual(model.document, 'adoc');
                    done();
                });
        });
        it('GET  /print/:id/occupants/:ids/:year', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/print/adoc/occupants/1234/2017' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];

                    assert(filepath.endsWith('print/view/index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'print');
                    assert.strictEqual(model.document, 'adoc');
                    done();
                });
        });
        it('GET  /print/:id/occupants/ids', (done) => {
            requester(pageRouter(), { httpMethod: 'get', uri: '/print/adoc/occupants/1234' }, viewEngine)
                .expect(200)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const viewEngineArgs = viewEngine.args[0];
                    assert(viewEngineArgs && viewEngineArgs.length > 1);
                    const filepath = viewEngineArgs[0];

                    assert(filepath.endsWith('print/view/index.ejs'));
                    const model = viewEngineArgs[1];
                    assert.strictEqual(model.view, 'print');
                    assert.strictEqual(model.document, 'adoc');
                    done();
                });
        });
    });
});
