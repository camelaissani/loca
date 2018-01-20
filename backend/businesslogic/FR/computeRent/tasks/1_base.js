import moment from 'moment';

export default function(contract, rentDate, previousRent, settlements, rent) {
    const currentMoment = moment(rentDate, 'DD/MM/YYYY HH:mm');
    rent.term = Number(currentMoment.format('YYYYMMDDHH'));
    rent.month = currentMoment.month() + 1; // 0 based
    rent.year = currentMoment.year();

    contract.properties.filter((property) => {
        const entryMoment = moment(property.entryDate, 'DD/MM/YYYY').startOf('day');
        const exitMoment = moment(property.exitDate, 'DD/MM/YYYY').endOf('day');

        return currentMoment.isBetween(entryMoment, exitMoment, contract.frequency, '[]');
    }).forEach(function (property) {
        if (property.property) {
            const name = property.property.name || '';
            const preTaxAmount = property.property.price || 0;
            const charges = property.property.expense || 0;

            rent.preTaxAmounts.push({
                description: name,
                amount: preTaxAmount
            });

            rent.charges.push({
                description: `charges ${name}`,
                amount: charges
            });
        }
    });
    return rent;
}
