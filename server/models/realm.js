'use strict';

var db = require('./db'),
    OF = require('./objectfilter');

function RealmModel() {
    this.collection = 'realms';
    this.schema = new OF({
        _id: String,
        administrator: String,
        bank: String,
        capital: Number,
        city: String,
        company: String,
        contact: String,
        creation: String,
        email: String,
        isCompany: Boolean,
        legalForm: String,
        manager: String,
        name: String,
        phone1: String,
        phone2: String,
        rcs: String,
        realmName: String,
        renter: String,
        rib: String,
        siret: String,
        street1: String,
        street2: String,
        user1: String,
        user2: String,
        user3: String,
        user4: String,
        user5: String,
        user6: String,
        user7: String,
        user8: String,
        user9: String,
        user10: String,
        vatNumber: String,
        zipCode: String
    });
}

RealmModel.prototype.findOne = function(id, callback) {
    db.findItemById(null, this.collection, id, function(errors, realms) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!realms || realms.length === 0) {
            callback(['realm not found']);
        } else {
            callback(null, realms[0]);
        }
    });
};

RealmModel.prototype.findAll = function(callback) {
    db.list(null, this.collection, function(errors, realms) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!realms || realms.length === 0) {
            callback(['realm not found']);
        } else {
            callback(null, realms);
        }
    });
};

RealmModel.prototype.add = function(realm, callback) {
    var newRealm = this.schema.filter(realm);
    db.add(null, this.collection, newRealm, function(errors, dbRealm) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null, dbRealm);
        }
    });
};

module.exports = new RealmModel();