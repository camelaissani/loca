'use strict';

var mongojs = require('mongojs'),
    moment = require('moment'),
    db = require('../modules/db'),
    OF = require('../modules/objectfilter'),
    rentManager = require('./rentmanager');

var collection = 'occupants';
var schema = new OF({
    _id: String,
    isCompany: Boolean,
    company: String,
    legalForm: String,
    siret: String,
    capital: Number,
    manager: String,
    name: String,
    street1: String,
    street2: String,
    zipCode: String,
    city: String,
    contacts: Array,
    contract: String,
    beginDate: String,
    endDate: String,
    terminationDate: String,
    guarantyPayback: Number,
    properties: Array,
    guaranty: Number,
    reference: String,
    isVat: Boolean,
    vatRatio: Number,
    discount: Number
});

require('sugar');

function checkDate(month, year) {
    var day,
        now = new Date();

    if (!month || !year) {
        day = now.getDate();
        month = now.getMonth() + 1;
        year = now.getFullYear();
    } else {
        month = Number(month);
        year = Number(year);
        if (month <= 0 || month > 12 || year <= 0) {
            month = now.getMonth() + 1;
            year = now.getFullYear();
        }
    }

    return {
        day: day,
        month: month,
        year: year
    };
}

function buildPropertyMap(realm, callback) {
    var index, property;
    var propertyMap = {};

    db.listWithFilter(realm, 'properties',  {
        $query: {},
        $orderby: {
            type:1,
            name: 1
        }
    }, function(errors, properties) {
        if (properties && properties.length > 0) {
            for (index=0; index<properties.length; index++) {
                property = properties[index];
                propertyMap[property._id.toString()] = property;
            }
        }
        callback(errors, propertyMap);
    });
}

module.exports.defaultValuesOccupant = function(occupant)  {
    occupant.street1 = occupant.street1?occupant.street1:'';
    occupant.street2 = occupant.street2?occupant.street2:'';
    occupant.zipCode = occupant.zipCode?occupant.zipCode:'';
    occupant.city = occupant.city?occupant.city:'';

    occupant.legalForm = occupant.legalForm?occupant.legalForm:'';
    occupant.siret = occupant.siret?occupant.siret:'';
    occupant.contract = occupant.contract?occupant.contract:'';
    occupant.reference = occupant.reference?occupant.reference:'';

    occupant.guaranty = occupant.guaranty ? Number(occupant.guaranty) : 0;
    if (occupant.isVat) {
        occupant.vatRatio = occupant.vatRatio ? Number(occupant.vatRatio) : 0;
    }
    else {
        occupant.vatRatio = 0;
    }
    occupant.discount = occupant.discount ? Number(occupant.discount) : 0;

    var date = checkDate();
    // Compute if contract is completed
    if (!occupant.terminationDate.isBlank()) {
        var currentDate = moment([date.year, date.month-1, date.day]).endOf('day');
        var momentTermination = moment(occupant.terminationDate, 'DD/MM/YYYY').endOf('day');
        if (momentTermination.isBefore(currentDate)) {
            occupant.terminated = true;
        }
    }
    else {
        occupant.terminated = false;
    }

    return occupant;
};

module.exports.findOccupant = function(realm, id, callback) {
    db.findItemById(realm, collection, id, function(errors, occupants) {
        if ((errors && errors.length > 0) || (occupants.length === 0)) {
            callback(errors);
        } else {
            callback(errors, occupants[0]);
        }
    });
};

