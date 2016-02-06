'use strict';

var Model = require('./model'),
    OF = require('./objectfilter');

function OccupantModel() {
    // Call super constructor
    Model.call(this, 'occupants');
    this.schema = new OF({
        _id: String,
        isCompany: Boolean,
        company: String,
        legalForm: String,
        siret: String,
        capital: Number,
        manager: String,
        name: String,
        street1: String,
        street2: String,
        zipCode: String,
        city: String,
        contacts: Array,
        contract: String,
        beginDate: String,
        endDate: String,
        terminationDate: String,
        guarantyPayback: Number,
        properties: Array,
        guaranty: Number,
        reference: String,
        isVat: Boolean,
        vatRatio: Number,
        discount: Number,
        rents: Object
    });
}

OccupantModel.prototype = Object.create(Model.prototype);
OccupantModel.prototype.constructor = OccupantModel;

module.exports = new OccupantModel();