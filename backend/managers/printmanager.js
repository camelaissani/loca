'use strict';

import sugar from 'sugar';
sugar.extend();

import moment from 'moment';
import logger from 'winston';
import config from '../../config';
import realmModel from '../models/realm';
import occupantManager from './occupantmanager';

function _rentBuildViewData(printableRent, occupant, month, year) {
    const beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
    const endMoment = moment(occupant.endDate, 'DD/MM/YYYY');
    const fyear = String(Number(year) - 2000);
    const fmonth = month > 9 ? month : '0' + Number(month);

    // find first day of renting in period
    let beginRentMoment = moment(`01/${month}/${year}`, 'DD/MM/YYYY').startOf('day');
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

    month = printableRent.month || month;
    year = printableRent.year || year;
    printableRent.callDate = moment(`20/${month}/${year}`, 'DD/MM/YYYY').subtract(1, 'months').format('LL');
    printableRent.invoiceDate = moment(`20/${month}/${year}`, 'DD/MM/YYYY').format('LL');
    printableRent.period = moment(`1/${month}/${year}`, 'DD/MM/YYYY').format('MMMM YYYY');
    printableRent.dueDate = moment(`5/${month}/${year}`, 'DD/MM/YYYY').format('LL');
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
    printableRent.vatAmount = printableRent.vatAmount ? Number(printableRent.vatAmount) : 0;
    printableRent.discount = printableRent.discount ? Number(printableRent.discount) : 0;
    printableRent.totalWithoutVatAmount = printableRent.totalAmount - printableRent.vatAmount - printableRent.discount;
    printableRent.promo = printableRent.promo ? Number(printableRent.promo) : 0;
    printableRent.notepromo = printableRent.notepromo || '';
    printableRent.totalAmount = printableRent.totalAmount ? Number(printableRent.totalAmount) : 0;
    printableRent.newBalance = Number((printableRent.payment - printableRent.totalAmount).toFixed(2));
    printableRent.officeAmount = printableRent.officeAmount ? Number(printableRent.officeAmount) : 0;
    printableRent.expenseAmount = printableRent.expenseAmount ? Number(printableRent.expenseAmount) : 0;
    printableRent.parkingAmount = printableRent.parkingAmount ? Number(printableRent.parkingAmount) : 0;
    printableRent.totalWithoutBalanceAmount = printableRent.officeAmount + printableRent.expenseAmount + printableRent.parkingAmount - printableRent.discount + printableRent.vatAmount;
    printableRent.totalToPay = printableRent.totalAmount > 0 ? printableRent.totalAmount : 0;
    printableRent.description = printableRent.description || '';
    printableRent.rowSelected = '';
    printableRent.status = '';
    return printableRent;
}

function _buildViewData(realm, doc, fromMonth, month, year, occupants) {
    const dataModel = {
        today: moment().format('LL'),
        year: moment().format('YYYY'),
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        occupants,
        config,
        view: `printable/${doc}`
    };
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
    if (month) {
        dataModel.months = [Number(month)];
    }
    if (fromMonth) {
        dataModel.months = [];
        for (let m=Number(fromMonth); m<=12; m++) {
            dataModel.months.push(m);
        }
    }
    dataModel.rents = [];

    occupants.forEach((occupant) => {
        dataModel.months.forEach((month) => {
            if (occupant.rents[year] && occupant.rents[year][month]) {
                const printableRent = occupant.rents[year][month];
                dataModel.rents.push(_rentBuildViewData(printableRent, occupant, month, year));
            }
        });
    });

    return dataModel;
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function print(req, res) {
    const realm = req.realm;
    const doc = req.params.id;
    const month = req.params.month;
    const fromMonth = req.params.fromMonth;
    const year = req.params.year;
    const occupantIds = req.params.ids ? req.params.ids.split(',') : [];
    const occupants = [];

    function occupantIdsLoop(index, endLoopCallback) {
        if (index < occupantIds.length) {
            occupantManager.findOccupant(realm, occupantIds[index], (errors, occupant) => {
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
                occupant.properties.forEach((item) => {
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
    }

    occupantIdsLoop(0, () => {
        realmModel.findOne(realm._id, (err, realmFound) => {
            if (err) {
                logger.error(err);
                return;
            }
            const dataModel = _buildViewData(realmFound, doc, fromMonth, month, year, occupants);
            res.render(dataModel.view, dataModel);
        });
    });
}

export default {
    print
};
