const leaseModel = require('../models/lease');
const occupantModel = require('../models/occupant');

/**
 * @returns a Set of leaseId (_id)
 */
async function _leaseUsedByTenant(realm) {
    return await new Promise((resolve, reject) => {
        occupantModel.findAll(realm, (errors, occupants) => {
            if (errors && errors.length > 0) {
                return reject(errors);
            }

            resolve(occupants.reduce((acc, { leaseId }) => {
                acc.add(leaseId);
                return acc;
            }, new Set()));
        });
    });
}

function _rejectMissingFields(lease, res) {
    if (!lease.name || !lease.timeRange) {
        res.status(422).json({
            errors: ['"name", "timeRange" fields are required']
        });
        return true;
    }
    return false;
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function add(req, res) {
    const realm = req.realm;
    const lease = leaseModel.schema.filter(req.body);

    if (_rejectMissingFields(lease, res)) {
        return;
    }
    delete lease._id;

    leaseModel.add(realm, lease, async (errors, dbLease) => {
        if (errors) {
            return res.status(500).json({
                errors: errors
            });
        }
        const setOfUsedLeases = await _leaseUsedByTenant(realm);
        dbLease.usedByTenants = setOfUsedLeases.has(dbLease._id);
        res.json(dbLease);
    });
}

async function update(req, res) {
    const realm = req.realm;
    let lease = leaseModel.schema.filter(req.body);

    if (_rejectMissingFields(lease, res)) {
        return;
    }

    const setOfUsedLeases = await _leaseUsedByTenant(realm);
    if (setOfUsedLeases.has(lease._id)) {
        // if lease already used by tenants, only allow to update name, description, active fields
        const dbLease = await new Promise((resolve, reject) => {
            leaseModel.findOne(realm, lease._id, async (errors, dbLease) => {
                if (errors && errors.length > 0) {
                    console.error(errors);
                    return resolve();
                }
                resolve(dbLease);
            });
        });
        if (!dbLease) {
            return res.sendStatus(404);
        }
        lease = {
            ...dbLease,
            name: lease.name || dbLease.name,
            description: lease.description || dbLease.description,
            active: lease.active !== undefined ? lease.active : dbLease.active
        };
    }

    leaseModel.update(realm, lease, (errors, dbLease) => {
        if (errors) {
            return res.status(500).json({
                errors: errors
            });
        }
        dbLease.usedByTenants = setOfUsedLeases.has(lease._id);
        res.json(dbLease);
    });
}

async function remove(req, res) {
    const realm = req.realm;
    const leaseIds = req.params.ids.split(',');

    const setOfUsedLeases = await _leaseUsedByTenant(realm);
    if (leaseIds.some(lease => setOfUsedLeases.has(lease._id))) {
        return res.status(422).json({
            errors: ['One lease is used by tenants. It cannot be removed']
        });
    }

    leaseModel.remove(
        realm,
        leaseIds,
        errors => {
            if (errors) {
                return res.status(500).json({
                    errors
                });
            }
            res.sendStatus(200);
        }
    );
}

function all(req, res) {
    const realm = req.realm;
    leaseModel.findAll(realm, async (errors, dbLeases) => {
        if (errors && errors.length > 0) {
            return res.status(500).json({
                errors: errors
            });
        }
        const setOfUsedLeases = await _leaseUsedByTenant(realm);
        const allLeases = dbLeases.map(dbLease => ({
            ...dbLease,
            usedByTenants: setOfUsedLeases.has(dbLease._id)
        }));

        const systemLeases = allLeases.filter(lease => lease.system).sort((l1, l2) => l1.name.localeCompare(l2.name));
        const otherLeases = allLeases.filter(lease => !lease.system).sort((l1, l2) => l1.name.localeCompare(l2.name));
        res.json([
            ...systemLeases,
            ...otherLeases
        ]);
    });
}

function one(req, res) {
    const realm = req.realm;
    const leaseId = req.params.id;
    leaseModel.findOne(realm, leaseId, async (errors, dbLease) => {
        if (errors && errors.length > 0) {
            return res.status(404).json({
                errors: errors
            });
        }
        const setOfUsedLeases = await _leaseUsedByTenant(realm);
        dbLease.usedByTenants = setOfUsedLeases.has(dbLease._id);
        res.json(dbLease);
    });
}

module.exports = {
    add,
    update,
    remove,
    one,
    all
};
