'use strict';

var Model = require('./model'),
    OF = require('./objectfilter'),
    logger = require('winston');

function RealmModel() {
    // Call super constructor
    Model.call(this, 'realms');
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

RealmModel.prototype = Object.create(Model.prototype);
RealmModel.prototype.constructor = RealmModel;

RealmModel.prototype.findOne = function(id, callback) {
    Model.prototype.findOne.call(this, null, id, function(errors, realm) {
        if (errors) {
            callback(errors);
        } else if (!realm) {
            callback(['realm not found']);
        } else {
            callback(null, realm);
        }
    });
};


RealmModel.prototype.findAll = function(callback) {
    Model.prototype.findAll.call(this, null, function(errors, realms) {
        if (errors) {
            callback(errors);
        } else if (!realms || realms.length === 0) {
            callback(['realm not found']);
        } else {
            callback(null, realms);
        }
    });
};

RealmModel.prototype.add = function(realm, callback) {
    Model.prototype.add.call(this, null, realm, callback);
};

RealmModel.prototype.update = RealmModel.prototype.remove = function() {
    logger.error('method not implemented!');
};

module.exports = new RealmModel();