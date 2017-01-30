'use strict';

var Model = require('./model'),
    OF = require('./objectfilter'),
    logger = require('winston');

function AccountModel() {
    // Call super constructor
    Model.call(this, 'accounts');
    this.schema = new OF({
        email: String,
        password: String,
        firstname: String,
        lastname: String,
        creation: String
    });
}

AccountModel.prototype = Object.create(Model.prototype);
AccountModel.prototype.constructor = AccountModel;

AccountModel.prototype.findOne = function(email, callback) {
    Model.prototype.findFilter.call(this, null, {
        email: email.toLowerCase()
    }, function(errors, accounts) {
        if (errors) {
            callback(errors);
        } else if (!accounts || accounts.length === 0) {
            callback(null, null);
        } else {
            callback(null, accounts[0]);
        }
    });
};

AccountModel.prototype.add = function(item, callback) {
    Model.prototype.add.call(this, null, item, callback);
};

AccountModel.prototype.findAll = AccountModel.prototype.update = AccountModel.prototype.remove = function() {
    logger.error('method not implemented!');
};

module.exports = new AccountModel();