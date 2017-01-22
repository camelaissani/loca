'use strict';

var config = require('../config'),
    rs = require('./requeststrategy'),
    loginManager = require('./managers/loginmanager'),
    printManager = require('./managers/printmanager'),
    logger = require('winston');

const defaultAdminView = 'dashboard';

const adminViews = [
    // 'account',
    'accounting',
    'dashboard',
    'occupant',
    'owner',
    'property',
    'rent',
    'website'
];

const allViews = [
    // 'account',
    'accounting',
    'dashboard',
    'login',
    'occupant',
    'owner',
    'property',
    'rent',
    'selectrealm',
    'signup',
    'website'
];

function render(view, req, res) {
    const model = {
        config,
        view,
        isValidView: allViews.indexOf(view) !== -1,
        isLogged: req.user ? true : false,
        isRealmSelected: req.realm ? true : false,
        isDefaultRealmSelected: req.realm && req.realm.name === '__default_',
        isMultipleRealmsAvailable: req.realms && req.realms.length > 1,
        user: req.user,
        realm: req.realm,
        realms: req.realms,
        errors: null
    };
    logger.debug(model);
    res.render('index', model);
}

function PAGES(router) {
    router.route('/').get(rs.mustSessionLessArea, function(req, res) {
        render('website', req, res);
    });

    router.route('/login').get(rs.mustSessionLessArea, function(req, res) {
        if (config.demomode) {
            loginManager.loginDemo(req, res);
            return;
        }
        render('login', req, res);
    });

    if (config.subscription) {
        router.route('/signup').get(rs.mustSessionLessArea, function(req, res) {
            render('signup', req, res);
        });
    }

    router.route('/selectrealm').get(rs.restrictedAreaAndRedirect, function(req, res) {
        render('selectrealm', req, res);
    });

    router.route('/loggedin').post(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        res.redirect('/index');
    });

    router.route('/loggedin').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        res.redirect('/index');
    });

    if (config.subscription) {
        router.route('/signedin').post(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
            res.redirect('/login');
        });
    }

    router.route('/index').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        if (!req.query.view || adminViews.indexOf(req.query.view) === -1) {
            res.redirect(`/index?view=${defaultAdminView}`);
            logger.info(`View ${req.query.view} is not valid. Redirecting to /index?view=${defaultAdminView}`);
            return;
        }
        render(req.query.view, req, res);
    });

    router.route('/page/dashboard').get(rs.restrictedArea, rs.mustRealmSet, function(req, res) {
        res.render('dashboard/index', {
            account: req.user
        });
    });

    router.route('/page/rent').get(rs.restrictedArea, rs.mustRealmSet, function(req, res) {
        res.render('rent/index');
    });

    router.route('/page/occupant').get(rs.restrictedArea, rs.mustRealmSet, function(req, res) {
        res.render('occupant/index');
    });

    router.route('/page/accounting').get(rs.restrictedArea, rs.mustRealmSet, function(req, res) {
        res.render('accounting/index');
    });

    router.route('/page/property').get(rs.restrictedArea, rs.mustRealmSet, function(req, res) {
        res.render('property/index');
    });

    router.route('/page/owner').get(rs.restrictedArea, rs.mustRealmSet, function(req, res) {
        res.render('owner/index');
    });

    router.route('/page/account').get(rs.restrictedArea, rs.mustRealmSet, function(req, res) {
        res.render('account/index');
    });

    // Print
    router.route('/invoice').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.rentModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/invoice';
            res.render(model.view, model);
        });
    });

    router.route('/rentcall').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.rentModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/rentcall';
            res.render(model.view, model);
        });
    });

    router.route('/recovery1').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.rentModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/recovery1';
            res.render(model.view, model);
        });
    });

    router.route('/recovery2').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.rentModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/recovery2';
            res.render(model.view, model);
        });
    });

    router.route('/recovery3').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.rentModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/recovery3';
            res.render(model.view, model);
        });
    });

    router.route('/paymentorder').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.rentModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/paymentorder';
            res.render(model.view, model);
        });
    });

    router.route('/insurance').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/insurance';
            res.render(model.view, model);
        });
    });

    router.route('/guarantycertificate').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/guarantycertificate';
            res.render(model.view, model);
        });
    });

    router.route('/guarantypaybackcertificate').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/guarantypaybackcertificate';
            res.render(model.view, model);
        });
    });

    router.route('/guarantyrequest').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/guarantyrequest';
            res.render(model.view, model);
        });
    });

    router.route('/contract').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/contract';
            res.render(model.view, model);
        });
    });

    router.route('/customcontract').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/customcontract';
            res.render(model.view, model);
        });
    });

    router.route('/domcontract').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/domcontract';
            res.render(model.view, model);
        });
    });

    router.route('/checklist').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function(req, res) {
        printManager.renderModel(req, res, function(errors, model) {
            model.config = config;
            model.view = 'printable/checklist';
            res.render(model.view, model);
        });
    });
}

module.exports = PAGES;
