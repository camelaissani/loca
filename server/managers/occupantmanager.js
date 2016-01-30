'use strict';

var mongojs = require('mongojs'),
    moment = require('moment'),
    occupantModel = require('../models/occupant'),
    propertyModel = require('../models/property'),
    Helper = require('./helper'),
    rentManager = require('./rentmanager');

require('sugar');

function buildPropertyMap(realm, callback) {
    var index, property;
    var propertyMap = {};

    propertyModel.findFilter(realm, {
        $query: {},
        $orderby: {
            type: 1,
            name: 1
        }
    }, function(errors, properties) {
        if (properties && properties.length > 0) {
            for (index = 0; index < properties.length; index++) {
                property = properties[index];
                propertyMap[property._id.toString()] = property;
            }
        }
        callback(errors, propertyMap);
    });
}

function _getPaidRents(occupant, startMoment, excludeCurrentMonth) {
    var currentMoment = moment(startMoment),
        month,
        year,
        paidRents = [],
        rent;

    if (excludeCurrentMonth) {
        currentMoment.add(1, 'months');
    }
    month = currentMoment.month() + 1; // 0 based
    year = currentMoment.year();
    while (occupant.rents && occupant.rents[year] && occupant.rents[year][month]) {
        rent = occupant.rents[year][month];
        if (rent.payment && rent.payment !== 0) {
            paidRents.push(month + '/' + year);
        }

        currentMoment.add(1, 'months');
        month = currentMoment.month() + 1; // 0 based
        year = currentMoment.year();
    }
    return paidRents;
}

function getPaidRents(occupant) {
    var startMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
    return _getPaidRents(occupant, startMoment, false);
}

function getPaidRentsAfterDate(occupant, startMoment) {
    return _getPaidRents(occupant, startMoment, true);
}

module.exports.defaultValuesOccupant = function(occupant) {
    occupant.street1 = occupant.street1 ? occupant.street1 : '';
    occupant.street2 = occupant.street2 ? occupant.street2 : '';
    occupant.zipCode = occupant.zipCode ? occupant.zipCode : '';
    occupant.city = occupant.city ? occupant.city : '';

    occupant.legalForm = occupant.legalForm ? occupant.legalForm : '';
    occupant.siret = occupant.siret ? occupant.siret : '';
    occupant.contract = occupant.contract ? occupant.contract : '';
    occupant.reference = occupant.reference ? occupant.reference : '';

    occupant.guaranty = occupant.guaranty ? Number(occupant.guaranty) : 0;
    if (occupant.isVat) {
        occupant.vatRatio = occupant.vatRatio ? Number(occupant.vatRatio) : 0;
    } else {
        occupant.vatRatio = 0;
    }
    occupant.discount = occupant.discount ? Number(occupant.discount) : 0;

    var date = Helper.currentDate();
    // Compute if contract is completed
    if (!occupant.terminationDate.isBlank()) {
        var currentDate = moment([date.year, date.month - 1, date.day]).endOf('day');
        var momentTermination = moment(occupant.terminationDate, 'DD/MM/YYYY').endOf('day');
        if (momentTermination.isBefore(currentDate)) {
            occupant.terminated = true;
        }
    } else {
        occupant.terminated = false;
    }

    return occupant;
};

module.exports.findOccupant = function(realm, id, callback) {
    occupantModel.findOne(realm, id, function(errors, occupant) {
        if (errors) {
            callback(errors);
        } else {
            callback(errors, occupant);
        }
    });
};

module.exports.findAllOccupants = function(realm, callback, filter) {
    if (!filter) {
        filter = {};
    }
    occupantModel.findFilter(realm, {
        $query: filter,
        $orderby: {
            name: 1
        }
    }, function(errors, occupants) {
        callback(errors, occupants);
    });
};

