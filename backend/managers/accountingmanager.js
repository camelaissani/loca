const FD = require('./frontdata');
const occupantModel = require('../models/occupant');

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function all(req, res) {
    const year = req.params.year;

    occupantModel.findFilter(req.realm, {
        $orderby: {
            name: 1
        }
    }, (errors, occupants) => {
        res.json(FD.toAccountingData(year, occupants));
    });
}

module.exports = {
    all
};
