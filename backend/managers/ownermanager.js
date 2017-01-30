'use strict';

var ownerModel = require('../models/owner');

function buildViewData(realm) {
    var dataModel = {};

    dataModel.realm = realm || {};

    return dataModel;
}

module.exports.renderModel = function (req, res, callback) {
    var realm = req.realm,
        model = {account: req.user},
        realmFound;

    ownerModel.findAll(realm, 'realms', function (errors, dbRealms) {
        if (errors) {
            callback(errors, model);
        } else {
            realmFound = buildViewData(dbRealms[0]);
            callback(null, Object.merge(model, realmFound));
        }
    });
};

module.exports.findOwner = function (realm, callback) {
    ownerModel.findOne(null, realm._id, function (errors, dbRealm) {
        if (errors) {
            callback(errors);
        } else {
            if (!dbRealm.manager) {
                dbRealm.manager = dbRealm.renter;
                delete dbRealm.renter;
            }
            if (dbRealm && !dbRealm.siret) {
                dbRealm.siret = dbRealm.rcs;
                delete dbRealm.rcs;
            }
            callback(null, dbRealm);
        }
    });
};

module.exports.update = function (req, res) {
    var realm = req.realm,
        owner = ownerModel.schema.filter(req.body);

    if (!owner._id) {
        owner.name = realm.name;
        ownerModel.add(realm, owner, function (errors) {
            res.json({errors: errors});
        });
    } else {
        ownerModel.update(realm, owner, function (errors) {
            res.json({errors: errors});
        });
    }
};
