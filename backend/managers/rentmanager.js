'use strict';

import BL from '../businesslogic';
import moment from 'moment';
import rentModel from '../models/rent';
import occupantModel from '../models/occupant';
import occupantManager from './occupantmanager.js';

// return this object
// {
//     _id,                               // occupant ID
//     month: String,
//     year: String,
//     discount: Number,
//     promo: Number,
//     notepromo: String,
//     balance: Number,
//     newBalance: Number,
//     isVat: Boolean,
//     vatRatio: Number,
//     vatAmount: Number,
//     totalAmount: Number,
//     payment: Number,
//     paymentType: String,
//     paymentReference: String,
//     paymentDate: String,               // DD/MM/YYYY
//     totalWithoutVatAmount: Number,
//     totalWithoutBalanceAmount: Number,
//     totalToPay: Number,
//     description: String,
//     status: String,                    // 'paid', 'partialypaid', 'notpaid'
//     paymentStatus: [{
//          month: String,
//          status: String
//     }],
//     occupant: {
//         _id: String,
//         isCompany: Boolean,
//         company: String,
//         legalForm: String,
//         siret: String,
//         capital: Number,
//         manager: String,
//         name: String,
//         street1: String,
//         street2: String,
//         zipCode: String,
//         city: String,
//         contacts: Array,
//         contract: String,
//         beginDate: String,
//         endDate: String,
//         terminationDate: String,
//         guarantyPayback: Number,
//         properties: Array,
//         guaranty: Number,
//         reference: String,
//         isVat: Boolean,
//         vatRatio: Number,
//         discount: Number,
//     }
// }
function _getViewData(inputOccupant, inputRent) {
    // clone and set default values for rent
    const rent = inputRent ? JSON.parse(JSON.stringify(inputRent)) : {};

    // TODO month should be a number not a string
    rent.month = Number(rent.month) > 9 ? `${rent.month}` : `0${Number(rent.month)}`;

    const rentMoment = moment(`01/${rent.month}/${rent.year}`, 'DD/MM/YYYY');

    rent.vatRatio = rent.vatRatio ? Number(rent.vatRatio) : 0;
    rent.balance = rent.balance ? Number(rent.balance) : 0;
    rent.payment = rent.payment ? Number(rent.payment) : 0;
    rent.paymentType = rent.paymentType || '';
    rent.paymentReference = rent.paymentReference || '';
    rent.paymentDate = rent.paymentDate || '';
    rent.totalWithoutVatAmount = rent.totalAmount - rent.vatRatio - rent.balance;
    rent.vatAmount = rent.vatAmount ? Number(rent.vatAmount) : 0;
    rent.promo = rent.promo ? Number(rent.promo) : 0;
    rent.notepromo = rent.notepromo || '';
    rent.totalAmount = rent.totalAmount ? Number(rent.totalAmount) : 0;
    rent.newBalance =  Number((rent.payment - rent.totalAmount));
    rent.discount = rent.discount ? Number(rent.discount) : 0;
    rent.totalWithoutBalanceAmount = rent.totalAmount - rent.balance;
    rent.totalToPay = rent.totalAmount > 0 ? rent.totalAmount : 0;
    rent.description = rent.description || '';
    rent.status = '';
    if (rentMoment.isSameOrBefore(moment(), 'month')) {
        if (rent.totalAmount <= 0 || rent.newBalance >= 0) {
            rent.status = 'paid';
        } else if (rent.payment > 0) {
            rent.status = 'partialypaid';
        } else {
            rent.status = 'notpaid';
        }
    }

    // clone and set default values for occupant
    if (inputOccupant) {
        const occupant = JSON.parse(JSON.stringify(inputOccupant));
        occupant.street1 = occupant.street1 || '';
        occupant.street2 = occupant.street2 || '';
        occupant.zipCode = occupant.zipCode || '';
        occupant.city = occupant.city || '';

        occupant.legalForm = occupant.legalForm || '';
        occupant.siret = occupant.siret || '';
        occupant.contract = occupant.contract || '';
        occupant.reference = occupant.reference || '';

        occupant.guaranty = occupant.guaranty ? Number(occupant.guaranty) : 0;
        if (occupant.isVat) {
            occupant.vatRatio = occupant.vatRatio ? Number(occupant.vatRatio) : 0;
        } else {
            occupant.vatRatio = 0;
        }
        occupant.discount = occupant.discount ? Number(occupant.discount) : 0;

        // Compute if contract is completed
        if (!occupant.terminationDate) {
            const currentDate = moment();
            const momentTermination = moment(occupant.terminationDate, 'DD/MM/YYYY');
            if (momentTermination.isBefore(currentDate, 'month')) {
                occupant.terminated = true;
            }
        } else {
            occupant.terminated = false;
        }

        rent.occupant = occupant;
        rent._id = occupant._id;

        // count number of month of not paid rent
        if (rentMoment.isSameOrBefore(moment(), 'month')) {
            rent.paymentStatus = [];
            let currentMoment = moment(rentMoment);
            let currentRent;
            let countMonthNotPaid = 0;
            do {
                currentRent = null;
                let currentMonth = String(currentMoment.month() + 1);
                let currentYear = String(currentMoment.year());
                if (occupant.rents[currentYear] && occupant.rents[currentYear][currentMonth]) {
                    currentRent = occupant.rents[currentYear][currentMonth];
                    const totalAmount = currentRent.totalAmount ? Number(currentRent.totalAmount) : 0;
                    const payment = currentRent.payment ? Number(currentRent.payment) : 0;
                    const newBalance =  Number(currentRent.payment) - totalAmount;

                    if (totalAmount <= 0 || newBalance >= 0) {
                        break;
                    } else {
                        rent.paymentStatus.push({month: currentMonth, status: payment > 0 ? 'partialypaid' : 'notpaid'});
                        countMonthNotPaid++;
                    }
                }
                currentMoment.subtract(1, 'month');
            } while (currentRent);

            if (countMonthNotPaid >= 1) {
                rent.countMonthNotPaid = countMonthNotPaid;
            } else {
                delete rent.paymentStatus;
            }
        }
        delete rent.occupant.rents;
    }
    return rent;
}

