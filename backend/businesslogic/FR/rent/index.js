import fs from 'fs';
import path from 'path';


export default function(contract, beginDate, includedEndDate, payment, previousRent) {
    const rent = {
        month: 0,
        year: 0,
        preTaxAmounts: {
            descriptions: [],
            amounts: []
        },
        charges: {
            descriptions: [],
            amounts: []
        },
        discounts: {
            descriptions: [],
            amounts: []
        },
        vat: {
            descriptions: [],
            rates: [],
            amounts: []
        },
        balance: 0,
        payments: {
            dates: [],
            amounts: [],
            types: [],
            references: [],
            descriptions: [],
        },
        total: {
            preTaxAmount: 0,
            charges: 0,
            discount: 0,
            vat: 0,
            grandTotal: 0,
            paymentAmount: 0
        }
    };
    const tasks_dir = path.join(__dirname, 'tasks');
    const taskFiles = fs.readdirSync(tasks_dir);
    return taskFiles.reduce((rent, taskFile) => {
        const task = require(path.join(tasks_dir, taskFile)).default;
        return task(contract, beginDate, includedEndDate, payment, previousRent, rent);
    }, rent);
}
