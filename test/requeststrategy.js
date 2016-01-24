var assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    mocks = require('./mocks'),
    rs = proxyquire('../server/requeststrategy', {
        'winston': new mocks.Logger()
    });


describe('requeststartegy', function() {
    it('mustSessionLessArea', function() {
        var req = {},
            res = {
                redirect: function() {}
            },
            next = sinon.spy();

        sinon.spy(res, 'redirect');
        // check redirect
        rs.mustSessionLessArea(req, res, next);
        assert(res.redirect.called === false);
        assert(next.called);

        // check next
        res.redirect.reset();
        next.reset();
        req.session = {
            user: {}
        };
        rs.mustSessionLessArea(req, res, next);
        assert(res.redirect.calledWith('/index'));
        assert(next.called === false);
    });

    it('restrictedArea', function() {
        var req = {},
            res = {
                send: function() {}
            },
            next = sinon.spy();

        sinon.spy(res, 'send');
        // check send
        rs.restrictedArea(req, res, next);
        assert(res.send.calledWith(401));
        assert(next.called === false);

        // check next
        res.send.reset();
        next.reset();
        req.session = {
            user: {}
        };
        rs.restrictedArea(req, res, next);
        assert(res.send.called === false);
        assert(next.called);
    });

    it('restrictedAreaAndRedirect', function() {
        var req = {},
            res = {
                redirect: function() {}
            },
            next = sinon.spy();

        sinon.spy(res, 'redirect');
        // check redirect
        rs.restrictedAreaAndRedirect(req, res, next);
        assert(res.redirect.calledWith('/login'));
        assert(next.called === false);

        // check next
        res.redirect.reset();
        next.reset();
        req.session = {
            user: {}
        };
        rs.restrictedAreaAndRedirect(req, res, next);
        assert(res.redirect.called === false);
        assert(next.called);
    });

    it('mustRealmSetAndRedirect', function() {
        var req = {},
            res = {
                redirect: function() {}
            },
            next = sinon.spy();

        sinon.spy(res, 'redirect');
        // check redirect
        rs.mustRealmSetAndRedirect(req, res, next);
        assert(res.redirect.calledWith('/selectrealm'));
        assert(next.called === false);

        // check next
        res.redirect.reset();
        next.reset();
        req.session = {
            user: {
                realm: {}
            }
        };
        rs.mustRealmSetAndRedirect(req, res, next);
        assert(res.redirect.called === false);
        assert(next.called);
    });

    it('mustRealmSet', function() {
        var req = {},
            res = {
                send: function() {}
            },
            next = sinon.spy();

        sinon.spy(res, 'send');
        // check send
        rs.mustRealmSet(req, res, next);
        assert(res.send.calledWith(401));
        assert(next.called === false);

        // check next
        res.send.reset();
        next.reset();
        req.session = {
            user: {
                realm: {}
            }
        };
        rs.mustRealmSet(req, res, next);
        assert(res.send.called === false);
        assert(next.called);
    });
});