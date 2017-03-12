/* eslint-env node, mocha */

'use strict';
import assert from 'assert';
import sinon from 'sinon';
import * as logger from 'winston';
import requester from './requester';
import pageRouter, {defaultLoggedView} from '../backend/routes/page';

logger.info = sinon.stub(logger.default, 'info', ()=>{});

describe.only('page/view rendering', () => {
    describe.only('/page', () => {
        it('GET  /page/:view', (done) => {
            const viewEngine = sinon.stub();
            requester(pageRouter(), {httpMethod: 'get', uri: '/page/property'}, viewEngine)
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
                assert(model.view === 'property');
                done();
            });
        });

        it('GET  /page/blabla (redirect unknown view to default)', (done) => {
            const viewEngine = sinon.stub();
            requester(pageRouter(), {httpMethod: 'get', uri: '/page/blabla'}, viewEngine)
            .expect(302)
            .expect('Location', `/page/${defaultLoggedView}`)
            .end((err) => {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });

    describe.only('/view', () => {
        it('GET  /view/:view', (done) => {
            const viewEngine = sinon.stub();
            requester(pageRouter(), {httpMethod: 'get', uri: '/view/property'}, viewEngine)
            .expect(200)
            .end((err) => {
                if (err) {
                    throw err;
                }
                const viewEngineArgs = viewEngine.args[0];
                assert(viewEngineArgs && viewEngineArgs.length > 1);
                const filepath = viewEngineArgs[0];

                assert(filepath.endsWith('property/index.ejs'));
                const model = viewEngineArgs[1];
                assert(model.view === 'property');
                done();
            });
        });

        it('GET  /view/blabla (redirect unknown view to default)', (done) => {
            const viewEngine = sinon.stub();
            requester(pageRouter(), {httpMethod: 'get', uri: '/view/blabla'}, viewEngine)
            .expect(302)
            .expect('Location', `/page/${defaultLoggedView}`)
            .end((err) => {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });
});
