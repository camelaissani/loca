'use strict';

var Model = require('./model'),
    OF = require('./objectfilter');

function OwnerModel() {
    Model.call(this, 'realms');
    this.schema = new OF({
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
}

OwnerModel.prototype = Object.create(Model.prototype);
OwnerModel.constructor = OwnerModel;

module.exports = new OwnerModel();