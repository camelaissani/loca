'use strict';

const ownerModel = require('../models/owner');

// function _findOwner(realm, callback) {
//     ownerModel.findOne(null, realm._id, (errors, dbRealm) => {
//         if (errors) {
//             callback(errors);
//             return;
//         }
//         if (!dbRealm.manager) {
//             dbRealm.manager = dbRealm.renter;
//             delete dbRealm.renter;
//         }
//         if (dbRealm && !dbRealm.siret) {
//             dbRealm.siret = dbRealm.rcs;
//             delete dbRealm.rcs;
//         }
//         callback(null, dbRealm);
//     });
// }

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function all(req, res) {
    const realm = req.realm;
    ownerModel.findOne(null, realm._id, (errors, dbRealm) => {
        if (errors && errors.length > 0) {
            res.json({
                errors: errors
            });
            return;
        }
        res.json(dbRealm);
    });
}

function update(req, res) {
    const realm = req.realm;
    const owner = ownerModel.schema.filter(req.body);

    if (!owner._id) {
        owner.name = realm.name;
        ownerModel.add(realm, owner, (errors) => {
            res.json({errors: errors});
        });
    } else {
        ownerModel.update(realm, owner, (errors) => {
            res.json({errors: errors});
        });
    }
}

module.exports = {
    all,
    update
};