module.exports.findAllOccupants = function(realm, callback, filter) {
    if (!filter) {
        filter = {};
    }
    db.listWithFilter(realm, collection, {
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
        date = checkDate(req.query.month, req.query.year),
        id = req.body.id;

    module.exports.findOccupant(realm, id, date.month, date.year, function(errors, occupant/*, office, parking*/) {
        delete occupant.rents;
        var result = {
            errors: errors,
            occupant : occupant
        };
        res.json(result);
    });
};

module.exports.add = function(req, res) {
    var realm = req.session.user.realm,
        occupant = schema.filter(req.body),
        momentBegin = moment(occupant.beginDate, 'DD/MM/YYYY'),
        momentEnd = moment(occupant.endDate, 'DD/MM/YYYY');
    var previousRent;

    if (!occupant.properties || occupant.properties.length===0) {
        res.json({errors:['Missing properties']});
        return;
    }

    if (!occupant.isCompany) {
        occupant.company = null;
        occupant.legalForm = null;
        occupant.siret = null;
        occupant.capital = null;
        occupant.name = occupant.manager;
    }
    else {
        occupant.name = occupant.company;
    }

    buildPropertyMap(realm, function(errors, propertyMap) {
        if (errors && errors.length > 0) {
            res.json({errors:errors});
            return;
        }

        // Resolve proprerties
        occupant.properties.forEach(function(item/*, index*/) {
            item.property = propertyMap[item.propertyId];
        });

        while (momentBegin.isBefore(momentEnd) || momentBegin.isSame(momentEnd)) {
            previousRent = rentManager.createRent(momentBegin, momentEnd, previousRent, occupant);
            momentBegin.add(1, 'months');
        }
        db.add(realm, collection, occupant, function(errors, occupant) {
            if (errors && errors.length > 0) {
                res.json({errors:errors});
                return;
            }
            delete occupant.rents;
            res.json(occupant);
        });
    });
};

module.exports.update = function(req, res) {
    var realm = req.session.user.realm,
        occupant = schema.filter(req.body),
        momentBegin = moment(occupant.beginDate, 'DD/MM/YYYY'),
        momentEnd = occupant.terminationDate ? moment(occupant.terminationDate, 'DD/MM/YYYY') : moment(occupant.endDate, 'DD/MM/YYYY');
    var properties = [];

    if (!occupant.properties || occupant.properties.length===0) {
        res.json({errors:['Missing properties']});
        return;
    }

    if (!occupant.isCompany) {
        occupant.company = null;
        occupant.legalForm = null;
        occupant.siret = null;
        occupant.capital = null;
        occupant.name = occupant.manager;
    }
    else {
        occupant.name = occupant.company;
    }

    module.exports.findOccupant(realm, occupant._id, function(errors, dbOccupant) {
        var afterPaidRents, previousRent;
        if (errors && errors.length > 0) {
            res.json({errors:errors});
            return;
        }
        delete dbOccupant._id;
        occupant.rents = dbOccupant.rents;
        occupant.documents = dbOccupant.documents;

        afterPaidRents = rentManager.getPaidRentsAfterDate(occupant, momentEnd);
        if (!afterPaidRents || afterPaidRents.length === 0) {
            buildPropertyMap(realm, function(errors, propertyMap) {
                if (errors && errors.length > 0) {
                    res.json({errors:errors});
                    return;
                }

                // Resolve proprerties
                occupant.properties.forEach(function(item/*, index*/) {
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
                db.update(realm, collection, occupant, function(errors) {
                    if (errors && errors.length > 0) {
                        res.json({errors:errors});
                        return;
                    }
                    delete occupant.rents;
                    res.json(occupant);
                });
            });
            return;
        }

        res.json({errors:['Impossible de mettre à jour le dossier du locataire.', 'Des paiments de loyer ont été effectués après la nouvelle date de fin du bail :']});
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
        db.listWithFilter(realm, collection, {
            $query: {
                $or: occupantfilters
            },
            $orderby: {
                company: 1
            }
        }, function(errors, occupants) {
            if (occupants && occupants.length > 0) {
                for (i=0; i < occupants.length; i++) {
                    isPaidRents = (rentManager.getPaidRents(occupants[i]).length>0);
                    if (isPaidRents) {
                        callback(['Impossible de supprimer le locataire : ' + occupants[i].name + ' des loyers ont été encaissés.']);
                        return;
                    }
                }
                callback([]);
            }
            else {
                res.json({errors:[]});
            }
        });
    };

    releaseRent(function(errors) {
        if (errors && errors.length > 0) {
            res.json({errors:errors});
            return;
        }

        db.remove(realm, collection, occupantIds, function(errors/*, occupants*/) {
            res.json({errors:errors});
        });
    });
};