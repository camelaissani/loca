'use strict';
import BL from '../businesslogic';

import moment from 'moment';
import occupantModel from '../models/occupant';
import propertyModel from '../models/property';
import sugar from 'sugar';

// TODO remove this lib
sugar.extend();

function _buildPropertyMap(realm, callback) {
    propertyModel.findFilter(realm, {
        $query: {},
        $orderby: {
            type: 1,
            name: 1
        }
    }, function(errors, properties) {
        let propertyMap = {};
        if (properties) {
            propertyMap = properties.reduce( (acc, property) => {
                acc[property._id.toString()] = property;
                return acc;
            }, {});
        }
        callback(errors, propertyMap);
    });
}

function _getPaidRents(occupant, startMoment=moment(occupant.beginDate, 'DD/MM/YYYY'), excludeCurrentMonth=false) {
    const currentMoment = moment(startMoment);
    const paidRents = [];

    if (excludeCurrentMonth) {
        currentMoment.add(1, 'months');
    }
    let month = currentMoment.month() + 1; // 0 based
    let year = currentMoment.year();
    while (occupant.rents && occupant.rents[year] && occupant.rents[year][month]) {
        const rent = occupant.rents[year][month];
        if (rent.payment && rent.payment !== 0) {
            paidRents.push(month + '/' + year);
        }

        currentMoment.add(1, 'months');
        month = currentMoment.month() + 1; // 0 based
        year = currentMoment.year();
    }
    return paidRents;
}

function _getPaidRentsAfterDate(occupant, startMoment) {
    return _getPaidRents(occupant, startMoment, true);
}

function _createRent(contract, currentMonth, previousRent) {
    const prevRent = previousRent ? {
        total: {
            grandTotal: previousRent.totalAmount || 0,
            payment: previousRent.payment || 0
        }
    } : null;
    const settlements = {
        payments: [],
        discounts: []
    };
    const computedRent = BL.computeRent(contract, currentMonth, prevRent, settlements);
    const month = computedRent.month;
    const year = computedRent.year;

    return {
        month,
        year,
        'discount': computedRent.total.discount,
        'promo': 0,
        'balance': computedRent.balance,
        'isVat': computedRent.vats.length > 0,
        'vatRatio': computedRent.vats.length > 0 ? computedRent.vats[0].rate : 0,
        'vatAmount': computedRent.total.vat,
        'totalAmount': computedRent.total.grandTotal
    };
}

function _createUpdateContractRents(contract, inputRents) {
    const rents = inputRents ? JSON.parse(JSON.stringify(inputRents)) : {};
    const begin = moment(contract.begin, 'DD/MM/YYYY');
    const end = moment(contract.end, 'DD/MM/YYYY');

    // clean rent which are not in contract time-frame
    // except if there is a payment
    if (rents) {
        // find all rents to delete
        Object.keys(rents).map(year => {
            return {
                year,
                months: Object.keys(rents[year]).reduce((acc, month) => {
                    const rentMoment = moment(`01/${month}/${year}`, 'DD/MM/YYYY');
                    if (rentMoment.isBetween(begin, end, 'month', '[]')
                        && !rents[year][month].payment) {
                        acc.push(month);
                    }
                    return acc;
                }, [])
            };
        }).forEach(rentsToDelete => {
            if (rentsToDelete.months.length>0) {
                // delete rents of year
                if (rentsToDelete.months.length===12) {
                    delete rents[rentsToDelete.year];
                } else {
                    rentsToDelete.months.forEach(month => {
                        delete rents[rentsToDelete.year][month];
                    });
                }
            }
        });
    }

    // update rents according to the contract
    let currentMonth = begin;
    let previousRent;
    while (currentMonth.isSameOrBefore(end, 'month')) {
        const month = currentMonth.month() + 1; // 0 based
        const year = currentMonth.year();
        if (!rents[year]) {
            rents[year] = {};
        }
        if (!rents[year][month]) {
            rents[year][month] = _createRent(contract, currentMonth.format('DD/MM/YYYY'), previousRent);
        }
        previousRent = rents[year][month];
        currentMonth.add(1, 'months');
    }

    return rents;
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function findOccupant(realm, id, callback) {
    occupantModel.findOne(realm, id, (errors, occupant) => {
        if (errors) {
            callback(errors);
        } else {
            callback(errors, occupant);
        }
    });
}

function findAllOccupants(realm, callback, filter) {
    if (!filter) {
        filter = {};
    }
    occupantModel.findFilter(realm, {
        $query: filter,
        $orderby: {
            name: 1
        }
    }, (errors, occupants) => {
        callback(errors, occupants);
    });
}

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

        const contract = {
            begin: occupant.beginDate,
            end: occupant.endDate,
            discount: occupant.discount || 0,
            vatRate: occupant.vatRatio,
            properties: occupant.properties
        };
        occupant.rents = _createUpdateContractRents(contract, occupant.rents);
        occupantModel.add(realm, occupant, (errors, occupant) => {
            if (errors) {
                res.json({
                    errors: errors
                });
                return;
            }
            delete occupant.rents;
            res.json(occupant);
        });
    });
}

