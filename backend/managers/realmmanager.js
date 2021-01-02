const realmModel = require('../models/realm');

const realmManager = {
    add(req, res) {
        const newRealm = req.body;
        if (
            !newRealm.name ||
            !newRealm.administrator ||
            !newRealm.locale ||
            !newRealm.currency
        ) {
            return res.status(422).json({ error: 'missing fields' });
        }

        if (req.realms.map(({name}) => name.trim().toLowerCase()).includes(newRealm.name.trim().toLowerCase())) {
            return res.sendStatus(409);
        }

        realmModel.add(newRealm, (errors, realm) => {
            if (errors) {
                return res.status(500).json({
                    errors: errors
                });
            }
            res.status(201).json(realm);
        });
    },
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