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

function update(inputContract, {begin, end, termination, properties}) {
    const contract = JSON.parse(JSON.stringify(inputContract));
    const inputProperties = properties || contract.properties;
    const momentBegin = moment(begin || contract.begin, 'DD/MM/YYYY HH:mm');
    const momentEnd = moment(end || contract.end, 'DD/MM/YYYY HH:mm');
    let momentTermination;

    // Check termination date
    if (termination || contract.termination) {
        momentTermination = moment(termination || contract.termination, 'DD/MM/YYYY HH:mm');
    }

    if (momentTermination && !momentTermination.isBetween(momentBegin, momentEnd, 'minutes', '[]')) {
        throw Error('termination date is out of the contract time frame');
    }

    // Check payments
    _checkLostPayments(momentBegin, momentTermination || momentEnd, contract.rents);

    // update contract
    const tmpContract = create(
        momentBegin.format('DD/MM/YYYY HH:mm'),
        (momentTermination || momentEnd).format('DD/MM/YYYY HH:mm'), // limit rent creation if termination date set
        contract.frequency,
        inputProperties
    );

    const paidRents = contract.rents.filter(rent => rent.payments.length > 0);
    paidRents.forEach(paidRent => {
        payTerm(tmpContract, moment(String(paidRent.term), 'YYYYMMDDHH').format('DD/MM/YYYY HH:mm'), {
            payments: paidRent.payments,
            discounts: paidRent.discounts
        });
    });
    contract.begin = tmpContract.begin;
    contract.end = momentEnd.format('DD/MM/YYYY HH:mm'); // from momentEnd to avoid termination date here
    contract.properties = tmpContract.properties;
    contract.rents = tmpContract.rents;
    if (termination) {
        contract.termination = termination;
    }
    return contract;
}

function renew(contract) {
    const momentEnd = moment(contract.end, 'DD/MM/YYYY HH:mm');
    const momentNewEnd = moment(momentEnd).add(contract.terms, contract.frequency);

    return update(contract, {end: momentNewEnd.format('DD/MM/YYYY HH:mm')});
}

function terminate(inputContract, termination) {
    return update(inputContract, {termination});
}

function payTerm(contract, term, settlements) {
    const current = moment(term, 'DD/MM/YYYY HH:mm');
    const momentBegin = moment(contract.begin, 'DD/MM/YYYY HH:mm');
    const momentEnd = moment(contract.termination || contract.end, 'DD/MM/YYYY HH:mm');

    if (!current.isBetween(momentBegin, momentEnd, 'minutes', '[]')) {
        throw Error('payment term is out of the contract time frame');
    }

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

    return contract;
}

function _checkLostPayments(momentBegin, momentEnd, rents) {
    const lostPayments =
    rents.filter(rent => rent.payments.length > 0
                    && !(rent.term >= Number(momentBegin.format('YYYYMMDDHH'))
                    && rent.term <= Number(momentEnd.format('YYYYMMDDHH'))))
    .map(rent => String(rent.term) + ' ' + rent.payments.map(payment => payment.amount).join(' + '));

    if (lostPayments.length > 0) {
        throw Error(`Some payments will be lost because they are out of the contract time frame:\n${lostPayments.join('\n')}`);
    }
}

export default {
    create,
    update,
    terminate,
    renew,
    payTerm
};
