'use strict';

var db = require('../modules/db'),
    OF = require('../modules/objectfilter');

var schema = new OF({
    _id: String,
    isCompany: Boolean,
    company: String,
    legalForm: String,
    siret: String,
    capital: Number,
    vatNumber: String,
    manager: String,
    street1: String,
    street2: String,
    zipCode: String,
    city: String,
    contact: String,
    phone1: String,
    phone2: String,
    email: String,
    bank: String,
    rib: String
});

function buildViewData(realm) {
    var dataModel = {};

    dataModel.realm = realm || {};

    return dataModel;
}

module.exports.renderModel = function (req, res, callback) {
    var realm = req.session.user.realm,
        model = {account: req.session.user},
        realmFound;

    db.list(realm, 'realms', function (errors, realms) {
        if ((errors && errors.length > 0) || (!realms || realms.length === 0)) {
            callback(errors, model);
        } else {
            realmFound = buildViewData(realms[0]);
            callback([], Object.merge(model, realmFound));
        }
    });
};

module.exports.findOwner = function (realm, callback) {
    var realmFound;
    db.listWithFilter(null, 'realms', {name: realm.name}, function (errors, realms) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!realms || realms.length === 0) {
            callback([], {});
        } else {
            realmFound = realms[0];
            if (realmFound && !realmFound.manager) {
                realmFound.manager = realmFound.renter;
                delete realmFound.renter;
            }
            if (realmFound && !realmFound.siret) {
                realmFound.siret = realmFound.rcs;
                delete realmFound.rcs;
            }
            callback([], realmFound);
        }
    });
};

module.exports.update = function (req, res) {
    var realm = req.session.user.realm,
        owner = schema.filter(req.body);

    if (!owner._id) {
        owner.name = realm.name;
        db.add(realm, 'realms', owner, function (errors) {
            res.json({errors: errors});
        });
    } else {
        db.update(realm, 'realms', owner, function (errors) {
            res.json({errors: errors});
        });
    }
};
