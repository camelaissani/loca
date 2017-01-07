'use strict';

require('sugar').extend();

var moment = require('moment'),
    realmModel = require('../models/realm'),
    occupantManager = require('./occupantmanager'),
    rentManager = require('./rentmanager');

function rentBuildViewData(printableRent, occupant, month, year) {
    const beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
    const endMoment = moment(occupant.endDate, 'DD/MM/YYYY');
    const fyear = String(Number(year) - 2000);
    const fmonth = month > 9 ? month : '0' + Number(month);

    // find first day of renting in period
    let beginRentMoment = moment('01/' + month + '/' + year, 'DD/MM/YYYY').startOf('day');
    if (beginMoment.month() === Number(month)-1 && beginMoment.year() === Number(year)) {
        beginRentMoment = moment(beginMoment).startOf('day');
    }
    // find last day of renting in period
    let endRentMoment = moment(beginRentMoment).endOf('month').endOf('day');
    if (endMoment.month() === Number(month)-1 && endMoment.year() === Number(year)) {
        endRentMoment = moment(endMoment).endOf('day');
    }

    occupant.properties.forEach((occupantProperty) => {
        const entryMoment = moment(occupantProperty.entryDate, 'DD/MM/YYYY').startOf('day');
        const exitMoment = moment(occupantProperty.exitDate, 'DD/MM/YYYY').endOf('day');
        if (beginRentMoment.isSame(entryMoment) ||
            endRentMoment.isSame(exitMoment) ||
            beginRentMoment.isBetween(entryMoment, exitMoment) && endRentMoment.isBetween(entryMoment, exitMoment)) {
            occupantProperty.visibleOnInvoice = true;
        }
    });

    const rentPrice = rentManager._computeRent(month, year, occupant.properties);

    month = printableRent.month || month;
    year = printableRent.year || year;
    printableRent.callDate = moment(`${year}-${month}-20`).subtract(1, 'months').format('LL');
    printableRent.invoiceDate = moment(`${year}-${month}-20`).format('LL');
    printableRent.period = moment(`${year}-${month}-1`).format('MMMM YYYY');
    printableRent.dueDate = moment(`${year}-${month}-5`).format('LL');
    printableRent.occupant = occupant;
    printableRent.occupant.durationInMonth = Math.round(moment.duration(endMoment.diff(beginMoment)).asMonths());
    printableRent._id = occupant._id;
    printableRent.reference = fmonth + '_' + fyear + '_' + occupant.reference;
    printableRent.month = month > 9 ? month : '0' + Number(month);
    printableRent.year = year;
    printableRent.vatRatio = printableRent.vatRatio ? Number(printableRent.vatRatio) : 0;
    printableRent.balance = printableRent.balance ? Number(printableRent.balance) : 0;
    printableRent.payment = printableRent.payment ? Number(printableRent.payment) : 0;
    printableRent.paymentType = printableRent.paymentType || '';
    printableRent.paymentReference = printableRent.paymentReference || '';
    printableRent.paymentDate = printableRent.paymentDate || '';
    printableRent.totalWithoutVatAmount = rentPrice.amount + rentPrice.expense - printableRent.discount;
    printableRent.vatAmount = printableRent.vatAmount ? Number(printableRent.vatAmount) : 0;
    printableRent.promo = printableRent.promo ? Number(printableRent.promo) : 0;
    printableRent.notepromo = printableRent.notepromo || '';
    printableRent.totalAmount = printableRent.totalAmount ? Number(printableRent.totalAmount) : 0;
    printableRent.newBalance = Number((printableRent.payment - printableRent.totalAmount).toFixed(2));
    printableRent.officeAmount = printableRent.officeAmount ? Number(printableRent.officeAmount) : 0;
    printableRent.expenseAmount = printableRent.expenseAmount ? Number(printableRent.expenseAmount) : 0;
    printableRent.parkingAmount = printableRent.parkingAmount ? Number(printableRent.parkingAmount) : 0;
    printableRent.discount = printableRent.discount ? Number(printableRent.discount) : 0;
    printableRent.totalWithoutBalanceAmount = printableRent.officeAmount + printableRent.expenseAmount + printableRent.parkingAmount - printableRent.discount + printableRent.vatAmount;
    printableRent.totalToPay = printableRent.totalAmount > 0 ? printableRent.totalAmount : 0;
    printableRent.description = printableRent.description || '';
    printableRent.rowSelected = '';
    printableRent.status = '';
    return printableRent;
}

