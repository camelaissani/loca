'use strict';

const moment = require('moment');
const FD = require('./frontdata');
const propertyModel = require('../models/property');
const occupantModel = require('../models/occupant');

function _toPropertiesData(realm, inputProperties, callback) {
    occupantModel.findFilter(
        realm,
        {
            $query: {
                properties: {
                    $elemMatch: {
                        propertyId: {$in: inputProperties.map(property => property._id.toString())}
                    }
                }
            }
        },
        (errors, occupants) => {
            if (errors) {
                callback(errors);
                return;
            }
            callback(null, inputProperties.map(property => {
                return FD.toProperty(
                    property,
                    occupants
                        .reduce((acc, occupant) => {
                            const occupant_property = occupant.properties.find(currentProperty => currentProperty.propertyId === property._id.toString());
                            if (occupant_property) {
                                if (!acc.occupant) {
                                    acc.occupant = occupant;
                                } else {
                                    const acc_property = acc.occupant.properties.find(currentProperty => currentProperty.propertyId === property._id.toString());
                                    const beginDate =  moment(occupant_property.entryDate, 'DD/MM/YYYY').startOf('day');
                                    const lastBeginDate = moment(acc_property.entryDate, 'DD/MM/YYYY').startOf('day');
                                    if (beginDate.isAfter(lastBeginDate)) {
                                        acc.occupant = occupant;
                                    }
                                }
                            }
                            return acc;
                        }, {occupant:null})
                        .occupant
                );
            }));
        }
    );
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function add(req, res) {
    const realm = req.realm;
    const property = propertyModel.schema.filter(req.body);

    propertyModel.add(realm, property, (errors, dbProperty) => {
        if (errors) {
            res.json({errors: errors});
            return;
        }
        _toPropertiesData(realm, [dbProperty], (errors, properties) => {
            if (errors && errors.length > 0) {
                res.json({errors: errors});
                return;
            }
            res.json(properties[0]);
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
        _toPropertiesData(realm, [property], (errors, properties) => {
            if (errors && errors.length > 0) {
                res.json({errors: errors});
                return;
            }
            res.json(properties[0]);
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

    propertyModel.findFilter(realm, {
        $query: {},
        $orderby: {
            type: 1,
            name: 1
        }
    }, (errors, properties) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        _toPropertiesData(realm, properties, (errors, properties) => {
            if (errors && errors.length > 0) {
                res.json({
                    errors: errors
                });
                return;
            }
            res.json(properties);
        });
    });
}

function overview(req, res) {
    const realm = req.realm;
    let result = {
        countAll: 0,
        countFree: 0,
        countBusy: 0
    };

    propertyModel.findFilter(realm, {
        $query: {},
        $orderby: {
            type: 1,
            name: 1
        }
    }, (errors, properties) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }

        _toPropertiesData(realm, properties, (errors, properties) => {
            if (errors && errors.length > 0) {
                res.json({
                    errors: errors
                });
                return;
            }
            result.countAll = properties.length;
            properties.reduce( (acc, property) => {
                if (property.available) {
                    acc.countFree++;
                } else {
                    acc.countBusy++;
                }
                return acc;
            }, result);
            res.json(result);
        });

    });
}

module.exports = {
    add,
    update,
    remove,
    all,
    overview
};
