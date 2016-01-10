'use strict';

var moment = require('moment'),
    math = require('mathjs'),
    db = require('../modules/db'),
    OF = require('../modules/objectfilter'),
    Helper = require('./helper'),
    occupantManager = require('./occupantmanager.js');

var paymentSchema = new OF({
    _id: String,
    month: Number,
    year: Number,
    payment: Number,
    paymentType: String,
    paymentReference: String,
    paymentDate: String,
    description: String,
    promo: Number,
    notepromo: String
});

var rentSchema = new OF({
    month: Number,
    year: Number,
    discount: Number,
    balance: Number,
    isVat: Boolean,
    vatRatio: Number,
    vatAmount: Number,
    totalAmount: Number,
    payment: Number,
    paymentType: String,
    paymentReference: String,
    paymentDate: String,
    description: String,
    promo: Number,
    notepromo: String
});

module.exports._computeRent = function (month, year, properties) {
    var amount = 0, expense = 0;
    var beginRentMoment = moment('01/'+month+'/'+year, 'DD/MM/YYYY').startOf('day');
    var endRentMoment = moment(beginRentMoment).endOf('month').endOf('day');
    properties.forEach(function (item) {
        var entryMoment = moment(item.entryDate, 'DD/MM/YYYY').startOf('month');
        var exitMoment = moment(item.exitDate, 'DD/MM/YYYY').endOf('month');
        if (beginRentMoment.isSame(entryMoment) ||
            endRentMoment.isSame(exitMoment) ||
            beginRentMoment.isBetween(entryMoment, exitMoment) && endRentMoment.isBetween(entryMoment, exitMoment)) {
            amount += item.property.price;
            expense += item.property.expense || 0;
        }
    });

    return {amount: amount, expense: expense};
};

module.exports.createRent = function (begin, end, previousRent, occupant) {
    var month = begin.month() + 1, // 0 based
        year = begin.year(),
        discountAmount = occupant.discount || 0,
        vatRatio = occupant.isVat ? occupant.vatRatio : 0,
        balance = 0,
        rentPrice,
        vatAmount,
        totalAmount,
        rent,
        previousPayment;

    if (!occupant.rents) {
        occupant.rents = {};
    }

    if (previousRent) {
        previousPayment = previousRent.payment || 0;
        balance = previousRent.totalAmount - previousPayment;
    }

    rentPrice = module.exports._computeRent(month, year, occupant.properties);

    vatAmount = math.round((rentPrice.amount + rentPrice.expense - discountAmount) * vatRatio, 2);
    totalAmount = math.round(rentPrice.amount + rentPrice.expense - discountAmount + vatAmount + balance, 2);

    rent = {
        'month': month,
        'year': year,
        'discount': discountAmount,
        'promo': 0,
        'balance': balance,
        'isVat': occupant.isVat,
        'vatRatio': vatRatio,
        'vatAmount': vatAmount,
        'totalAmount': totalAmount
    };
    if (!occupant.rents[year]) {
        occupant.rents[year] = {};
    }
    occupant.rents[year][month] = rent;
    return rent;
};

module.exports.updateRentAmount = function (begin, end, previousRent, occupant) {
    var month = begin.month() + 1, // 0 based
        year = begin.year(),
        rentPrice,
        rent,
        previousPayment;

    begin = begin.endOf('day');
    end = end.endOf('month').endOf('day');

    if (occupant.rents && occupant.rents[year] && occupant.rents[year][month]) {
        rent = occupant.rents[year][month];
        if (begin.isBefore(end)) {
            rentPrice = module.exports._computeRent(month, year, occupant.properties);
            // update rent with new occupant info
            rent.discount = occupant.discount || 0;
            rent.vatAmount = math.round((rentPrice.amount + rentPrice.expense - rent.discount) * rent.vatRatio, 2);

            if (previousRent && typeof previousRent === 'object') {
                previousPayment = previousRent.payment || 0;
                rent.balance = previousRent.totalAmount - previousPayment;
            }
            rent.totalAmount = math.round(rentPrice.amount + rentPrice.expense - rent.discount - rent.promo + rent.vatAmount + rent.balance, 2);
            return rent;
        }
        delete occupant.rents[year][month];
        if (Object.keys(occupant.rents[year]).length === 0) {
            delete occupant.rents[year];
        }
        return true;
    }
    if (begin.isBefore(end)) {
        return module.exports.createRent(begin, end, previousRent, occupant);
    }
    return null;
};

