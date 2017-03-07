'use strict';

import moment from 'moment';
import math from 'mathjs';
import propertyModel from '../models/property';
import occupantModel from '../models/occupant';

function _buildOccupants(realm, callback) {
    occupantModel.findAll(realm, (errors, occupants) => {
        if (occupants) {
            occupants.forEach( occupant => {
                delete occupant.rents;
            });
        }
        callback(errors, occupants);
    });
}

function _addComputedProperties(inputProperties, occupants) {
    if (inputProperties) {
        inputProperties.forEach((inputProperty) => {
            // init property to return with default values
            inputProperty.expense = inputProperty.expense || 0;
            inputProperty.priceWithExpenses = math.round(inputProperty.price + inputProperty.expense, 2);
            inputProperty.m2Expense = inputProperty.surface ? math.round((inputProperty.expense / inputProperty.surface), 2) : null;
            inputProperty.m2Price = inputProperty.surface ? math.round((inputProperty.price / inputProperty.surface), 2) : null;
            inputProperty.beginDate = '';
            inputProperty.endDate = '';
            inputProperty.lastBusyDay = '';
            inputProperty.occupantLabel = '';
            inputProperty.available = true;

            // Find all occupant of properties
            const occupantsOfProperty = occupants.filter((occupant) => {
                const properties = occupant.properties.filter((property) => {
                    if (property._id && property.propertyId === property._id.toString()) {
                        return true;
                    }
                    return false;
                });
                return (properties && properties.length > 0);
            });

            // Find latest occupant
            let lastOccupant;
            let occupantProperty;
            if (occupantsOfProperty && occupantsOfProperty.length > 0) {
                let lastOccupantBeginDate;
                occupantsOfProperty.forEach((occupant) => {
                    const properties = occupant.properties.filter((property) => {
                        if (property.propertyId === property._id.toString()) {
                            return true;
                        }
                        return false;
                    });
                    const property = properties[0];
                    const beginDate =  moment(property.entryDate, 'DD/MM/YYYY').startOf('day');
                    if (!lastOccupantBeginDate || beginDate.isAfter(lastOccupantBeginDate)) {
                        lastOccupantBeginDate = beginDate;
                        lastOccupant = occupant;
                        occupantProperty = property;
                    }
                });
            }

            // Compute occupation status
            if (lastOccupant) {
                inputProperty.beginDate = occupantProperty.entryDate;
                inputProperty.endDate =  occupantProperty.exitDate;
                inputProperty.lastBusyDay = lastOccupant.terminationDate && !lastOccupant.terminationDate.isBlank() ? lastOccupant.terminationDate : lastOccupant.endDate;
                inputProperty.occupantLabel = lastOccupant.name;

                if (inputProperty.lastBusyDay) {
                    const lastBusyDay = moment(inputProperty.lastBusyDay, 'DD/MM/YYYY');
                    inputProperty.available = lastBusyDay.isBefore(moment(), 'month');
                }
            }
        });
    }
}

function _findAllResources(realm, callback) {
    propertyModel.findFilter(realm, {
        $query: {},
        $orderby: {
            type: 1,
            name: 1
        }
    }, (errors, properties) => {
        if (errors) {
            callback(errors, properties);
            return;
        }
        _buildOccupants(realm, (errors, occupants) => {
            if (errors && errors.length > 0) {
                callback(errors, properties);
                return;
            }
            _addComputedProperties(properties, occupants);
            callback(null, properties);
        });
    });
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function add(req, res) {
    const realm = req.realm;
    const property = propertyModel.schema.filter(req.body);

    propertyModel.add(realm, property, (errors) => {
        if (errors) {
            res.json({errors: errors});
            return;
        }
        _buildOccupants(realm, (errors, occupants) => {
            if (errors && errors.length > 0) {
                res.json({errors: errors});
                return;
            }
            _addComputedProperties([property], occupants);
            res.json(property);
        });
    });
}

function update(req, res) {
    const realm = req.realm;
    const property = propertyModel.schema.filter(req.body);

    propertyModel.update(realm, property, (errors) => {
        if (errors) {
            res.json({errors: errors});
            return;
        }
        _buildOccupants(realm, (errors, occupants) => {
            if (errors && errors.length > 0) {
                res.json({errors: errors});
                return;
            }
            _addComputedProperties([property], occupants);
            res.json(property);
        });
    });
}

function remove(req, res) {
    const realm = req.realm;
    const ids = req.params.ids.split(',');

    propertyModel.remove(realm, ids, (errors) => {
        res.json({errors: errors});
    });
}

function all(req, res) {
    const realm = req.realm;
    _findAllResources(realm, (errors, properties) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }
        res.json(properties);
    });
}

function overview(req, res) {
    const realm = req.realm;
    let result = {
        countAll: 0,
        countFree: 0,
        countBusy: 0
    };

    _findAllResources(realm, (errors, properties) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }
        if (properties) {
            result.countAll = properties.length;
            result = properties.reduce( (acc, property) => {
                if (property.available) {
                    acc.countFree++;
                } else {
                    acc.countBusy++;
                }
                return acc;
            }, result);
        }
        res.json(result);
    });
}

export default {
    add,
    update,
    remove,
    all,
    overview
};