function buildViewData(realm, months, year, occupants) {
    var dataModel = {};
    dataModel.today = moment().format('LL');
    dataModel.months = moment.months();
    dataModel.realm = realm.manager ? realm : {
        manager: '?',
        company: '?',
        legalForm: '?',
        capital: 0,
        rcs: '?',
        vatNumber: '?',
        street1: '?',
        street2: '?',
        zipCode: '?',
        city: '?',
        contact: '?',
        phone1: '?',
        phone2: '?',
        email: '?',
        bank: '?',
        rib: '?'
    };
    dataModel.rents = [];

    occupants.forEach((occupant) => {
        months.forEach((month) => {
            if (occupant.rents[year] && occupant.rents[year][month]) {
                const printableRent = occupant.rents[year][month];
                dataModel.rents.push(rentBuildViewData(printableRent, occupant, month, year));
            }
        });
    });

    return dataModel;
}

module.exports.renderModel = function(req, res, callback) {
    var realm = req.session.user.realm,
        occupantIds = req.query.occupants ? req.query.occupants.split(',') : [],
        occupants = [],
        occupantIdsLoop;

    occupantIdsLoop = function(index, endLoopCallback) {
        if (index < occupantIds.length) {
            occupantManager.findOccupant(realm, occupantIds[index], function(errors, occupant) {
                occupant.office = {
                    surface: 0,
                    m2Price: 0,
                    m2Expense: 0,
                    price: 0,
                    expense: 0
                };
                occupant.parking = {
                    price: 0,
                    expense: 0
                };
                occupant.properties.forEach(function(item) {
                    var property = item.property;
                    if (property.type === 'parking') {
                        occupant.parking.price += property.price;
                        if (property.expense) {
                            occupant.parking.expense += property.expense;
                        }
                    } else {
                        occupant.office.surface += property.surface;
                        occupant.office.price += property.price;
                        if (property.expense) {
                            occupant.office.expense += property.expense;
                        }
                    }
                });
                if (occupant.office) {
                    occupant.office.m2Price = occupant.office.price / occupant.office.surface;
                    occupant.office.m2Expense = occupant.office.expense / occupant.office.surface;
                }
                occupants.push(occupant);
                index++;
                occupantIdsLoop(index, endLoopCallback);
            });
        } else {
            endLoopCallback();
        }
    };

    occupantIdsLoop(0, function() {
        realmModel.findOne(realm._id, function(err, realmFound) {
            if (err) {
                callback([err]);
            } else {
                var dataModel = {};
                dataModel.today = moment().format('LL');
                dataModel.year = moment().format('YYYY');
                dataModel.months = moment.months();
                dataModel.realm = realmFound.manager ? realm : {
                    manager: '?',
                    company: '?',
                    legalForm: '?',
                    capital: 0,
                    rcs: '?',
                    vatNumber: '?',
                    street1: '?',
                    street2: '?',
                    zipCode: '?',
                    city: '?',
                    contact: '?',
                    phone1: '?',
                    phone2: '?',
                    email: '?',
                    bank: '?',
                    rib: '?'
                };
                dataModel.occupants = occupants;
                callback([], dataModel);
            }
        });
    });
};

module.exports.rentModel = function(req, res, callback) {
    var realm = req.session.user.realm,
        month = req.query.month,
        fromMonth = req.query.fromMonth,
        year = req.query.year,
        occupantIds = req.query.occupants ? req.query.occupants.split(',') : [],
        occupants = [],
        occupantIdsLoop;

    occupantIdsLoop = function(index, endLoopCallback) {
        if (index < occupantIds.length) {
            occupantManager.findOccupant(realm, occupantIds[index], function(errors, occupant) {
                occupant.office = {
                    surface: 0,
                    m2Price: 0,
                    m2Expense: 0,
                    price: 0,
                    expense: 0
                };
                occupant.parking = {
                    price: 0,
                    expense: 0
                };
                occupant.properties.forEach(function(item) {
                    var property = item.property;
                    if (property.type === 'parking') {
                        occupant.parking.price += property.price;
                        if (property.expense) {
                            occupant.parking.expense += property.expense;
                        }
                    } else {
                        occupant.office.surface += property.surface;
                        occupant.office.price += property.price;
                        if (property.expense) {
                            occupant.office.expense += property.expense;
                        }
                    }
                });
                if (occupant.office) {
                    occupant.office.m2Price = occupant.office.price / occupant.office.surface;
                    occupant.office.m2Expense = occupant.office.expense / occupant.office.surface;
                }
                occupants.push(occupant);
                index++;
                occupantIdsLoop(index, endLoopCallback);
            });
        } else {
            endLoopCallback();
        }
    };

    occupantIdsLoop(0, function() {
        realmModel.findOne(realm._id, function(err, realmFound) {
            if (err) {
                callback([err]);
            } else {
                let months = [1,2,3,4,5,6,7,8,9,10,11,12];
                if (month) {
                    months = [month];
                }
                if (fromMonth) {
                    months = [];
                    for (let m=Number(fromMonth); m<=12; m++) {
                        months.push(m);
                    }
                }
                callback([], buildViewData(realmFound, months, year, occupants));
            }
        });
    });
};
