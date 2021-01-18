const realmModel = require('../models/realm');
const accountModel = require('../models/account');

const _hasRequiredFields = realm => {
    return (
        realm.name &&
        realm.members &&
        realm.members.find(({ role }) => role === 'administrator') &&
        realm.locale &&
        realm.currency
    );
};

const _isNameAlreadyTaken = (realm, realms = []) => {
    return realms.map(({ name }) =>
        name.trim().toLowerCase()).includes(realm.name.trim().toLowerCase());
};

module.exports = {
    add(req, res) {
        const newRealm = req.body;
        if (!_hasRequiredFields(newRealm)) {
            return res.status(422).json({ error: 'missing fields' });
        }

        if (_isNameAlreadyTaken(newRealm, req.realms)) {
            return res.status(409).json({ error: 'organization name already exists' });
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
    async update(req, res) {
        const updatedRealm = req.body;

        if (req.realm._id !== updatedRealm._id) {
            return res.status(403).json({ error: 'only current selected organizaton can be updated' });
        }

        const currentMember = req.realm.members.find(({ email }) => email = req.user.email);
        if (!currentMember) {
            return res.status(403).json({ error: 'current user is not a member of the organization' });
        }

        if (currentMember.role !== 'administrator') {
            return res.status(403).json({ error: 'only administrator member can update the organization' });
        }

        if (!_hasRequiredFields(updatedRealm)) {
            return res.status(422).json({ error: 'missing fields' });
        }

        if (updatedRealm.name !== req.realm.name && _isNameAlreadyTaken(updatedRealm, req.realms)) {
            return res.status(409).json({ error: 'organization name already exists' });
        }

        const usernameMap = {};
        try {
            await new Promise((resolve, reject) => {
                accountModel.findAll((errors, accounts = []) => {
                    resolve(accounts.reduce((acc, { email, firstname, lastname }) => {
                        acc[email] = `${firstname} ${lastname}`;
                        return acc;
                    }, usernameMap));
                });
            });
        } catch(error) {
            console.error(error);
        }

        updatedRealm.members.forEach(member => {
            const name = usernameMap[member.email];
            member.name = name || '';
            member.registered = !!name;
        });

        realmModel.update(updatedRealm, (errors, realm) => {
            if (errors) {
                return res.status(500).json({
                    errors: errors
                });
            }
            res.status(200).json(realm);
        });
    },
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
