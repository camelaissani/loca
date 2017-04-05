import moment from 'moment';
import BL from '../businesslogic';

function create(begin, end, frequency, properties) {
    const supportedFrequencies = ['hours', 'days', 'weeks', 'months', 'years'];

    if (supportedFrequencies.indexOf(frequency) === -1) {
        throw Error(`unsupported frequency, should be one of these ${supportedFrequencies.join(', ')}`);
    }

    if (!properties || properties.length === 0) {
        throw Error('properties not defined or empty');
    }

    const momentBegin = moment(begin, 'DD/MM/YYYY HH:mm');
    const momentEnd = moment(end, 'DD/MM/YYYY HH:mm');

    if (momentEnd.isSameOrBefore(momentBegin)) {
        throw Error('contract duration is not correct, check begin/end contract date');
    }
    const terms = Math.round(momentEnd.diff(momentBegin, frequency, true));
    const contract = {
        begin,
        end,
        frequency,
        terms,
        properties,
        rents: []
    };

    const current = moment(momentBegin);
    let previousRent;
    while(current.isSameOrBefore(momentEnd)) {
        const rent = BL.computeRent(contract, current.format('DD/MM/YYYY HH:mm'), previousRent);
        contract.rents.push(rent);
        previousRent = rent;
        current.add(1, contract.frequency);
    }
    return contract;
}

function renew(contract) {
    const momentEnd = moment(contract.end, 'DD/MM/YYYY HH:mm');
    const momentNewEnd = moment(momentEnd).add(contract.terms, contract.frequency);

    contract.end = momentEnd.format('DD/MM/YYYY HH:mm');

    const current = moment(momentEnd).add(1, contract.frequency);
    let previousRent = contract.rents.slice(-1)[0];
    while(current.isSameOrBefore(momentNewEnd)) {
        const rent = BL.computeRent(contract, current.format('DD/MM/YYYY HH:mm'), previousRent);
        contract.rents.push(rent);
        previousRent = rent;
        current.add(1, contract.frequency);
    }
    return contract;
}

function update(contract) {
    const momentBegin = moment(contract.begin, 'DD/MM/YYYY HH:mm');
    const momentEnd = moment(contract.end, 'DD/MM/YYYY HH:mm');

    const paidRents = contract.rents.filter(rent => rent.payments.length > 0);

    const lostPayments = paidRents
    .filter(paidRent => !(paidRent.term >= Number(momentBegin.format('YYYYMMDDHH'))
                        && paidRent.term <= Number(momentEnd.format('YYYYMMDDHH'))))
    .map(paidRent => String(paidRent.term) + ' ' + paidRent.payments.map(payment => payment.amount).join(' + '));

    if (lostPayments.length > 0) {
        throw Error(`Some payments will be loose because they will be out of the contract time frame:\n${lostPayments.join('\n')}`);
    }

    const newContract = create(contract.begin, contract.end, contract.frequency, contract.properties);
    paidRents.forEach(paidRent => {
        payTerm(newContract, moment(String(paidRent.term), 'YYYYMMDDHH').format('DD/MM/YYYY HH:mm'), {
            payments: paidRent.payments,
            discounts: paidRent.discounts
        });
    });
    return newContract;
}

function payTerm(contract, term, settlements) {
    const current = moment(term, 'DD/MM/YYYY HH:mm');
    const previousTerm = moment(current).subtract('1', contract.frequency);
    const previousRentIndex = contract.rents.findIndex(rent => rent.term === Number(previousTerm.format('YYYYMMDDHH')));

    let previousRent = previousRentIndex >-1 ? contract.rents[previousRentIndex] : null;
    contract.rents.forEach((rent, index) => {
        if (index > previousRentIndex) {
            contract.rents[index] = BL.computeRent(contract, current.format('DD/MM/YYYY HH:mm'), previousRent, settlements);
            previousRent = contract.rents[index];
            settlements = null;
        }
    });
}

export default {
    create,
    renew,
    update,
    payTerm
};
