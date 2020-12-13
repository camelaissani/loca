// const realmModel = require('../models/realm');

const realmManager = {
    add(req, res) { },
    update(req, res) { },
    remove(req, res) { },
    one(req, res) {
        const realmId = req.params.id;
        if (!realmId) {
            return res.sendStatus(404);
        }

        const realm = req.realms.find(({ _id }) => _id.toString() === realmId);
        if (!realm) {
            return res.sendStatus(404);
        }
        res.json(realm);

    },
    all(req, res) {
        res.json(req.realms);
    }
};

module.exports = realmManager;