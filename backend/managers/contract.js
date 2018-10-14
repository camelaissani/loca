const moment = require('moment');
const BL = require('../businesslogic');

function create(contract) {
    const supportedFrequencies = ['hours', 'days', 'weeks', 'months', 'years'];

    if (!contract.frequency || supportedFrequencies.indexOf(contract.frequency) === -1) {
        throw Error(`unsupported frequency, should be one of these ${supportedFrequencies.join(', ')}`);
    }

    if (!contract.properties || contract.properties.length === 0) {
        throw Error('properties not defined or empty');
    }

    const momentBegin = moment(contract.begin, 'DD/MM/YYYY HH:mm');
    const momentEnd = moment(contract.end, 'DD/MM/YYYY HH:mm');
    let momentTermination;
    if (contract.termination) {
        momentTermination = moment(contract.termination, 'DD/MM/YYYY HH:mm');
        if (!momentTermination.isBetween(momentBegin, momentEnd, 'minutes', '[]')) {
            throw Error('termination date is out of the contract time frame');
        }
    }

    if (momentEnd.isSameOrBefore(momentBegin)) {
        throw Error('contract duration is not correct, check begin/end contract date');
    }

    const terms = Math.round(momentEnd.diff(momentBegin, contract.frequency, true));
    Object.assign(
        contract,
        {
            terms,
            rents: []
        }
    );

    const current = moment(momentBegin);
    let previousRent;
    while(current.isSameOrBefore(momentTermination || momentEnd)) {
        const rent = BL.computeRent(contract, current.format('DD/MM/YYYY HH:mm'), previousRent);
        contract.rents.push(rent);
        previousRent = rent;
        current.add(1, contract.frequency);
    }
    return contract;
}

function update(inputContract, modification) {
    const modifiedContract = JSON.parse(JSON.stringify(inputContract));
    Object.assign(
        modifiedContract,
        modification
    );

    const momentBegin = moment(modifiedContract.begin, 'DD/MM/YYYY HH:mm');
    const momentEnd = moment(modifiedContract.end, 'DD/MM/YYYY HH:mm');
    let momentTermination;
    if (modifiedContract.termination) {
        momentTermination = moment(modifiedContract.termination, 'DD/MM/YYYY HH:mm');
    }

    // Check possible lost payments
    _checkLostPayments(momentBegin, momentTermination || momentEnd, inputContract);

    const updatedContract = create(modifiedContract);

    inputContract.rents
        .filter(rent => _isPayment(rent) || rent.discounts.some(discount => discount.origin === 'settlement'))
        .forEach(paidRent => {
            payTerm(updatedContract, moment(String(paidRent.term), 'YYYYMMDDHH').format('DD/MM/YYYY HH:mm'), {
                payments: paidRent.payments,
                discounts: paidRent.discounts.filter(discount => discount.origin === 'settlement')
            });
        });

    return updatedContract;
}

function renew(contract) {
    const momentEnd = moment(contract.end, 'DD/MM/YYYY HH:mm');
    const momentNewEnd = moment(momentEnd).add(contract.terms, contract.frequency);

    return Object.assign(
        update(contract, {end: momentNewEnd.format('DD/MM/YYYY HH:mm')}),
        {
            terms: contract.terms
        }
    );
}

function terminate(inputContract, termination) {
    return update(inputContract, {termination});
}

function payTerm(contract, term, settlements) {
    const current = moment(term, 'DD/MM/YYYY HH:mm');
    const momentBegin = moment(contract.begin, 'DD/MM/YYYY HH:mm');
    const momentEnd = moment(contract.termination || contract.end, 'DD/MM/YYYY HH:mm');

    if (!current.isBetween(momentBegin, momentEnd, contract.frequency, '[]')) {
        throw Error('payment term is out of the contract time frame');
    }

    const previousTerm = moment(current).subtract('1', contract.frequency);
    const previousRentIndex = contract.rents.findIndex(rent => rent.term === Number(previousTerm.format('YYYYMMDDHH')));

    let previousRent = previousRentIndex >-1 ? contract.rents[previousRentIndex] : null;
    contract.rents.forEach((rent, index) => {
        if (index > previousRentIndex) {
            contract.rents[index] = BL.computeRent(contract, current.format('DD/MM/YYYY HH:mm'), previousRent, settlements);
            previousRent = contract.rents[index];
            current.add(1, contract.frequency);
            settlements = null;
        }
    });

    return contract;
}

function _isPayment(rent) {
    return !!(rent.payments.length > 0 && rent.payments.some(payment => payment.amount && payment.amount > 0));
}

function _checkLostPayments(momentBegin, momentEnd, contract) {
    const lostPayments =
    contract.rents
        .filter(rent =>
            !moment(rent.term, 'YYYYMMDDHH').isBetween(momentBegin, momentEnd, contract.frequency, '[]') &&
            _isPayment(rent))
        .map(rent => String(rent.term) + ' ' + rent.payments.map(payment => payment.amount).join(' + '));

    if (lostPayments.length > 0) {
        throw Error(`Some payments will be lost because they are out of the contract time frame:\n${lostPayments.join('\n')}`);
    }
}

module.exports = {
    create,
    update,
    terminate,
    renew,
    payTerm
};
