const math = require('mathjs');

module.exports = function(contract, rentDate, previousRent, settlements, rent) {
    const preTaxAmount = rent.preTaxAmounts.reduce((total, preTaxAmount) => total + preTaxAmount.amount, 0);
    const charges = rent.charges.reduce((total, charges) => total + charges.amount, 0);
    const debts = rent.debts.reduce((total, debt) => total + debt.amount, 0);
    const discount = rent.discounts.reduce((total, discount) => total + discount.amount, 0);
    const vat = math.round(rent.vats.reduce((total, vat) => total + vat.amount, 0), 2);
    const payment = rent.payments.reduce((total, payment) => total + payment.amount, 0);

    rent.total.preTaxAmount = preTaxAmount;
    rent.total.charges = charges;
    rent.total.debts = debts;
    rent.total.discount = discount;
    rent.total.vat = vat;
    rent.total.grandTotal = math.round(preTaxAmount + charges + debts - discount + vat + rent.total.balance, 2);
    rent.total.payment = payment;

    return rent;
};
