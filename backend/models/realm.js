'use strict';
const OF = require('./objectfilter');
const Model = require('./model');
const logger = require('winston');

class RealmModel extends Model {
    constructor() {
        super('realms');
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

    findOne(id, callback) {
        super.findOne(null, id, function(errors, realm) {
            if (errors) {
                callback(errors);
            } else if (!realm) {
                callback(['realm not found']);
            } else {
                callback(null, realm);
            }
        });
    }

    findAll(callback) {
        super.findAll(null, function(errors, realms) {
            if (errors) {
                callback(errors);
            } else if (!realms || realms.length === 0) {
                callback(null, null);
            } else {
                callback(null, realms);
            }
        });
    }

    findByEmail(email, callback) {
        super.findAll(null, function(errors, realms) {
            if (errors) {
                callback(errors);
            } else if (!realms || realms.length === 0) {
                callback(null, null);
            } else {
                const realmsFound = realms.filter(function(realm) {
                    if (realm.administrator === email ||
                        realm.user1 === email ||
                        realm.user2 === email ||
                        realm.user3 === email ||
                        realm.user4 === email ||
                        realm.user5 === email ||
                        realm.user6 === email ||
                        realm.user7 === email ||
                        realm.user8 === email ||
                        realm.user9 === email ||
                        realm.user10 === email) {
                        return true;
                    }
                });

                callback(null, realmsFound);
            }
        });
    }

    add(realm, callback) {
        super.add(null, realm, callback);
    }

    update() {
        logger.error('method not implemented!');
    }

    remove() {
        logger.error('method not implemented!');
    }
}

module.exports = new RealmModel();
