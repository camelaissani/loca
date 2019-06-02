const OF = require('./objectfilter');

class RentModel {
    constructor() {
        this.paymentSchema = new OF({
            _id: String,
            month: Number,
            year: Number,
            payment: Number,
            paymentType: String,
            paymentReference: String,
            paymentDate: String,
            description: String,
            promo: Number,
            notepromo: String,
            extracharge: Number,
            noteextracharge: String
        });

        this.rentSchema = new OF({
            month: Number,
            year: Number,
            discount: Number,
            balance: Number,
            isVat: Boolean,
            vatRatio: Number,
            vatAmount: Number,
            totalAmount: Number,
            payment: Number,
            paymentType: String,
            paymentReference: String,
            paymentDate: String,
            description: String,
            promo: Number,
            notepromo: String,
            extracharge: Number,
            noteextracharge: String
        });
    }
}

module.exports = new RentModel();
