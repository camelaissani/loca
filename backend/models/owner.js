'use strict';
import OF from './objectfilter';
import Model from './model';

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

export default new OwnerModel();