module.exports.one = function(req, res) {
    var realm = req.session.user.realm,
        date = Helper.currentDate(req.query.month, req.query.year),
        id = req.body.id;

    module.exports.findOccupant(realm, id, date.month, date.year, function(errors, occupant /*, office, parking*/ ) {
        delete occupant.rents;
        var result = {
            errors: errors,
            occupant: occupant
        };
        res.json(result);
    });
};

module.exports.add = function(req, res) {
    var realm = req.session.user.realm,
        occupant = occupantModel.schema.filter(req.body),
        momentBegin = moment(occupant.beginDate, 'DD/MM/YYYY'),
        momentEnd = moment(occupant.endDate, 'DD/MM/YYYY');
    var previousRent;

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

    buildPropertyMap(realm, function(errors, propertyMap) {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        // Resolve proprerties
        occupant.properties.forEach(function(item /*, index*/ ) {
            item.property = propertyMap[item.propertyId];
        });

        while (momentBegin.isBefore(momentEnd) || momentBegin.isSame(momentEnd)) {
            previousRent = rentManager.createRent(momentBegin, momentEnd, previousRent, occupant);
            momentBegin.add(1, 'months');
        }
        occupantModel.add(realm, occupant, function(errors, occupant) {
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
};

module.exports.update = function(req, res) {
    var realm = req.session.user.realm,
        occupant = occupantModel.schema.filter(req.body),
        momentBegin = moment(occupant.beginDate, 'DD/MM/YYYY'),
        momentEnd = occupant.terminationDate ? moment(occupant.terminationDate, 'DD/MM/YYYY') : moment(occupant.endDate, 'DD/MM/YYYY');
    var properties = [];

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

    module.exports.findOccupant(realm, occupant._id, function(errors, dbOccupant) {
        var afterPaidRents, previousRent;
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

        afterPaidRents = getPaidRentsAfterDate(occupant, momentEnd);
        if (!afterPaidRents || afterPaidRents.length === 0) {
            buildPropertyMap(realm, function(errors, propertyMap) {
                if (errors && errors.length > 0) {
                    res.json({
                        errors: errors
                    });
                    return;
                }

                // Resolve proprerties
                occupant.properties.forEach(function(item /*, index*/ ) {
                    var itemToKeep;
                    dbOccupant.properties.forEach(function(dbItem) {
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
                    }
                    properties.push(itemToKeep);
                });
                occupant.properties = properties;

                do {
                    previousRent = rentManager.updateRentAmount(momentBegin, momentEnd, previousRent, occupant);
                    momentBegin.add(1, 'months');
                } while (previousRent);

                //module.exports.defaultValuesOccupant(occupant);
                occupantModel.update(realm, occupant, function(errors) {
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
            errors: ['Impossible de mettre à jour le dossier du locataire.', 'Des paiments de loyer ont été effectués après la nouvelle date de fin du bail :']
        });
    });
};

module.exports.remove = function(req, res) {
    var realm = req.session.user.realm,
        occupantIds = req.body['ids'];

    var releaseRent = function(callback) {
        var occupantfilters = [];
        var ObjectId = mongojs.ObjectId;
        var isPaidRents = false;
        var index, i;
        for (index = 0; index < occupantIds.length; index++) {
            occupantfilters.push({
                _id: ObjectId(occupantIds[index])
            });
        }
        occupantModel.findFilter(realm, {
            $query: {
                $or: occupantfilters
            },
            $orderby: {
                company: 1
            }
        }, function(errors, occupants) {
            if (occupants && occupants.length > 0) {
                for (i = 0; i < occupants.length; i++) {
                    isPaidRents = (getPaidRents(occupants[i]).length > 0);
                    if (isPaidRents) {
                        callback(['Impossible de supprimer le locataire : ' + occupants[i].name + ' des loyers ont été encaissés.']);
                        return;
                    }
                }
                callback([]);
            } else {
                res.json({
                    errors: []
                });
            }
        });
    };

    releaseRent(function(errors) {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        occupantModel.remove(realm, occupantIds, function(errors) {
            res.json({
                errors: errors
            });
        });
    });
};