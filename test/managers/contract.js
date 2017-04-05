/* eslint-env node, mocha */
import assert from 'assert';
import Contract from '../../backend/managers/contract';

describe('contract functionalities', () => {
    it('create contract', () => {
        const contract = Contract.create('01/01/2017 00:00', '31/12/2025 23:59', 'months', [{}, {}]);

        assert(contract.terms, 108, 'incorrect number of terms');
        assert(contract.rents.length, 108, 'incorrect number of rents');
    });

    it('renew contract based on initial number of terms', () => {
        const contract = Contract.create('01/01/2017 00:00', '31/12/2025 23:59', 'months', [{}, {}]);
        Contract.renew(contract);

        assert(contract.terms, 108*2, 'incorrect number of terms');
        assert(contract.rents.length, 108*2, 'incorrect number of rents');
    });

    it('update contract change duration', () => {
        const contract = Contract.create('01/01/2017 00:00', '31/12/2025 23:59', 'months', [{}, {}]);
        contract.end = '31/01/2026 23:59';

        assert(contract.terms, 108+1, 'incorrect number of terms');
        assert(contract.rents.length, 108+1, 'incorrect number of rents');
    });

    it('end contract');

    it('pay a term', () => {
        const contract = Contract.create('01/01/2017 00:00', '31/12/2025 23:59', 'months', [{}, {}]);
        Contract.payTerm(contract, '01/12/2025 00:00', {payments:[{amount: 200}], discounts:['dsicout']});
        assert(contract.rents.filter(rent => rent.payments.length === 0).length, contract.terms - 1);
        assert(contract.rents.find(rent => rent.term === 2025120100).payments[0].amount, 200);
        assert(contract.terms, 108, 'incorrect number of terms');
        assert(contract.rents.length, 108, 'incorrect number of rents');
    });

    it('pay a term and renew', () => {
        const contract = Contract.create('01/01/2017 00:00', '31/12/2025 23:59', 'months', [{}, {}]);
        Contract.payTerm(contract, '01/12/2025 00:00', {payments:[{amount: 200}], discounts:['dsicout']});
        Contract.renew(contract);
        assert(contract.rents.filter(rent => rent.payments.length === 0).length, (contract.terms * 2) - 1);
        assert(contract.rents.find(rent => rent.term === 2025120100).payments[0].amount, 200);
        assert(contract.terms, 108 * 2, 'incorrect number of terms');
        assert(contract.rents.length, 108 * 2, 'incorrect number of rents');
    });
});
