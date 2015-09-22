'use strict';

var db = require('../modules/dbviamongoose');


var defaultValues = function (realm)  {

    return realm;
};

var buildViewData = function (realm) {
    var dataModel = {};

    dataModel.realm = realm || {};

    return dataModel;
};

module.exports.renderModel = function (req, res, callback) {
    var errors = [],
        realm = req.session.user.realm,
        model = {account: req.session.user};

    db.models.Realm.findOne({name: realm.name}, function (err, realmFound) {
        if (err) {
            errors.push(err);
        } else {
            Object.merge(model, buildViewData(realmFound));
        }
        callback(errors, model);
    });
};

module.exports.one = function (req, res) {
    var realm = req.session.user.realm;
        //model = {account: req.session.user};

    db.models.Realm.findOne({name: realm.name}, function (err, realmFound) {
        if (realmFound && !realmFound.manager) {
            realmFound.manager = realmFound.renter;
            delete realmFound.renter;
        }
        if (realmFound && !realmFound.siret) {
            realmFound.siret = realmFound.rcs;
            delete realmFound.rcs;
        }
        res.json(realmFound);
    });
};

module.exports.update = function (req, res) {
    var errors = [],
        realm = req.body;
    defaultValues(realm);
    db.models.Realm.update({name: realm.name}, realm, null,  function (err) {
        if (err) {
            errors.push(err);
        }
        res.json({errors: errors});
    });
};
