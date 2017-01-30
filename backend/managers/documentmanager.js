'use strict';

var moment = require('moment'),
    occupantModel = require('../models/occupant'),
    documentModel = require('../models/document');

module.exports.update = function(req, res) {
    var realm = req.realm,
        occupant = documentModel.schema.filter(req.body);

    if (!occupant.documents) {
        occupant.documents = [];
    }

    occupantModel.findOne(realm, occupant._id, function(errors, dbOccupant) {
        var momentExpirationDate;

        if (errors) {
            res.json({
                errors: errors
            });
            return;
        }

        dbOccupant.documents = [];

        occupant.documents.forEach(function(document) {
            momentExpirationDate = moment(document.expirationDate, 'DD/MM/YYYY').endOf('day');
            if (document.name && document.name.trim() !== '' && momentExpirationDate.isValid()) {
                document.expirationDate = momentExpirationDate.toDate();
                dbOccupant.documents.push(document);
            }
        });

        occupantModel.update(realm, dbOccupant, function(errors) {
            if (errors) {
                res.json({
                    errors: errors
                });
                return;
            }
            res.json(dbOccupant);
        });
    });
};
