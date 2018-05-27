'use strict';

const FD = require('./frontdata');
const occupantModel = require('../models/occupant');

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function print(req, res) {
    const realm = req.realm;
    const doc = req.params.id;
    const month = req.params.month;
    const fromMonth = req.params.fromMonth;
    const year = req.params.year;
    const occupantIds = req.params.ids ? req.params.ids.split(',') : [];

    occupantModel.findFilter(realm, {$query: {_id: {$in: occupantIds}}}, (errors, occupants) => {
        const data = FD.toPrintData(realm, doc, fromMonth, month, year, occupants);
        res.render(data.view, data);
    });
}

module.exports = {
    print
};
