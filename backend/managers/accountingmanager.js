import FD from './frontdata';
import occupantModel from '../models/occupant';

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

export default {
    all
};
