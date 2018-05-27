/* eslint-env node, mocha */
const assert = require('assert');
const Contract = require('../../backend/managers/contract');

describe('contract functionalities', () => {
    it('create contract', () => {
        const contract = Contract.create({
            begin: '01/01/2017 00:00',
            end: '31/12/2025 23:59',
            frequency: 'months',
            properties: [{}, {}]
        });

        assert.strictEqual(contract.terms, 108, 'incorrect number of terms');
        assert.strictEqual(contract.rents.length, 108, 'incorrect number of rents');

        assert.throws(() => {
            Contract.create({
                begin: '01/01/2017 00:00',
                end: '01/01/2017 03:00',
                frequency: 'hours'
            });
        });

        assert.throws(() => {
            Contract.create({
                begin: '01/01/2017 00:00',
                end: '01/01/2016 03:00',
                frequency: 'hours',
                properties: [{}, {}]
            });
        });

        assert.throws(() => {
            Contract.create();
        });
    });

    it('check term frequency', () => {
        let c1;
        let c2;
        let c3;
        let c4;
        let c5;

        assert.doesNotThrow(() => {
            c1 = Contract.create({ begin: '01/01/2017 00:00', end: '01/01/2017 03:00', frequency: 'hours', properties: [{}, {}]});
            c2 = Contract.create({ begin: '01/01/2017 00:00', end: '31/01/2017 23:59', frequency: 'days', properties: [{}, {}]});
            c3 = Contract.create({ begin: '01/01/2017 00:00', end: '14/01/2017 23:59', frequency: 'weeks', properties: [{}, {}]});
            c4 = Contract.create({ begin: '01/01/2017 00:00', end: '31/12/2017 23:59', frequency: 'months', properties: [{}, {}]});
            c5 = Contract.create({ begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'years', properties: [{}, {}]});
        });

        assert.strictEqual(c1.terms, 3, 'incorrect number of terms');
        assert.strictEqual(c2.terms, 31, 'incorrect number of terms');
        assert.strictEqual(c3.terms, 2, 'incorrect number of terms');
        assert.strictEqual(c4.terms, 12, 'incorrect number of terms');
        assert.strictEqual(c5.terms, 9, 'incorrect number of terms');

        assert.throws(() => {
            Contract.create({ begin: '01/01/2017 00:00', end: '01/01/2017 03:00', frequency: 'blabla', properties: [{}, {}]});
        });
    });

    it('renew contract based on initial number of terms', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        const newContract = Contract.renew(contract);

        assert.strictEqual(newContract.terms, 108, 'incorrect number of terms');
        assert.strictEqual(newContract.rents.length, 108*2, 'incorrect number of rents');
    });

    it('update contract change duration', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        const newContract = Contract.update(contract, {end: '31/03/2026 23:59'});

        assert.strictEqual(newContract.terms, 108 + 3, 'incorrect number of terms');
        assert.strictEqual(newContract.rents.length, 108 + 3, 'incorrect number of rents');

        const newContract2 = Contract.update(contract, {begin: '01/01/2018 00:00'});
        assert.strictEqual(newContract2.terms, 108 - 12, 'incorrect number of terms');
        assert.strictEqual(newContract2.rents.length, 108 - 12, 'incorrect number of rents');
    });

    it('terminate contract', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        const newContract = Contract.terminate(contract, '31/12/2017 23:59');

        assert.strictEqual(newContract.terms, 108, 'incorrect number of terms');
        assert.strictEqual(newContract.rents.length, 12, 'incorrect number of rents');
        assert.strictEqual(newContract.begin, '01/01/2017 00:00', 'begin contract date incorrect');
        assert.strictEqual(newContract.end, '31/12/2025 23:59', 'end contract date incorrect');
        assert.strictEqual(newContract.termination, '31/12/2017 23:59', 'termination contract date incorrect');

        // after end date of contract
        assert.throws(() => {
            Contract.terminate(contract, '31/12/2026 23:59');
        });

        // before begin date of contract
        assert.throws(() => {
            Contract.terminate(contract, '01/01/2016 00:00');
        });
    });

    it('update termination date', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        const tmpContract = Contract.terminate(contract, '31/12/2017 23:59');
        const longerContract = Contract.terminate(tmpContract, '31/12/2018 23:59');

        assert.strictEqual(longerContract.terms, 108, 'incorrect number of terms');
        assert.strictEqual(longerContract.rents.length, 24, 'incorrect number of rents');
        assert.strictEqual(longerContract.begin, '01/01/2017 00:00', 'begin contract date incorrect');
        assert.strictEqual(longerContract.end, '31/12/2025 23:59', 'end contract date incorrect');
        assert.strictEqual(longerContract.termination, '31/12/2018 23:59', 'termination contract date incorrect');

        const shorterContract = Contract.terminate(longerContract, '30/06/2017 23:59');
        assert.strictEqual(shorterContract.terms, 108, 'incorrect number of terms');
        assert.strictEqual(shorterContract.rents.length, 6, 'incorrect number of rents');
        assert.strictEqual(shorterContract.begin, '01/01/2017 00:00', 'begin contract date incorrect');
        assert.strictEqual(shorterContract.end, '31/12/2025 23:59', 'end contract date incorrect');
        assert.strictEqual(shorterContract.termination, '30/06/2017 23:59', 'termination contract date incorrect');
    });

    it('terminate contract and change contract duration', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        const terminateContract = Contract.terminate(contract, '31/12/2017 23:59');
        const newContract = Contract.update(terminateContract, {end: '31/03/2026 23:59'});

        assert.strictEqual(newContract.terms, 108 + 3, 'incorrect number of terms');
        assert.strictEqual(newContract.rents.length, 12, 'incorrect number of rents');
        assert.strictEqual(newContract.begin, '01/01/2017 00:00', 'begin contract date incorrect');
        assert.strictEqual(newContract.end, '31/03/2026 23:59', 'end contract date incorrect');
        assert.strictEqual(newContract.termination, '31/12/2017 23:59', 'termination contract date incorrect');

        // termination date after end contract
        assert.throws(() => {
            Contract.update(terminateContract, {end: '30/12/2017 23:59'});
        });

        // termination date before begin contract
        assert.throws(() => {
            Contract.update(terminateContract, {begin: '01/01/2018 23:59'});
        });
    });

    it('pay a term', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        Contract.payTerm(contract, '01/12/2025 00:00', {payments:[{amount: 200}], discounts:['dsicout']});

        assert.strictEqual(contract.rents.filter(rent => rent.payments.length === 0).length, contract.terms - 1);
        assert.strictEqual(contract.rents.find(rent => rent.term === 2025120100).payments[0].amount, 200);
        assert.strictEqual(contract.terms, 108, 'incorrect number of terms');
        assert.strictEqual(contract.rents.length, 108, 'incorrect number of rents');

        assert.throws(() => {
            Contract.payTerm(contract, '01/12/2026 00:00', {payments:[{amount: 200}], discounts:['dsicout']});
        });

        assert.throws(() => {
            Contract.payTerm(contract, '01/12/2016 00:00', {payments:[{amount: 200}], discounts:['dsicout']});
        });
    });

    it('pay first term', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        Contract.payTerm(contract, '01/01/2017 00:00', {payments:[{amount: 200}], discounts:['dsicout']});

        assert.strictEqual(contract.rents.find(rent => rent.term === 2017010100).payments[0].amount, 200);
        assert.strictEqual(contract.rents.findIndex(rent => rent.term === 2017010100), 0);
    });

    it('pay last term', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        Contract.payTerm(contract, '01/12/2025 00:00', {payments:[{amount: 200}], discounts:['dsicout']});

        assert.strictEqual(contract.rents.find(rent => rent.term === 2025120100).payments[0].amount, 200);
        assert.strictEqual(contract.rents.findIndex(rent => rent.term === 2025120100), contract.rents.length - 1);
    });

    it('pay a term and update contract duration', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        Contract.payTerm(contract, '01/12/2025 00:00', {payments:[{amount: 200}], discounts:['dsicout']});

        const newContract = Contract.update(contract, {begin:'01/01/2019 00:00', end: '31/12/2025 23:59'});
        assert.strictEqual(newContract.rents.find(rent => rent.term === 2025120100).payments[0].amount, 200);

        // payment out of contract time frame
        assert.throws(() => {
            Contract.update(contract, {begin:'01/01/2019 00:00', end: '31/12/2024 23:59'});
        });
    });

    it('pay a term and renew', () => {
        const contract = Contract.create({begin: '01/01/2017 00:00', end: '31/12/2025 23:59', frequency: 'months', properties: [{}, {}]});
        Contract.payTerm(contract, '01/12/2025 00:00', {payments:[{amount: 200}], discounts:['dsicout']});
        const newContract = Contract.renew(contract);

        assert.strictEqual(newContract.rents.filter(rent => rent.payments.length === 0).length, (contract.terms * 2) - 1);
        assert.strictEqual(newContract.rents.find(rent => rent.term === 2025120100).payments[0].amount, 200);
        assert.strictEqual(newContract.terms, 108, 'incorrect number of terms');
        assert.strictEqual(newContract.rents.length, 108 * 2, 'incorrect number of rents');
    });
});
