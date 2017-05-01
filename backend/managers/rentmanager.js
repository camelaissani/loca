'use strict';

import moment from 'moment';
import Contract from './contract';
import FD from './frontdata';
import rentModel from '../models/rent';
import occupantModel from '../models/occupant';

function _findAllOccupantRents(realm, month, year, callback) {
    occupantModel.findFilter(realm, {
        $orderby: {
            name: 1
        }
    }, (errors, occupants) => {
        if (errors && errors.length > 0) {
            callback(errors);
            return;
        }
        const occupantRents = [];
        const term = Number(moment(`01/${month}/${year} 00:00`, 'DD/MM/YYYY HH:mm').format('YYYYMMDDHH'));
        occupants.forEach(occupant => {
            const rents = occupant.rents.filter(rent => rent.term === term);
            if (rents.length>0) {
                occupantRents.push(FD.toRentData(rents[0], occupant));
            }
        });
        callback([], occupantRents);
    });
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

    occupantModel.findOne(realm, paymentData._id, (errors, dbOccupant) => {
        if (errors && errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        const contract = {
            frequency: 'months',
            begin: dbOccupant.beginDate,
            end: dbOccupant.endDate,
            discount: dbOccupant.discount || 0,
            vatRate: dbOccupant.vatRatio,
            properties: dbOccupant.properties,
            rents: dbOccupant.rents
        };

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
                    origin: 'settlement',
                    description: paymentData.notepromo || '',
                    amount: paymentData.promo * (1 / (1 + contract.vatRate))
                });
            }
        }

        dbOccupant.rents = Contract.payTerm(contract, `01/${paymentData.month}/${paymentData.year} 00:00`, settlements).rents;

        occupantModel.update(realm, dbOccupant, (errors) => {
            if (errors) {
                res.json({errors: errors});
                return;
            }
            const rent = dbOccupant.rents.filter(rent => rent.term === Number(currentDate.format('YYYYMMDDHH')))[0];

            res.json(FD.toRentData(rent, dbOccupant));
        });
    });
}

function rentsOfOccupant(req, res) {
    const realm = req.realm;
    const id = req.params.id;
    const term = Number(moment().startOf('month').format('YYYYMMDDHH'));

    occupantModel.findOne(realm, id, (errors, dbOccupant) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        const rentsToReturn = dbOccupant.rents.map( currentRent => {
            const rent = FD.toRentData(currentRent);
            if (currentRent.term === term) {
                rent.active = 'active';
            }
            rent.vatRatio = dbOccupant.vatRatio;
            return rent;
        });

        const occupant = FD.toOccupantData(dbOccupant);

        res.json({
            occupant,
            rents: rentsToReturn
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

        const overview = {
            countAll: 0,
            countPaid: 0,
            countPartiallyPaid: 0,
            countNotPaid: 0,
            totalToPay: 0,
            totalPaid: 0,
            totalNotPaid: 0
        };

        if (rents) {
            rents.reduce((acc, currentRent) => {
                if (currentRent.totalAmount <= 0 || currentRent.newBalance >= 0) {
                    acc.countPaid++;
                } else if (currentRent.payment > 0) {
                    acc.countPartiallyPaid++;
                } else {
                    acc.countNotPaid++;
                }
                acc.countAll ++;
                acc.totalToPay += currentRent.totalToPay;
                acc.totalPaid += currentRent.payment;
                acc.totalNotPaid -= currentRent.newBalance;

                return acc;
            }, overview);
        }
        res.json(overview);
    });
}

export default {
    update,
    rentsOfOccupant,
    all,
    overview
};