function _updateRentAmount(contract, inputRent, currentMonth, previousRent, paymentData) {
    const rent = rentModel.rentSchema.filter(inputRent);
    const prevRent = previousRent ? {
        total: {
            grandTotal: previousRent.totalAmount,
            payment: previousRent.payment || 0
        }
    } : null;
    const settlements = {
        payments: [],
        discounts: []
    };
    if (paymentData) {
        settlements.payments.push({
            date: paymentData.paymentDate || '',
            amount: paymentData.payment || 0,
            type: paymentData.paymentType || '',
            reference: paymentData.paymentReference || '',
            description: paymentData.description || ''
        });
        if (paymentData.promo) {
            settlements.discounts.push({
                description: paymentData.notepromo || '',
                amount: paymentData.promo * (1 / (1 + contract.vatRate))
            });
        }
    }
    const computedRent = BL.computeRent(contract, currentMonth, prevRent, settlements);
    rent.discount = computedRent.total.discount;
    rent.vatAmount = computedRent.total.vat;
    rent.balance = computedRent.balance;
    rent.totalAmount = computedRent.total.grandTotal;
    if (paymentData) {
        rent.payment = computedRent.total.payment;
        rent.paymentType = computedRent.payments[0].type;
        rent.paymentReference = computedRent.payments[0].reference;
        rent.paymentDate = computedRent.payments[0].date;
        rent.description = computedRent.payments[0].description;
        rent.promo = paymentData.promo || 0;
        rent.notepromo = paymentData.notepromo || '';
    }
    return rent;
}

function _findOccupantRents(realm, id, month, year, callback) {
    occupantManager.findOccupant(realm, id, (errors, occupant) => {
        if (errors && errors.length > 0) {
            callback(errors);
            return;
        }
        const rents = [];
        let rent = null;

        if (occupant && occupant.rents) {
            Object.keys(occupant.rents).forEach((currentYear) => {
                Object.keys(occupant.rents[currentYear]).forEach((currentMonth) => {
                    const currentRent = occupant.rents[currentYear][currentMonth];
                    if (currentRent) {
                        currentRent.month = currentMonth;
                        currentRent.year = currentYear;
                        rents.push(_getViewData(occupant, currentRent));
                    }
                    if (Number(currentMonth) === Number(month) && Number(currentYear) === Number(year)) {
                        rent = currentRent;
                    }
                });
            });
        }

        if (!rent && rents.length>0) {
            rent = rents[0];
        }

        callback([], occupant, rent, rents);
    });
}

