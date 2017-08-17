import FD from '../../../managers/frontdata';
import occupantModel from '../../../models/occupant';


export default function(req, callback) {
    const realm = req.realm;
    const doc = req.params.id;
    const month = req.params.month;
    const fromMonth = req.params.fromMonth;
    const year = req.params.year;
    const occupantIds = req.params.ids ? req.params.ids.split(',') : [];
    occupantModel.findFilter(realm, {$query: {_id: {$in: occupantIds}}}, (errors, occupants) => {
        if (errors && errors.length>0) {
            callback(errors);
            return;
        }
        const data = FD.toPrintData(realm, doc, fromMonth, month, year, occupants);
        req.model = Object.assign(req.model, data);
        callback();
    });
}