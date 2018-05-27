'use strict';
const OF = require('./objectfilter');
const Model = require('./model');

class OwnerModel extends Model {
    constructor() {
        super('realms');
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
}

module.exports = new OwnerModel();