module.exports._updateRentPayment = function (rentMoment, previousRent, occupant, rentData) {
    var month = rentMoment.month() + 1, // 0 based
        year = rentMoment.year(),
        dbRent,
        previousPayment,
        rentPrice;

    if (occupant.rents && occupant.rents[year] && occupant.rents[year][month]) {
        dbRent = rentSchema.filter(occupant.rents[year][month]);
        if (!previousRent) {
            if (rentData.payment !== undefined) {
                dbRent.payment = rentData.payment;
            }
            if (rentData.paymentType !== undefined) {
                dbRent.paymentType = rentData.paymentType;
            }
            if (rentData.paymentReference !== undefined) {
                dbRent.paymentReference = rentData.paymentReference;
            }
            if (rentData.paymentDate !== undefined) {
                dbRent.paymentDate = rentData.paymentDate;
            }
            if (rentData.description !== undefined) {
                dbRent.description = rentData.description;
            }
            if (rentData.promo !== undefined) {
                dbRent.promo = rentData.promo;
            }
            if (rentData.notepromo !== undefined) {
                dbRent.notepromo = rentData.notepromo;
            }
        } else {
            previousPayment = previousRent.payment || 0;
            dbRent.balance = previousRent.totalAmount - previousPayment;
        }
        rentPrice = module.exports._computeRent(month, year, occupant.properties);
        if (rentData.vatRatio) {
            dbRent.vatRatio    = rentData.vatRatio;
            dbRent.vatAmount   = math.round((rentPrice.amount + rentPrice.expense - dbRent.discount) * dbRent.vatRatio, 2);
        } else {
            dbRent.vatRatio    = dbRent.vatRatio || 0;
            dbRent.vatAmount   = dbRent.vatAmount || 0;
        }
        dbRent.totalAmount = math.round(rentPrice.amount + rentPrice.expense - dbRent.discount - dbRent.promo + dbRent.vatAmount + dbRent.balance, 2);
        occupant.rents[year][month] = dbRent;
        return dbRent;
    }
    return null;
};

module.exports._buildViewData = function (occupant, rent, month, year) {
    var now = new Date(),
        rentMoment,
        rentUnpaid,
        rentUnpaidMoment,
        countMonthNotPaid;

    if (occupant) {
        rent.occupant = Object.clone(occupant);
        rent._id = rent.occupant._id;
    }

    month = rent.month || month;
    year = rent.year || year;
    rent.month = month > 9 ? month : '0' + Number(month);
    rent.year = year;

    rentMoment = moment(rent.month + ' ' + rent.year, 'MM YYYY');

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

    if (rent.totalAmount <= 0 || rent.newBalance >= 0) {
        rent.status = 'paid';
    } else if (rent.payment > 0) {
        rent.status = 'partialypaid';
    } else {
        if (rentMoment.isBefore(now) || rentMoment.isSame(now)) {
            rent.status = 'notpaid';
            if (rent.occupant.rents) {
                rentUnpaid = rent;
                countMonthNotPaid = 0;
                do {
                    rentUnpaid.totalAmount = rentUnpaid.totalAmount ? Number(rentUnpaid.totalAmount) : 0;
                    rentUnpaid.payment = rentUnpaid.payment ? Number(rentUnpaid.payment) : 0;
                    rentUnpaid.newBalance =  Number((rentUnpaid.payment - rentUnpaid.totalAmount));
                    if (rentUnpaid.newBalance < 0 && rentUnpaid.payment <= 0) {
                        countMonthNotPaid++;
                    } else {
                        break;
                    }
                    rentUnpaid = null;
                    rentUnpaidMoment = rentMoment.subtract(1, 'month');
                    if (rent.occupant.rents[String(rentUnpaidMoment.year())]) {
                        rentUnpaid = rent.occupant.rents[String(rentUnpaidMoment.year())][String(rentUnpaidMoment.month() + 1)];
                    }
                } while (rentUnpaid);

                if (countMonthNotPaid > 1) {
                    rent.countMonthNotPaid = countMonthNotPaid;
                }
            }
        } else {
            delete rent.status;
        }
    }

    if (rent.occupant) {
        delete rent.occupant.rents;
    }

    return rent;
};

module.exports.findAllOccupantRents = function (realm, month, year, callback) {
    var filter = {};
    filter['rents.' + year + '.' + month] = {
        $exists: true
    };
    occupantManager.findAllOccupants(realm, function (errors, occupants) {
        var rents = [],
            occupant,
            rent,
            index;
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            for (index = 0; index < occupants.length; index++) {
                occupant = occupants[index];
                rent = occupant.rents[year][month];
                occupantManager.defaultValuesOccupant(occupant);
                module.exports._buildViewData(occupant, rent, month, year);
                rents.push(rent);
            }
            callback([], rents);
        }
    }, filter);
};