function update(req, res) {
    const realm = req.realm;
    const occupant = occupantModel.schema.filter(req.body);
    const momentEnd = occupant.terminationDate ? moment(occupant.terminationDate, 'DD/MM/YYYY') : moment(occupant.endDate, 'DD/MM/YYYY');

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

    findOccupant(realm, occupant._id, (errors, dbOccupant) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }
        delete dbOccupant._id;
        occupant.rents = dbOccupant.rents;
        if (dbOccupant.documents) {
            occupant.documents = dbOccupant.documents;
        }

        const afterPaidRents = _getPaidRentsAfterDate(occupant, momentEnd);
        if (!afterPaidRents || afterPaidRents.length === 0) {
            _buildPropertyMap(realm, (errors, propertyMap) => {
                if (errors && errors.length > 0) {
                    res.json({
                        errors: errors
                    });
                    return;
                }

                // Resolve proprerties
                const properties = [];
                occupant.properties.forEach((item) => {
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
                    properties.push(itemToKeep);
                });
                occupant.properties = properties;

                const contract = {
                    begin: occupant.beginDate,
                    end: occupant.endDate,
                    discount: occupant.discount || 0,
                    vatRate: occupant.vatRatio,
                    properties: occupant.properties
                };
                occupant.rents = _createUpdateContractRents(contract, occupant.rents);

                occupantModel.update(realm, occupant, (errors) => {
                    if (errors) {
                        res.json({
                            errors: errors
                        });
                        return;
                    }
                    delete occupant.rents;
                    res.json(occupant);
                });
            });
            return;
        }

        res.json({
            // TODO: to localize
            errors: ['Impossible de mettre à jour le dossier du locataire.', 'Des paiments de loyer ont été effectués après la nouvelle date de fin du bail']
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
                const occupantsWithPaidRents = occupants.filter(occupant => _getPaidRents(occupant).length > 0);
                if (occupantsWithPaidRents.length > 0) {
                    // TODO: to localize
                    callback(['Impossible de supprimer le locataire : ' + occupantsWithPaidRents[0].name + '. Des loyers ont été encaissés.']);
                    return;
                }
                callback([]);
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
    findAllOccupants(realm, function(errors, occupants) {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
        } else {
            res.json(occupants.map(occupant => {
                delete occupant.rents;
                return occupant;
            }));
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

    findAllOccupants(realm, function(errors, occupants) {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
        } else {

            if (occupants) {
                result.countAll = occupants.length;
                result = occupants.reduce((acc, occupant) => {
                    if (!occupant.terminationDate) {
                        acc.countActive++;
                    } else {
                        acc.countInactive++;
                    }
                    return acc;
                }, result);
            }
            res.json(result);
        }
    });
}

export default {
    findOccupant,
    findAllOccupants,
    // one,
    add,
    update,
    remove,
    all,
    overview
};
