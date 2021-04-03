const logger = require('winston');
const { customAlphabet } = require('nanoid');
const moment = require('moment');
const FD = require('./frontdata');
const Contract = require('./contract');
const occupantModel = require('../models/occupant');
const propertyModel = require('../models/property');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);

function _buildPropertyMap(realm, callback) {
    propertyModel.findAll(realm, (errors, properties) => {
        const propertyMap = {};
        if (properties) {
            properties.reduce((acc, property) => {
                acc[property._id.toString()] = property;
                return acc;
            }, propertyMap);
        }
        callback(errors, propertyMap);
    });
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function add(req, res) {
    const realm = req.realm;
    const occupant = occupantModel.schema.filter(req.body);

    if (!occupant.isCompany) {
        occupant.company = null;
        occupant.legalForm = null;
        occupant.siret = null;
        occupant.capital = null;
        occupant.name = occupant.name || occupant.manager;
    } else {
        occupant.name = occupant.company;
    }

    occupant.reference = occupant.reference || nanoid();

    if (!occupant.name) {
        return res.status(422).json({
            errors: ['Missing tenant name']
        });
    }

    _buildPropertyMap(realm, (errors, propertyMap) => {
        if (errors && errors.length > 0) {
            return res.status(404).json({
                errors: errors
            });
        }

        // Resolve proprerties
        if (occupant.properties) {
            occupant.properties.forEach((item) => {
                item.property = propertyMap[item.propertyId];
            });
        }

        // Build rents from contract
        occupant.rents = [];
        if (occupant.beginDate && occupant.endDate && occupant.properties) {
            const contract = Contract.create({
                begin: occupant.beginDate,
                end: occupant.endDate,
                frequency: 'months',
                properties: occupant.properties
            });

            occupant.rents = contract.rents;
        }

        occupantModel.add(realm, occupant, (errors, occupant) => {
            if (errors) {
                return res.status(500).json({
                    errors: errors
                });
            }
            res.json(FD.toOccupantData(occupant));
        });
    });
}

function update(req, res) {
    const realm = req.realm;
    const occupantId = req.params.id;
    const occupant = occupantModel.schema.filter(req.body);

    if (!occupant.isCompany) {
        occupant.company = null;
        occupant.legalForm = null;
        occupant.siret = null;
        occupant.capital = null;
        occupant.name = occupant.name || occupant.manager;
    } else {
        occupant.name = occupant.company;
    }

    occupant.reference = occupant.reference || nanoid();

    if (!occupant.name) {
        return res.status(422).json({
            errors: ['Missing tenant name']
        });
    }

    occupantModel.findOne(realm, occupantId, (errors, dbOccupant) => {
        if (errors && errors.length > 0) {
            return res.status(404).json({
                errors: errors
            });
        }

        if (dbOccupant.documents) {
            occupant.documents = dbOccupant.documents;
        }

        _buildPropertyMap(realm, (errors, propertyMap) => {
            if (errors && errors.length > 0) {
                return res.status(404).json({
                    errors: errors
                });
            }

            // Resolve proprerties
            if (occupant.properties) {
                occupant.properties = occupant.properties.map((item) => {
                    let itemToKeep;
                    if (dbOccupant.properties) {
                        dbOccupant.properties.forEach((dbItem) => {
                            if (dbItem.propertyId === item.propertyId) {
                                itemToKeep = dbItem;
                            }
                        });
                    }
                    if (!itemToKeep) {
                        itemToKeep = {
                            propertyId: item.propertyId,
                            property: propertyMap[item.propertyId],
                        };
                    }
                    itemToKeep.entryDate = item.entryDate || occupant.beginDate;
                    itemToKeep.exitDate = item.exitDate || occupant.endDate;
                    return itemToKeep;
                });
            }

            // Build rents from contract
            occupant.rents = [];
            if (occupant.beginDate && occupant.endDate && occupant.properties) {
                try {
                    const contract = {
                        begin: dbOccupant.beginDate,
                        end: dbOccupant.endDate,
                        frequency: 'months',
                        terms: Math.ceil(
                            moment(dbOccupant.endDate, 'DD/MM/YYYY')
                                .diff(moment(dbOccupant.beginDate, 'DD/MM/YYYY'), 'months', true)),
                        properties: dbOccupant.properties,
                        vatRate: dbOccupant.vatRatio,
                        discount: dbOccupant.discount,
                        rents: dbOccupant.rents
                    };

                    const modification = {
                        begin: occupant.beginDate,
                        end: occupant.endDate,
                        termination: occupant.terminationDate,
                        properties: occupant.properties,
                    };
                    if (occupant.vatRatio !== undefined) {
                        modification.vatRate = occupant.vatRatio;
                    }
                    if (occupant.discount !== undefined) {
                        modification.discount = occupant.discount;
                    }

                    const newContract = Contract.update(contract, modification);
                    occupant.rents = newContract.rents;
                } catch (e) {
                    logger.error(e);
                    return res.sendStatus(500);
                }
            }

            occupantModel.update(realm, occupant, (errors) => {
                if (errors) {
                    return res.status(500).json({
                        errors: errors
                    });
                }
                res.json(FD.toOccupantData(occupant));
            });
        });
    });
}

function remove(req, res) {
    const realm = req.realm;
    const occupantIds = req.params.ids.split(',');

    function releaseRent(callback) {
        const occupantfilters = occupantIds.map(_id => { return { _id }; });

        occupantModel.findFilter(realm, {
            $query: {
                $or: occupantfilters
            }
        }, (errors, occupants) => {
            if (errors) {
                return res.status(500).json({
                    errors
                });
            }

            if (!occupants || !occupants.length) {
                return res.sendStatus(404);
            }

            if (occupants) {
                const occupantsWithPaidRents = occupants.filter(occupant => {
                    return occupant.rents
                        .some(rent => (rent.payments && rent.payments.some(payment => payment.amount > 0)) ||
                            rent.discounts.some(discount => discount.origin === 'settlement'));
                });
                if (occupantsWithPaidRents.length > 0) {
                    // TODO: to localize
                    return res.status(422).json({
                        errors: ['Impossible de supprimer le locataire : ' + occupantsWithPaidRents[0].name + '. Des loyers ont été encaissés.']
                    });
                }
                occupantModel.remove(
                    realm,
                    occupants.map(occupant => occupant._id.toString()),
                    errors => {
                        if (errors) {
                            return res.status(500).json({
                                errors
                            });
                        }
                        callback();
                    });
            }
        });
    }

    releaseRent(() => {
        occupantModel.remove(realm, occupantIds, (errors) => {
            if (errors) {
                return res.status(500).json({
                    errors
                });
            }
            res.sendStatus(200);
        });
    });
}

function all(req, res) {
    const realm = req.realm;
    occupantModel.findAll(realm, (errors, occupants) => {
        if (errors && errors.length > 0) {
            return res.status(500).json({
                errors: errors
            });
        }

        res.json(occupants.map(occupant => FD.toOccupantData(occupant)));
    });
}

function one(req, res) {
    const realm = req.realm;
    const occupantId = req.params.id;
    occupantModel.findOne(realm, occupantId, (errors, dbOccupant) => {
        if (errors && errors.length > 0) {
            return res.status(404).json({
                errors: errors
            });
        }

        res.json(FD.toOccupantData(dbOccupant));
    });
}

function overview(req, res) {
    const realm = req.realm;
    let result = {
        countAll: 0,
        countActive: 0,
        countInactive: 0
    };
    const currentDate = moment();

    occupantModel.findAll(realm, (errors, occupants) => {
        if (errors && errors.length > 0) {
            return res.status(404).json({
                errors: errors
            });
        }

        if (occupants) {
            result.countAll = occupants.length;
            result = occupants.reduce((acc, occupant) => {
                const endMoment = moment(occupant.terminationDate || occupant.endDate, 'DD/MM/YYYY');
                if (endMoment.isBefore(currentDate, 'day')) {
                    acc.countInactive++;
                } else {
                    acc.countActive++;
                }
                return acc;
            }, result);
        }
        res.json(result);
    });
}

module.exports = {
    add,
    update,
    remove,
    one,
    all,
    overview
};
