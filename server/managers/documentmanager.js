'use strict';

var moment = require('moment'),
    db = require('../modules/db'),
    OF = require('../modules/objectfilter');

var schema = new OF({
    _id: String,
    documents: Array
});

module.exports.update = function(req, res) {
    var realm = req.session.user.realm,
        occupant = schema.filter(req.body);

    if (!occupant.documents) {
        occupant.documents = [];
    }

    db.findItemById(realm, 'occupants', occupant._id, function(errors, dbOccupants) {
        var dbOccupant;
        var momentExpirationDate;

        if (errors && errors.length > 0) {
            res.json({errors:errors});
            return;
        }

        dbOccupant = dbOccupants[0];
        dbOccupant.documents = [];

        occupant.documents.forEach(function(document) {
            momentExpirationDate = moment(document.expirationDate, 'DD/MM/YYYY').endOf('day');
            if (document.name &&  document.name.trim() !== '' && momentExpirationDate.isValid()) {
                document.expirationDate = momentExpirationDate.toDate();
                dbOccupant.documents.push(document);
            }
        });

        db.update(realm, 'occupants', dbOccupant, function(errors) {
            if (errors && errors.length > 0) {
                res.json({errors:errors});
                return;
            }
            res.json(dbOccupant);
        });
    });
};
