const express = require('express');
const config = require('../../config');
const rs = require('./requeststrategy');
const printManager = require('../managers/printmanager');

const printRouter = express.Router();

printRouter.use(rs.restrictedAreaAndRedirect);

// Print
printRouter.get('/invoice', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.rentModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/invoice';
        res.render(model.view, model);
    });
});

printRouter.get('/rentcall', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.rentModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/rentcall';
        res.render(model.view, model);
    });
});

printRouter.get('/recovery1', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.rentModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/recovery1';
        res.render(model.view, model);
    });
});

printRouter.get('/recovery2', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.rentModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/recovery2';
        res.render(model.view, model);
    });
});

printRouter.get('/recovery3', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.rentModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/recovery3';
        res.render(model.view, model);
    });
});

printRouter.get('/paymentorder', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.rentModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/paymentorder';
        res.render(model.view, model);
    });
});

printRouter.get('/insurance', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/insurance';
        res.render(model.view, model);
    });
});

printRouter.get('/guarantycertificate', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/guarantycertificate';
        res.render(model.view, model);
    });
});

printRouter.get('/guarantypaybackcertificate', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/guarantypaybackcertificate';
        res.render(model.view, model);
    });
});

printRouter.get('/guarantyrequest', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/guarantyrequest';
        res.render(model.view, model);
    });
});

printRouter.get('/contract', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/contract';
        res.render(model.view, model);
    });
});

printRouter.get('/customcontract', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/customcontract';
        res.render(model.view, model);
    });
});

printRouter.get('/domcontract', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/domcontract';
        res.render(model.view, model);
    });
});

printRouter.get('/checklist', rs.mustRealmSetAndRedirect, function(req, res) {
    printManager.renderModel(req, res, function(errors, model) {
        model.config = config;
        model.view = 'printable/checklist';
        res.render(model.view, model);
    });
});

const router = express.Router();
router.use('/print', printRouter);
module.exports = router;
