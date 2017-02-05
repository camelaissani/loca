import moment from 'moment';

export default function(contract, beginDate, includedEndDate, payments, previousRent, rent) {
    const beginRentMoment = moment(beginDate, 'DD/MM/YYYY').startOf('day');
    const endRentMoment = moment(includedEndDate, 'DD/MM/YYYY').endOf('month').endOf('day');

    rent.month = beginRentMoment.month() + 1; // 0 based
    rent.year = beginRentMoment.year();

    contract.properties.filter((property) => {
        const entryMoment = moment(property.entryDate, 'DD/MM/YYYY').startOf('day');
        const exitMoment = moment(property.exitDate, 'DD/MM/YYYY').endOf('day');

        return beginRentMoment.isBetween(entryMoment, exitMoment, 'day', '[]')
               && endRentMoment.isBetween(entryMoment, exitMoment, 'day', '[]');
    }).forEach(function (property) {
        const preTaxAmount = property.price || 0;
        const charges = property.expense || 0;

        rent.preTaxAmounts.descriptions.push(property.name);
        rent.preTaxAmounts.amounts.push(preTaxAmount);
        rent.charges.descriptions.push(`charges ${property.name}`);
        rent.charges.amounts.push(charges);
    });
    return rent;
}
