var db = require('../modules/db'),
    OF = require('../modules/objectfilter');

var schema = new OF({
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

module.exports.findOne = function(id, callback) {
    db.findItemById(null, 'realms', id, function(errors, realms) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!realms || realms.length === 0) {
            callback(['realm not found']);
        } else {
            callback(null, realms[0]);
        }
    });
};

module.exports.findAll = function(callback) {
    db.list(null, 'realms', function(errors, realms) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!realms || realms.length === 0) {
            callback(['realm not found']);
        } else {
            callback(null, realms);
        }
    });
};

module.exports.add = function(realm, callback) {
    var newRealm = schema.filter(realm);
    db.add(null, 'realms', newRealm, function(errors, dbRealm) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null, dbRealm);
        }
    });
};