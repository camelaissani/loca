'use strict';

var configdir = process.env.OPENSHIFT_DATA_DIR || process.env.SELFHOSTED_CONFIG_DIR || __dirname + '/..',
    config = require(configdir + '/config'),
    rs = require('./requeststrategy'),
    loginManager = require('./managers/loginmanager'),
    printManager = require('./managers/printmanager'),
    logger = require('winston');

logger.info('Loaded configuration from ' + configdir + '/config');
logger.info('Configuration content:', config);

function render(model, res) {
    model.webSiteInfo = config.webSiteInfo;
    res.render('index', model);
}

function PAGES(router) {
    router.route('/').get(rs.mustSessionLessArea, function (req, res) {
        render({view: 'website', account: null, errors: null}, res);
    });

    router.route('/login').get(rs.mustSessionLessArea, function (req, res) {
        render({view: 'login', account: null, errors: null}, res);
    });

    router.route('/logindemo').get(rs.mustSessionLessArea, function (req, res) {
        loginManager.loginDemo(req, res);
    });

    router.route('/signup').get(rs.mustSessionLessArea, function (req, res) {
        render({view: 'signup', account: null, errors: null}, res);
    });

    router.route('/selectrealm').get(rs.restrictedAreaAndRedirect, function (req, res) {
        render({view: 'selectrealm',  account: req.session.user}, res);
    });

    router.route('/loggedin').post(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect,
        function (req, res) {
            res.redirect('/index');
        }
    );

    router.route('/loggedin').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect,
        function (req, res) {
            res.redirect('/index');
        }
    );

    router.route('/signedin').post(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect,
        function (req, res) {
            res.redirect('/login');
        }
    );

    router.route('/index').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect,
        function (req, res) {
            var model = {
                    view: req.param('view'),
                    account: req.session.user
                },
                authorizedViews = ['dashboard', 'rent', 'occupant', 'property', 'account', 'owner', 'website'],
                isCurrentViewAuthorized = (authorizedViews.indexOf(model.view) !== -1);

            if (!isCurrentViewAuthorized) {
                res.redirect('/index?view=' + authorizedViews[0]);
                logger.info('View ' + model.view +' not authorized. Redirect to ' + '/index?view=' + authorizedViews[0]);
                return;
            }
            render(model, res);
        });

    router.route('/page/dashboard').get(rs.restrictedArea, rs.mustRealmSet, function (req, res) {
        res.render('dashboard', {account: req.session.user});
    });

    router.route('/page/rent').get(rs.restrictedArea, rs.mustRealmSet, function (req, res) {
        res.render('rent');
    });

    router.route('/page/occupant').get(rs.restrictedArea, rs.mustRealmSet, function (req, res) {
        res.render('occupant');
    });

    router.route('/page/property').get(rs.restrictedArea, rs.mustRealmSet, function (req, res) {
        res.render('property');
    });

    router.route('/page/owner').get(rs.restrictedArea, rs.mustRealmSet, function (req, res) {
        res.render('owner');
    });

    router.route('/page/account').get(rs.restrictedArea, rs.mustRealmSet, function (req, res) {
        res.render('account');
    });

    // Print
    router.route('/invoice').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/invoice';
            res.render(model.view, model);
        });
    });

    router.route('/rentcall').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/rentcall';
            res.render(model.view, model);
        });
    });

    router.route('/recovery1').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/recovery1';
            res.render(model.view, model);
        });
    });

    router.route('/recovery2').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/recovery2';
            res.render(model.view, model);
        });
    });

    router.route('/recovery3').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/recovery3';
            res.render(model.view, model);
        });
    });

    router.route('/paymentorder').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/paymentorder';
            res.render(model.view, model);
        });
    });

    router.route('/insurance').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/insurance';
            res.render(model.view, model);
        });
    });

    router.route('/guarantycertificate').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/guarantycertificate';
            res.render(model.view, model);
        });
    });

    router.route('/guarantypaybackcertificate').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/guarantypaybackcertificate';
            res.render(model.view, model);
        });
    });

    router.route('/guarantyrequest').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/guarantyrequest';
            res.render(model.view, model);
        });
    });

    router.route('/contract').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/contract';
            res.render(model.view, model);
        });
    });

    router.route('/customcontract').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/customcontract';
            res.render(model.view, model);
        });
    });

    router.route('/domcontract').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/domcontract';
            res.render(model.view, model);
        });
    });

    router.route('/checklist').get(rs.restrictedAreaAndRedirect, rs.mustRealmSetAndRedirect, function (req, res) {
        printManager.renderModel(req, res, function (errors, model) {
            model.view = 'printable/checklist';
            res.render(model.view, model);
        });
    });
}

module.exports = PAGES;