function _findAllOccupantRents(realm, month, year, callback) {
    const filter = {};
    filter[`rents.${year}.${month}`] = {
        $exists: true
    };
    occupantManager.findAllOccupants(realm, (errors, occupants) => {
        if (errors && errors.length > 0) {
            callback(errors);
            return;
        }
        callback([], occupants.map(occupant => {
            const rent = occupant.rents[year][month];
            rent.month = month;
            rent.year = year;
            return _getViewData(occupant, rent);
        }));
    }, filter);
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function update(req, res) {
    const realm = req.realm;
    let paymentData = rentModel.paymentSchema.filter(req.body);
    let currentDate = moment();

    if (req.body.year && req.body.month) {
        currentDate = moment(`${req.body.month}/${req.body.year}`, 'MM/YYYY');
    }

    if (!paymentData.payment || paymentData.payment <= 0) {
        paymentData.payment = 0;
        paymentData.reference = null;
        paymentData.paymentReference = null;
        paymentData.paymentDate = null;
        paymentData.paymentType = null;
    }
    if (!paymentData.promo && paymentData.promo <= 0) {
        paymentData.promo = 0;
        paymentData.notepromo = null;
    }

    _findOccupantRents(realm, paymentData._id, paymentData.month, paymentData.year, (errors, dbOccupant/*, dbRent, rents*/) => {
        if (errors && errors.length > 0) {
            res.json({errors: errors});
            return;
        }
        const currentMonth = moment('01/' + paymentData.month + '/' + paymentData.year, 'DD/MM/YYYY');
        const end = moment(dbOccupant.endDate, 'DD/MM/YYYY');
        const contract = {
            begin: dbOccupant.beginDate,
            end: dbOccupant.endDate,
            discount: dbOccupant.discount || 0,
            vatRate: dbOccupant.vatRatio,
            properties: dbOccupant.properties
        };
        while(currentMonth.isSameOrBefore(end, 'month')) {
            const month = currentMonth.month() + 1; // 0 based
            const year = currentMonth.year();
            if (!dbOccupant.rents[year] || !dbOccupant.rents[year][month]) {
                break;
            }

            const previousMonth = moment(currentMonth).subtract(1, 'months');
            const previousY = previousMonth.year();
            const previousM = previousMonth.month() + 1;
            let previousRent;
            if (dbOccupant.rents[previousY] && dbOccupant.rents[previousY][previousM]) {
                previousRent = dbOccupant.rents[previousY][previousM];
            }

            dbOccupant.rents[year][month] = _updateRentAmount(contract, dbOccupant.rents[year][month], currentMonth, previousRent, paymentData);
            paymentData = null;
            currentMonth.add(1, 'months');
        }

        occupantModel.update(realm, dbOccupant, (errors) => {
            if (errors) {
                res.json({errors: errors});
                return;
            }
            const rent = dbOccupant.rents[currentDate.year()][currentDate.month() + 1];
            rent.month = currentDate.month() + 1;
            rent.year = currentDate.year();
            res.json(_getViewData(dbOccupant, rent));
        });
    });
}

function rentsOfOccupant(req, res) {
    const realm = req.realm;
    const id = req.params.id;
    const currentDate = moment();

    _findOccupantRents(realm, id, currentDate.month() + 1, currentDate.year(), (errors, occupant, rent, rents) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }
        if (rents) {
            rents.forEach( currentRent => {
                currentRent.uid = currentRent.occupant._id + '|' + currentRent.month + '|' + currentRent.year;
                // if (Number(currentRent.year) === date.year && Number(currentRent.month) === date.month) {
                if (currentRent === rent) {
                    currentRent.active = 'active';
                }
                delete currentRent.occupant;
            });
        }
        delete occupant.rents;
        res.json({
            occupant: occupant,
            rents: rents
        });
    });
}

function all(req, res) {
    const realm = req.realm;
    let currentDate = moment();

    if (req.params.year && req.params.month) {
        currentDate = moment(`${req.params.month}/${req.params.year}`, 'MM/YYYY');
    }

    _findAllOccupantRents(realm, currentDate.month() + 1, currentDate.year(), (errors, rents) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }
        res.json(rents);
    });
}

function overview(req, res) {
    const realm = req.realm;
    let currentDate = moment();

    if (req.params.year && req.params.month) {
        currentDate = moment(`${req.params.month}/${req.params.year}`, 'MM/YYYY');
    }

    _findAllOccupantRents(realm, currentDate.month() + 1, currentDate.year(), (errors, rents) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }
        let countPaid = 0;
        let countPartiallyPaid = 0;
        let countNotPaid = 0;
        let totalToPay = 0;
        let totalPaid = 0;
        let totalNotPaid = 0;
        if (rents) {
            rents.forEach( currentRent => {
                if (currentRent.totalAmount <= 0 || currentRent.newBalance >= 0) {
                    countPaid++;
                } else if (currentRent.payment > 0) {
                    countPartiallyPaid++;
                } else {
                    countNotPaid++;
                }
                totalToPay += currentRent.totalToPay;
                totalNotPaid += currentRent.newBalance;
                totalPaid += currentRent.payment;
            });
            totalNotPaid = (-1 * totalNotPaid);
        }
        res.json({
            countAll: countPaid + countPartiallyPaid + countNotPaid,
            countPaid: countPaid,
            countPartiallyPaid: countPartiallyPaid,
            countNotPaid: countNotPaid,
            totalToPay: totalToPay,
            totalPaid: totalPaid,
            totalNotPaid: totalNotPaid
        });
    });
}

export default {
    // one,
    update,
    rentsOfOccupant,
    all,
    overview
};
