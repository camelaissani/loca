export default function(contract, beginDate, includedEndDate, payments, previousRent, rent) {
    if (contract.vatRate) {
        const rate = contract.vatRate || 0;

        rent.preTaxAmounts.amounts.forEach((preTaxAmount, index) => {
            rent.vat.descriptions.push(`${rent.preTaxAmounts.descriptions[index]} T.V.A. (${rate*100}%)`);
            rent.vat.amounts.push(preTaxAmount*rate);
            rent.vat.rates.push(rate);
        });

        rent.charges.amounts.forEach((charges, index) => {
            rent.vat.descriptions.push(`${rent.charges.descriptions[index]} T.V.A. (${rate*100}%)`);
            rent.vat.amounts.push(charges*rate);
            rent.vat.rates.push(rate);
        });

        rent.discounts.amounts.forEach((discount, index) => {
            rent.vat.descriptions.push(`${rent.discounts.descriptions[index]} T.V.A. (${rate*100}%)`);
            rent.vat.amounts.push(discount*rate*(-1));
            rent.vat.rates.push(rate);
        });
    }

    return rent;
}
