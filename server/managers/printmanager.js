'use strict';

var moment = require('moment'),
    realmModel = require('../models/realm'),
    occupantManager = require('./occupantmanager'),
    rentManager = require('./rentmanager');
//    logger = require('winston');

require('sugar').extend();

function rentBuildViewData(occupant, month, year) {
    var rent = occupant.rents[year][month],
        rentPrice,
        beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY'),
        endMoment = moment(occupant.endDate, 'DD/MM/YYYY'),
        beginRentMoment = moment('01/' + month + '/' + year, 'DD/MM/YYYY').startOf('day'),
        endRentMoment = moment(beginRentMoment).endOf('month').endOf('day');

    occupant.durationInMonth = Math.round(moment.duration(endMoment.diff(beginMoment)).asMonths());
    rent.occupant = Object.clone(occupant);

    rent.occupant.properties.forEach(function(occupantProperty) {
        var entryMoment = moment(occupantProperty.entryDate, 'DD/MM/YYYY').startOf('day'),
            exitMoment = moment(occupantProperty.exitDate, 'DD/MM/YYYY').endOf('day');
        if (beginRentMoment.isSame(entryMoment) ||
            endRentMoment.isSame(exitMoment) ||
            beginRentMoment.isBetween(entryMoment, exitMoment) && endRentMoment.isBetween(entryMoment, exitMoment)) {
            occupantProperty.visibleOnInvoice = true;
        }
    });

    rent._id = rent.occupant._id;
    rentPrice = rentManager._computeRent(month, year, occupant.properties);

    month = rent.month || month;
    year = rent.year || year;
    rent.month = month > 9 ? month : '0' + Number(month);
    rent.year = year;

    rent.vatRatio = rent.vatRatio ? Number(rent.vatRatio) : 0;
    rent.balance = rent.balance ? Number(rent.balance) : 0;
    rent.payment = rent.payment ? Number(rent.payment) : 0;
    rent.paymentType = rent.paymentType || '';
    rent.paymentReference = rent.paymentReference || '';
    rent.paymentDate = rent.paymentDate || '';
    rent.totalWithoutVatAmount = rentPrice.amount + rentPrice.expense - rent.discount;
    rent.vatAmount = rent.vatAmount ? Number(rent.vatAmount) : 0;
    rent.promo = rent.promo ? Number(rent.promo) : 0;
    rent.notepromo = rent.notepromo || '';
    rent.totalAmount = rent.totalAmount ? Number(rent.totalAmount) : 0;
    rent.newBalance = Number((rent.payment - rent.totalAmount).toFixed(2));
    rent.officeAmount = rent.officeAmount ? Number(rent.officeAmount) : 0;
    rent.expenseAmount = rent.expenseAmount ? Number(rent.expenseAmount) : 0;
    rent.parkingAmount = rent.parkingAmount ? Number(rent.parkingAmount) : 0;
    rent.discount = rent.discount ? Number(rent.discount) : 0;
    rent.totalWithoutBalanceAmount = rent.officeAmount + rent.expenseAmount + rent.parkingAmount - rent.discount + rent.vatAmount;
    rent.totalToPay = rent.totalAmount > 0 ? rent.totalAmount : 0;
    rent.description = rent.description || '';
    rent.rowSelected = '';
    rent.status = '';
    return rent;
}

function buildViewData(realm, month, year, occupants) {
    var dataModel = {},
        occupant,
        index,
        fmonth = Number(month),
        fyear = String(Number(year) - 2000);

    if (fmonth < 10) {
        fmonth = '0' + month;
    } else {
        fmonth = month;
    }
    dataModel.months = moment.months();
    dataModel.today = moment().format('LL');
    dataModel.month = month;
    dataModel.year = year;
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
    dataModel.occupants = occupants ? occupants : [];

    for (index = 0; index < occupants.length; index++) {
        occupant = occupants[index];
        occupant.reference = fmonth + '_' + fyear + '_' + occupant.reference;
        if (occupant.rents[year] && occupant.rents[year][month]) {
            occupant.rent = occupant.rents[year][month];
            rentBuildViewData(occupant, month, year);
        }
        delete occupant.rents;
    }

    return dataModel;
}

module.exports.renderModel = function(req, res, callback) {
    var realm = req.session.user.realm,
        month = req.query.month,
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
                callback([], buildViewData(realmFound, month, year, occupants));
            }
        });
    });
};