module.exports.findOccupantRents = function (realm, id, month, year, callback) {
    occupantManager.findOccupant(realm, id, function (errors, occupant) {
        var rents = [],
            rent = null,
            years,
            yIndex,
            mIndex,
            currentYear,
            monthes,
            currentMonth,
            currentRent;

        if (errors && errors.length > 0) {
            callback(errors);
            return;
        }

        if (occupant && occupant.rents) {
            years = Object.keys(occupant.rents);
            if (years && years.length > 0) {
                for (yIndex = 0; yIndex < years.length; yIndex++) {
                    currentYear = years[yIndex];
                    monthes = Object.keys(occupant.rents[currentYear]);
                    if (monthes && monthes.length > 0) {
                        for (mIndex = 0; mIndex < monthes.length; mIndex++) {
                            currentMonth = monthes[mIndex];
                            currentRent = occupant.rents[currentYear][currentMonth];
                            if (currentRent) {
                                currentRent.month = currentMonth;
                                currentRent.year = currentYear;
                                module.exports._buildViewData(occupant, currentRent, month, year);
                                rents.push(currentRent);
                            }
                            if (Number(currentMonth) === Number(month) && Number(currentYear) === Number(year)) {
                                rent = currentRent;
                            }
                        }
                    }
                }

                if (!rent) {
                    rent = rents[0];
                }
            }
        }

        callback([], occupant, rent, rents);
    });
};

module.exports.renderModel = function (req, res, callback) {
    var realm = req.session.user.realm,
        date = Helper.currentDate(req.query.month, req.query.year),
        action = req.query.action,
        id = req.query.id,
        model = {
            account: req.session.user,
            rent: null,
            rents: null,
            month: date.month,
            year: date.year,
            frMonthLabels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        };

    if (action === 'update' && id && id.length > 0) {
        module.exports.findOccupantRents(realm, id, date.month, date.year, function (errors, occupant, rent, rents) {
            model.occupant = occupant;
            model.rent = rent;
            model.rent.rowSelected = 'row_selected';
            model.rents = rents;
            callback(errors, model);
        });
    } else {
        module.exports.findAllOccupantRents(realm, date.month, date.year, function (errors, rents) {
            if (rents && rents.length > 0) {
                model.rents = rents;
            } else {
                model.rents = [];
            }

            callback(errors, model);
        });
    }
};

module.exports.one = function (req, res) {
    var realm = req.session.user.realm,
        date = Helper.currentDate(req.body.month, req.body.year),
        id = req.body.id;

    module.exports.findOccupantRents(realm, id, date.month, date.year, function (errors, occupant, rent/*, rents*/) {
        var result = {
            errors: errors,
            rent : rent,
            occupant: occupant
        };
        delete occupant.rents;
        res.json(result);
    });
};

module.exports.update = function (req, res) {
    var realm = req.session.user.realm,
        date = Helper.currentDate(req.body.month, req.body.year),
        rent = paymentSchema.filter(req.body);

    if (!rent.payment || rent.payment <= 0) {
        rent.payment = 0;
        rent.reference = null;
        rent.paymentReference = null;
        rent.paymentDate = null;
        rent.paymentType = null;
    }
    if (!rent.promo && rent.promo <= 0) {
        rent.promo = 0;
        rent.notepromo = null;
    }

    module.exports.findOccupantRents(realm, rent._id, rent.month, rent.year, function (errors, dbOccupant/*, dbRent, rents*/) {
        if (errors && errors.length > 0) {
            res.json({errors: errors});
        } else {
            //console.log(dbOccupant);
            var momentBegin = moment('01/' + rent.month + '/' + rent.year, 'DD/MM/YYYY'),
                previousRent = null;

            do {
                previousRent = module.exports._updateRentPayment(momentBegin, previousRent, dbOccupant, rent);
                momentBegin.add('months', 1);
            } while (previousRent);

            db.update(realm, 'occupants', dbOccupant, function(errors/*, occupants*/) {
                if (errors && errors.length > 0) {
                    res.json({errors: errors});
                } else {
                    res.json(module.exports._buildViewData(dbOccupant, dbOccupant.rents[date.year][date.month], date.month, date.year));
                }
            });
        }
    });
};
