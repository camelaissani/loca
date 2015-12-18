'use strict';

var moment = require('moment'),
    Helper = require('./helper'),
    db = require('../modules/db'),
    OF = require('../modules/objectfilter'),
    math = require('mathjs');

var collection = 'properties';
var schema = new OF({
    _id: String,
    type: String,
    name: String,
    description: String,
    surface: Number,
    phone: String,
    building: String,
    level: String,
    location: String,
    price: Number,
    expense: Number
});

function buildOccupants(realm, callback) {
    db.list(realm, 'occupants', function (errors, occupants) {
        var index, currentOccupant;
        if (occupants && occupants.length > 0) {
            for (index = 0; index < occupants.length; index++) {
                currentOccupant = occupants[index];
                delete currentOccupant.rents;
            }
        }
        callback(errors, occupants);
    });
}

function addComputedProperties(items, occupants) {
    var date = Helper.currentDate(),
        currentDate = moment([date.year, date.month - 1, date.day]).endOf('day');

    if (items) {
        items.forEach(function (item) {
            var lastBusyDay, occupantsOfProperty, lastOccupant, lastOccupantBeginDate, occupantProperty;

            // init property to return with default values
            item.expense = item.expense || 0;
            item.priceWithExpenses = math.round(item.price + item.expense, 2);
            item.m2Expense = item.surface ? math.round((item.expense / item.surface), 2) : null;
            item.m2Price = item.surface ? math.round((item.price / item.surface), 2) : null;
            item.beginDate = '';
            item.endDate = '';
            item.lastBusyDay = '';
            item.occupantLabel = '';
            item.available = true;

            // Find all occupant of properties
            occupantsOfProperty = occupants.filter(function (occupant) {
                var properties = occupant.properties.filter(function (property) {
                    if (property.propertyId === item._id.toString()) {
                        return true;
                    }
                    return false;
                });
                return (properties && properties.length > 0);
            });

            // Find latest occupant
            if (occupantsOfProperty && occupantsOfProperty.length > 0) {
                occupantsOfProperty.forEach(function (occupant) {
                    var beginDate, properties, property;
                    properties = occupant.properties.filter(function (property) {
                        if (property.propertyId === item._id.toString()) {
                            return true;
                        }
                        return false;
                    });
                    property = properties[0];
                    beginDate =  moment(property.entryDate, 'DD/MM/YYYY').startOf('day');
                    if (!lastOccupantBeginDate || beginDate.isAfter(lastOccupantBeginDate)) {
                        lastOccupantBeginDate = beginDate;
                        lastOccupant = occupant;
                        occupantProperty = property;
                    }
                });
            }

            // Compute occupation status
            if (lastOccupant) {
                item.beginDate = occupantProperty.entryDate;
                item.endDate =  occupantProperty.exitDate;
                item.lastBusyDay = lastOccupant.terminationDate && !lastOccupant.terminationDate.isBlank() ? lastOccupant.terminationDate : lastOccupant.endDate;
                item.occupantLabel = lastOccupant.name;

                if (item.lastBusyDay) {
                    lastBusyDay = moment(item.lastBusyDay, 'DD/MM/YYYY').endOf('day');
                    if (lastBusyDay.isBefore(currentDate)) {
                        item.available = true;
                    } else {
                        item.available = false;
                    }
                }
            }
        });
    }
}

module.exports.findAllResources = function (realm, callback) {
    db.listWithFilter(realm, 'properties',  {
        $query: {},
        $orderby: {
            type: 1,
            name: 1
        }
    }, function (errors, resources) {
        if (errors && errors.length > 0) {
            callback(errors, resources);
        } else {
            buildOccupants(realm, function (errors, occupants) {
                if (errors && errors.length > 0) {
                    callback(errors, resources);
                    return;
                }
                addComputedProperties(resources, occupants);
                callback(null, resources);
            });
        }
    });
};

module.exports.add = function (req, res) {
    var realm = req.session.user.realm,
        property = schema.filter(req.body);

    db.add(realm, collection, property,
        function (errors) {
            var result;
            if (errors && errors.length > 0) {
                result = {errors: errors};
            } else {
                buildOccupants(realm, function (errors, occupants) {
                    if (errors && errors.length > 0) {
                        result = {errors: errors};
                        res.json(result);
                        return;
                    }
                    addComputedProperties([property], occupants);
                    result = property;
                    res.json(result);
                });
            }
        });
};

module.exports.update = function (req, res) {
    var realm = req.session.user.realm,
        property = schema.filter(req.body);

    db.update(realm, collection, property,
        function (errors) {
            var result;
            if (errors && errors.length > 0) {
                result = {errors: errors};
            } else {
                buildOccupants(realm, function (errors, occupants) {
                    if (errors && errors.length > 0) {
                        result = {errors: errors};
                        res.json(result);
                        return;
                    }
                    addComputedProperties([property], occupants);
                    result = property;
                    res.json(result);
                });
            }
        });
};

module.exports.remove = function (req, res) {
    var realm = req.session.user.realm,
        ids = req.body.ids;

    db.remove(realm, collection, ids, function (errors) {
        res.json({errors: errors});
    });
};
