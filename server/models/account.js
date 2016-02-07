'use strict';

var db = require('./db'),
    OF = require('./objectfilter');

function AccountModel() {
    this.collection = 'accounts';
    db.addCollection(this.collection);
    this.schema = new OF({
        email: String,
        password: String,
        firstname: String,
        lastname: String,
        creation: String
    });
}

AccountModel.prototype.findOne = function(email, callback) {
    db.listWithFilter(null, this.collection, {
        email: email.toLowerCase()
    }, function(errors, accounts) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!accounts || accounts.length === 0) {
            callback(['account not found']);
        } else {
            callback(null, accounts[0]);
        }
    });
};

AccountModel.prototype.findAll = function(callback) {
    db.list(null, this.collection, function(errors, accounts) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!accounts || accounts.length === 0) {
            callback(['account not found']);
        } else {
            callback(null, accounts);
        }
    });
};

AccountModel.prototype.add = function(account, callback) {
    var newAccount = this.schema.filter(account);
    db.add(null, this.collection, newAccount, function(errors, dbAccount) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            delete dbAccount.password;
            callback(null, dbAccount);
        }
    });
};

module.exports = new AccountModel();