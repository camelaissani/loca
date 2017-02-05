import math from 'mathjs';

export default function(contract, beginDate, includedEndDate, payments, previousRent, rent) {
    const preTaxAmount = rent.preTaxAmounts.amounts.reduce((total, preTaxAmount) => total + preTaxAmount, 0);
    const charges = rent.charges.amounts.reduce((total, amount) => total + amount, 0);
    const discount = rent.discounts.amounts.reduce((total, amount) => total + amount, 0);
    const vat = math.round(rent.vat.amounts.reduce((total, amount) => total + amount, 0), 2);

    rent.total.preTaxAmount = preTaxAmount;
    rent.total.charges = charges;
    rent.total.discount = discount;
    rent.total.vat = vat;
    rent.total.grandTotal = math.round(preTaxAmount + charges - discount + vat + rent.balance, 2);

    return rent;
}
