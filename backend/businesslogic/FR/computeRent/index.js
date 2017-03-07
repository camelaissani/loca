import fs from 'fs';
import path from 'path';


export default function(contract, rentDate, previousRent, settlements) {
    const rent = {
        month: 0,
        year: 0,
        preTaxAmounts: [
        // {
        //     description: '',
        //     amount: ''
        // }
        ],
        charges: [
        // {
        //     description: '',
        //     amount: ''
        // }
        ],
        discounts: [
        // {
        //     description: '',
        //     amount: ''
        // }
        ],
        vats: [
        // {
        //     description: '',
        //     rate: 0,
        //     amount: 0
        // }
        ],
        balance: 0,
        payments: [
        // {
        //     date: '',
        //     amount: 0,
        //     type: '',
        //     reference: '',
        //     description: ''
        // }
        ],
        total: {
            preTaxAmount: 0,
            charges: 0,
            discount: 0,
            vat: 0,
            grandTotal: 0,
            payment: 0
        }
    };
    const tasks_dir = path.join(__dirname, 'tasks');
    const taskFiles = fs.readdirSync(tasks_dir);
    return taskFiles.reduce((rent, taskFile) => {
        const task = require(path.join(tasks_dir, taskFile)).default;
        return task(contract, rentDate, previousRent, settlements, rent);
    }, rent);
}
