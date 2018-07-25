'use strict';

const moment = require('moment');
const FD = require('./frontdata');
const Contract = require('./contract');
const occupantModel = require('../models/occupant');
const propertyModel = require('../models/property');

function _buildPropertyMap(realm, callback) {
    propertyModel.findFilter(realm, {
        $query: {},
        $orderby: {
            type: 1,
            name: 1
        }
    }, (errors, properties) => {
        const propertyMap = {};
        if (properties) {
            properties.reduce( (acc, property) => {
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

    if (!occupant.properties || occupant.properties.length === 0) {
        res.json({
            errors: ['Missing properties']
        });
        return;
    }

    if (!occupant.isCompany) {
        occupant.company = null;
        occupant.legalForm = null;
        occupant.siret = null;
        occupant.capital = null;
        occupant.name = occupant.manager;
    } else {
        occupant.name = occupant.company;
    }

    _buildPropertyMap(realm, (errors, propertyMap) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        // Resolve proprerties
        occupant.properties.forEach((item) => {
            item.property = propertyMap[item.propertyId];
        });

        const contract = Contract.create({
            begin: occupant.beginDate,
            end: occupant.endDate,
            frequency: 'months',
            properties: occupant.properties
        });

        occupant.rents = contract.rents;

        occupantModel.add(realm, occupant, (errors, occupant) => {
            if (errors) {
                res.json({
                    errors: errors
                });
                return;
            }
            res.json(FD.toOccupantData(occupant));
        });
    });
}

function update(req, res) {
    const realm = req.realm;
    const occupantId = req.params.id;
    const occupant = occupantModel.schema.filter(req.body);

    if (!occupant.properties || occupant.properties.length === 0) {
        res.json({
            errors: ['Missing properties']
        });
        return;
    }


    if (!occupant.isCompany) {
        occupant.company = null;
        occupant.legalForm = null;
        occupant.siret = null;
        occupant.capital = null;
        occupant.name = occupant.manager;
    } else {
        occupant.name = occupant.company;
    }

    occupantModel.findOne(realm, occupantId, (errors, dbOccupant) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        if (dbOccupant.documents) {
            occupant.documents = dbOccupant.documents;
        }

        _buildPropertyMap(realm, (errors, propertyMap) => {
            if (errors && errors.length > 0) {
                res.json({
                    errors: errors
                });
                return;
            }

            // Resolve proprerties
            occupant.properties = occupant.properties.map((item) => {
                let itemToKeep;
                dbOccupant.properties.forEach((dbItem) => {
                    if (dbItem.propertyId === item.propertyId) {
                        itemToKeep = dbItem;
                    }
                });
                if (!itemToKeep) {
                    itemToKeep = {
                        propertyId: item.propertyId,
                        property: propertyMap[item.propertyId],
                        entryDate: item.entryDate,
                        exitDate: item.exitDate
                    };
                } else {
                    itemToKeep.entryDate = item.entryDate;
                    itemToKeep.exitDate = item.exitDate;
                }
                return itemToKeep;
            });

            const contract = {
                begin: dbOccupant.beginDate,
                end: dbOccupant.endDate,
                frequency: 'months',
                terms: Math.round(
                    moment(dbOccupant.endDate, 'DD/MM/YYYY')
                        .diff(moment(dbOccupant.beginDate, 'DD/MM/YYYY'), 'months', true)),
                properties: dbOccupant.proprerties,
                vatRate: dbOccupant.vatRatio,
                discount: dbOccupant.discount,
                rents: dbOccupant.rents
            };

            const modification = {
                begin: occupant.beginDate,
                end: occupant.endDate,
                termination: occupant.terminationDate,
                properties: occupant.properties
            };

            try {
                const newContract = Contract.update(contract, modification);

                occupant.rents = newContract.rents;

                occupantModel.update(realm, occupant, (errors) => {
                    if (errors) {
                        res.json({
                            errors: errors
                        });
                        return;
                    }
                    res.json(FD.toOccupantData(occupant));
                });
            } catch (e) {
                res.json({
                    errors: [String(e)]
                });
            }
        });
    });
}

function remove(req, res) {
    const realm = req.realm;
    const occupantIds = req.params.ids.split(',');

    function releaseRent(callback) {
        const occupantfilters = occupantIds.map(_id => {return {_id};});

        occupantModel.findFilter(realm, {
            $query: {
                $or: occupantfilters
            },
            $orderby: {
                company: 1
            }
        }, (errors, occupants) => {
            if (errors) {
                res.json({
                    errors: []
                });
                return;
            }
            if (occupants) {
                const occupantsWithPaidRents = occupants.filter(occupant => {
                    return occupant.rents
                        .some(rent => (rent.payments && rent.payments.some(payment => payment.amount > 0)) ||
                            rent.discounts.some(discount => discount.origin === 'settlement'));
                });
                if (occupantsWithPaidRents.length > 0) {
                    // TODO: to localize
                    callback(['Impossible de supprimer le locataire : ' + occupantsWithPaidRents[0].name + '. Des loyers ont été encaissés.']);
                    return;
                }
                occupantModel.remove(
                    realm,
                    occupants.map(occupant => occupant._id.toString()),
                    error => error ? callback([error]) : callback([]));
            }
        });
    }

    releaseRent((errors) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        occupantModel.remove(realm, occupantIds, (errors) => {
            res.json({
                errors: errors
            });
        });
    });
}

function all(req, res) {
    const realm = req.realm;
    occupantModel.findFilter(realm, {
        $orderby: {
            name: 1
        }
    }, (errors, occupants) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
        } else {
            res.json(occupants.map(occupant => FD.toOccupantData(occupant)));
        }
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

    occupantModel.findFilter(realm, {
        $orderby: {
            name: 1
        }
    }, (errors, occupants) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
        } else {

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
        }
    });
}

module.exports = {
    add,
    update,
    remove,
    all,
    overview
};
