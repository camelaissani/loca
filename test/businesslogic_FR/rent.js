/* eslint-env node, mocha */
import math from 'mathjs';
import assert from 'assert';
import bl from '../../backend/businesslogic';

describe('business logic rent computation', () => {
    describe('one property rented', () => {
        const property = {
            name: 'mon bureau',
            entryDate: '01/01/2017',
            exitDate: '31/08/2017',
            price: 300,
            expense: 10
        };
        const contract = {
            discount: 10,
            vatRate: 0.2,
            properties: [property]
        };

        const grandTotal = math.round((property.price + property.expense - contract.discount) * (1+contract.vatRate), 2);

        it('compute one rent', () => {
            const computedRent = bl.rent(contract, '01/01/2017', '31/01/2017');
            assert.equal(computedRent.total.grandTotal, grandTotal);
            assert(true);
        });

        it('compute two rents and check balance', () => {
            const rentOne = bl.rent(contract, '01/01/2017', '31/01/2017');
            const rentTwo = bl.rent(contract, '01/01/2017', '31/01/2017', null, rentOne);
            assert.equal(rentOne.total.grandTotal, grandTotal);
            assert.equal(rentTwo.balance, grandTotal);
            assert.equal(rentTwo.total.grandTotal, grandTotal * 2);
            assert(true);
        });
    });

    describe('two properties rented with one month offset', () => {
        const property1 = {
            name: 'mon bureau',
            entryDate: '01/01/2017',
            exitDate: '31/08/2017',
            price: 300,
            expense: 10
        };
        const property2 = {
            name: 'mon parking',
            entryDate: '01/02/2017',
            exitDate: '31/08/2017',
            price: 30,
            expense: 5
        };
        const contract = {
            discount: 10,
            vatRate: 0.2,
            properties: [property1, property2]
        };
        const grandTotal1 = math.round((property1.price + property1.expense - contract.discount) * (1+contract.vatRate), 2);
        const grandTotal2 = math.round((property2.price + property2.expense) * (1+contract.vatRate), 2);

        it('compute one rent one property should be billed', () => {
            const computedRent = bl.rent(contract, '01/01/2017', '31/01/2017');
            assert.equal(computedRent.total.grandTotal, grandTotal1);
            assert(true);
        });

        it('compute one rent two properties should be billed', () => {
            const computedRent = bl.rent(contract, '01/02/2017', '28/02/2017');
            assert.equal(computedRent.total.grandTotal, grandTotal1 + grandTotal2);
            assert(true);
        });

    });
});
