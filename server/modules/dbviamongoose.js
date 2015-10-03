'use strict';

var mongoose = require('mongoose'),
    logger = require('winston'),
    dbName = process.env.SELFHOSTED_DBNAME || 'demodb',
    dbUrl = 'mongodb://localhost/'+dbName,
    self = this;

var createModels = function () {
    self.models = {};
    // ---------------------
    // Account
    // ---------------------
    self.models.Account = mongoose.model('Account', {
        email:     { type: String, lowercase: true },
        password:  String,
        firstname: String,
        lastname:  String,
        creation:  { type: Date, default: Date.now }
    }, 'accounts');

    // ---------------------
    // Realm
    // ---------------------
    self.models.Realm = mongoose.model('Realm', {
        name:     { type: String, lowercase: true },
        creation:  { type: Date, default: Date.now },
        administrator:  { type: String, lowercase: true },
        user1:  { type: String, lowercase: true },
        user2:  { type: String, lowercase: true },
        user3:  { type: String, lowercase: true },
        user4:  { type: String, lowercase: true },
        user5:  { type: String, lowercase: true },
        user6:  { type: String, lowercase: true },
        user7:  { type: String, lowercase: true },
        user8:  { type: String, lowercase: true },
        user9:  { type: String, lowercase: true },
        user10:  { type: String, lowercase: true },
        renter: { type: String },
        company: { type: String },
        legalForm: { type: String },
        capital: { type: Number },
        rcs: { type: String },
        vatNumber: { type: String },
        street1: { type: String },
        street2: { type: String },
        zipCode: { type: String },
        city: { type: String },
        contact: { type: String },
        phone1: { type: String },
        phone2: { type: String },
        email: { type: String, lowercase: true },
        bank: { type: String },
        rib: { type: String }
    }, 'realms');
};

module.exports.init = function() {
    if (!self.models) {
        logger.info('connecting database via mongoose...');
        mongoose.connect(dbUrl);
        logger.info('database connected.');
        createModels();
    } else {
        logger.info('database already connected');
    }
};

module.exports.models = self.models;