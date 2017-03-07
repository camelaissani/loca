/* eslint-env node, mocha */
import math from 'mathjs';
import assert from 'assert';
import BL from '../../backend/businesslogic';

describe('business logic rent computation', () => {
    describe('one property rented', () => {
        const property = {
            entryDate: '01/01/2017',
            exitDate: '31/08/2017',
            property: {
                name: 'mon bureau',
                price: 300,
                expense: 10
            }
        };
        const contract = {
            begin: '01/01/2017',
            end: '31/01/2017',
            discount: 10,
            vatRate: 0.2,
            properties: [property]
        };

        const grandTotal = math.round((property.property.price + property.property.expense - contract.discount) * (1+contract.vatRate), 2);

        it('compute one rent', () => {
            const computedRent = BL.computeRent(contract, '01/01/2017');
            assert.equal(computedRent.total.grandTotal, grandTotal);
            assert(true);
        });

        it('compute two rents and check balance', () => {
            const rentOne = BL.computeRent(contract, '01/01/2017');
            const rentTwo = BL.computeRent(contract, '01/01/2017', rentOne);
            assert.equal(rentOne.total.grandTotal, grandTotal);
            assert.equal(rentTwo.balance, grandTotal);
            assert.equal(rentTwo.total.grandTotal, grandTotal * 2);
            assert(true);
        });
    });

    describe('two properties rented with one month offset', () => {
        const property1 = {
            entryDate: '01/01/2017',
            exitDate: '31/08/2017',
            property: {
                name: 'mon bureau',
                price: 300,
                expense: 10
            }
        };
        const property2 = {
            entryDate: '01/02/2017',
            exitDate: '31/08/2017',
            property: {
                name: 'mon parking',
                price: 30,
                expense: 5
            }
        };
        const contract = {
            begin: '01/01/2017',
            end: '31/01/2017',
            discount: 10,
            vatRate: 0.2,
            properties: [property1, property2]
        };
        const grandTotal1 = math.round((property1.property.price + property1.property.expense - contract.discount) * (1+contract.vatRate), 2);
        const grandTotal2 = math.round((property2.property.price + property2.property.expense) * (1+contract.vatRate), 2);

        it('compute one rent one property should be billed', () => {
            const computedRent = BL.computeRent(contract, '01/01/2017');
            assert.equal(computedRent.total.grandTotal, grandTotal1);
            assert(true);
        });

        it('compute one rent two properties should be billed', () => {
            const computedRent = BL.computeRent(contract, '01/02/2017');
            assert.equal(computedRent.total.grandTotal, grandTotal1 + grandTotal2);
            assert(true);
        });

    });
});
