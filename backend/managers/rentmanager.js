const logger = require('winston');
const axios = require('axios');
const moment = require('moment-timezone');
const Contract = require('./contract');
const FD = require('./frontdata');
const rentModel = require('../models/rent');
const occupantModel = require('../models/occupant');
const config = require('../../config');

const _findAllOccupants = realm => {
    return new Promise((resolve, reject) => {
        occupantModel.findAll(realm, (errors, occupants) => {
            if (errors && errors.length > 0) {
                return reject(errors);
            }
            resolve(occupants);
        });
    });
};

const _getEmailStatus = async term => {
    try {
        logger.debug(`get email status ${config.EMAILER_URL}/status/${term}`);
        const response = await axios.get(`${config.EMAILER_URL}/status/${term}`);
        logger.debug(response.data);
        return response.data.reduce((acc, status) => {
            const data = {
                sentTo: status.sentTo,
                sentDate: status.sentDate
            };
            if (!acc[status.recordId]) {
                acc[status.recordId] = { [status.templateName]: [] };
            }
            let documents = acc[status.recordId][status.templateName];
            if (!documents) {
                documents = [];
                acc[status.recordId][status.templateName] = documents;
            }
            documents.push(data);
            return acc;
        }, {});
    } catch (error) {
        if (config.demoMode) {
            logger.info('email status fallback workflow activated in demo mode');
            return {};
        } else {
            throw error.data;
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
const update = (req, res) => {
    const realm = req.realm;
    let paymentData = rentModel.paymentSchema.filter(req.body);
    let currentDate = moment();

    if (req.body.year && req.body.month) {
        currentDate = moment(`${req.body.month}/${req.body.year}`, 'MM/YYYY');
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
            return res.json({ errors: errors });
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
            discounts: [],
            description: ''
        };
        if (paymentData) {
            if (paymentData.payments && paymentData.payments.length) {
                settlements.payments = paymentData.payments
                    .filter(({ amount }) => amount && Number(amount) > 0)
                    .map(payment => ({
                        date: payment.date || '',
                        amount: Number(payment.amount),
                        type: payment.type || '',
                        reference: payment.reference || '',
                        description: payment.description || ''
                    }));
            }

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

            if (paymentData.description) {
                settlements.description = paymentData.description;
            }
        }

        dbOccupant.rents = Contract.payTerm(contract, `01/${paymentData.month}/${paymentData.year} 00:00`, settlements).rents;

        occupantModel.update(realm, dbOccupant, (errors) => {
            if (errors) {
                return res.json({ errors: errors });
            }
            const rent = dbOccupant.rents.filter(rent => rent.term === Number(currentDate.format('YYYYMMDDHH')))[0];

            res.json(FD.toRentData(rent, dbOccupant));
        });
    });
};

const rentsOfOccupant = (req, res) => {
    const realm = req.realm;
    const id = req.params.id;
    const term = Number(moment().startOf('month').format('YYYYMMDDHH'));

    occupantModel.findOne(realm, id, (errors, dbOccupant) => {
        if (errors && errors.length > 0) {
            return res.json({
                errors: errors
            });
        }

        const rentsToReturn = dbOccupant.rents.map(currentRent => {
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
};

const all = async (req, res) => {
    const realm = req.realm;

    let currentDate = moment();
    if (req.params.year && req.params.month) {
        currentDate = moment(`${req.params.month}/${req.params.year}`, 'MM/YYYY');
    }
    const month = currentDate.month() + 1;
    const year = currentDate.year();
    const term = Number(moment(`01/${month}/${year} 00:00`, 'DD/MM/YYYY HH:mm').format('YYYYMMDDHH'));

    try {
        const [dbOccupants, emailStatus = {}] = await Promise.all([
            _findAllOccupants(realm),
            _getEmailStatus(term).catch(logger.error)
        ]);
        const occupants = dbOccupants.reduce((acc, occupant) => {
            const rents = occupant.rents.filter(rent => rent.term === term);
            if (rents.length > 0) {
                acc.push(occupant);
            }
            return acc;
        }, []);
        res.json(occupants.map(occupant => {
            const rents = occupant.rents.filter(rent => rent.term === term);
            return FD.toRentData(
                rents[0],
                occupant,
                emailStatus && emailStatus[occupant._id]
            );
        }));
    } catch (errors) {
        logger.error(errors);
        res.status(500).json({ errors });
    }
};

const overview = async (req, res) => {
    try {
        const realm = req.realm;
        let currentDate = moment();

        if (req.params.year && req.params.month) {
            currentDate = moment(`${req.params.month}/${req.params.year}`, 'MM/YYYY');
        }
        const month = currentDate.month() + 1;
        const year = currentDate.year();
        const term = Number(moment(`01/${month}/${year} 00:00`, 'DD/MM/YYYY HH:mm').format('YYYYMMDDHH'));

        const dbOccupants = await _findAllOccupants(realm);
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
                if (rents.length > 0) {
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
                acc.countAll++;
                acc.totalToPay += rentData.totalToPay;
                acc.totalPaid += rentData.payment;
                acc.totalNotPaid -= rentData.newBalance;
                return acc;
            }, overview));
    } catch(errors) {
        res.json({
            errors: errors
        });
    }
};

module.exports = {
    update,
    rentsOfOccupant,
    all,
    overview
};
