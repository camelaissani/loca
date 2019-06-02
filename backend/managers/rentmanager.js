'use strict';
const logger = require('winston');
const http = require('http');
const moment = require('moment-timezone');
const Contract = require('./contract');
const FD = require('./frontdata');
const rentModel = require('../models/rent');
const occupantModel = require('../models/occupant');
const config = require('../../config');

function _findAllOccupants(realm) {
    return new Promise((resolve, reject) => {
        occupantModel.findFilter(realm, {
            $orderby: {
                name: 1
            }
        }, (errors, occupants) => {
            if (errors && errors.length > 0) {
                reject(errors);
                return;
            }
            resolve(occupants);
        });
    });
}

function _getEmailStatus(term) {
    return new Promise((resolve, reject) => {
        logger.debug(`get email status ${config.EMAILER_URL}/status/${term}`);
        const req = http.request(`${config.EMAILER_URL}/status/${term}`);
        req.on('response', subRes => {
            let body = '';
            subRes.on('data', chunk => body+=chunk);
            subRes.on('end', () => {
                const emailStatus = JSON.parse(body).reduce((acc, status) => {
                    const data = {
                        to: status.to,
                        sentDate: status.sentDate
                    };
                    if (!acc[status.tenantId]) {
                        acc[status.tenantId] = {[status.document]: []};
                    }
                    let documents = acc[status.tenantId][status.document];
                    if (!documents) {
                        documents = [];
                        acc[status.tenantId][status.document] = documents;
                    }
                    documents.push(data);
                    return acc;
                }, {});
                resolve(emailStatus);
            });
        });
        req.on('error', error => {
            if (config.demomode) {
                logger.error(error);
                logger.info('email status fallback workflow activated in demo mode');
                resolve({});
            } else {
                reject(error);
            }
        });
        req.end();
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

    if (!paymentData.extracharge && paymentData.extracharge <= 0) {
        paymentData.extracharge = 0;
        paymentData.noteextracharge = null;
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
            debts: [],
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
                    amount: paymentData.promo * (contract.vatRate ? (1 / (1 + contract.vatRate)) : 1)
                });
            }

            if (paymentData.extracharge) {
                settlements.debts.push({
                    description: paymentData.noteextracharge || '',
                    amount: paymentData.extracharge * (contract.vatRate ? (1 / (1 + contract.vatRate)) : 1)
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
    const month = currentDate.month() + 1;
    const year = currentDate.year();
    const term = Number(moment(`01/${month}/${year} 00:00`, 'DD/MM/YYYY HH:mm').format('YYYYMMDDHH'));

    const occupants = [];
    _findAllOccupants(realm)
        .then(dbOccupants => {
            dbOccupants.reduce((acc, occupant) => {
                const rents = occupant.rents.filter(rent => rent.term === term);
                if (rents.length>0) {
                    acc.push(occupant);
                }
                return acc;
            }, occupants);
            return _getEmailStatus(term);
        })
        .then(emailStatus => {
            res.json(occupants.map(occupant => {
                const rents = occupant.rents.filter(rent => rent.term === term);
                return FD.toRentData(
                    rents[0],
                    occupant,
                    emailStatus[occupant._id]
                );
            }));
        })
        .catch(errors => res.json({errors}));
}

function overview(req, res) {
    const realm = req.realm;
    let currentDate = moment();

    if (req.params.year && req.params.month) {
        currentDate = moment(`${req.params.month}/${req.params.year}`, 'MM/YYYY');
    }
    const month = currentDate.month() + 1;
    const year = currentDate.year();
    const term = Number(moment(`01/${month}/${year} 00:00`, 'DD/MM/YYYY HH:mm').format('YYYYMMDDHH'));

    _findAllOccupants(realm)
        .then(dbOccupants => {
            const overview = {
                countAll: 0,
                countPaid: 0,
                countPartiallyPaid: 0,
                countNotPaid: 0,
                totalToPay: 0,
                totalPaid: 0,
                totalNotPaid: 0
            };

            res.json(dbOccupants
                .reduce((acc, occupant) => {
                    const rents = occupant.rents.filter(rent => rent.term === term);
                    if (rents.length>0) {
                        acc.push(FD.toRentData(rents[0], occupant));
                    }
                    return acc;
                }, [])
                .reduce((acc, rentData) => {
                    if (rentData.totalAmount <= 0 || rentData.newBalance >= 0) {
                        acc.countPaid++;
                    } else if (rentData.payment > 0) {
                        acc.countPartiallyPaid++;
                    } else {
                        acc.countNotPaid++;
                    }
                    acc.countAll ++;
                    acc.totalToPay += rentData.totalToPay;
                    acc.totalPaid += rentData.payment;
                    acc.totalNotPaid -= rentData.newBalance;
                    return acc;
                }, overview));
        })
        .catch(errors => {
            res.json({
                errors: errors
            });
        });
}

module.exports = {
    update,
    rentsOfOccupant,
    all,
    overview
};
