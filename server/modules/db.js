'use strict';

var configdir = process.env.SELFHOSTED_CONFIG_DIR || __dirname + '/../..',
    config = require(configdir + '/config'),
    mongojs = require('mongojs'),
    logger = require('winston'),
    collections = ['accounts', 'realms', 'properties', 'occupants', 'notifications'],
    db;

require('sugar');

function buildFilter(realm, filter) {
    var andArray = filter.$query ? filter.$query.$and : null,
        realmFilter;

    if (realm) {
        realmFilter = {realmId: realm._id};
        if (andArray) {
            andArray.push(realmFilter);
        } else {
            if (!filter.$query) {
                filter.$query = {};
            }
            filter.$query.$and = [realmFilter];
        }
    }
    return filter;
}

module.exports.init = function () {
    if (!db) {
        logger.info('connecting database ' + config.database + '...');
        db = mongojs(config.database, collections);
        logger.info('database connected');
    } else {
        logger.info('database already connected');
    }
};

module.exports.findItemById = function (realm, collection, id, callback) {
    var items = [],
        _id = id,
        query = buildFilter(realm, {$query: {_id: mongojs.ObjectId(_id)}});


    db[collection].find(query, function (err, dbItems) {
        var errors = [];
        if (realm) {
            logger.info('FINDITEMBYID realm: ' + realm.name + ' collection: ' + collection + ' _id:' + id);
        }
        logger.debug(query);
        if (err || !dbItems) {
            errors.push('Element non trouvé en base de données');
        } else {
            dbItems.forEach(function (dbItem) {
                items.push(dbItem);
                logger.info('\tSuccess');
                logger.debug(dbItem);
            });
        }
        callback(errors, items);
    });
};

module.exports.listWithFilter = function (realm, collection, filter, callback) {
    var items = [],
        query = buildFilter(realm, filter);

    db[collection].find(query, function (err, dbItems) {
        if (realm) {
            logger.info('LISTWITHFILTER realm: ' + realm.name + ' collection: ' + collection);
        }
        logger.debug(query);
        if (!err && dbItems) {
            dbItems.forEach(function (dbItem) {
                items.push(dbItem);
            });
            logger.info('\tSuccess');
            logger.debug(items);
        }
        callback([], items);
    });
};

module.exports.list = function (realm, collection, callback) {
    module.exports.listWithFilter(realm, collection, {}, callback);
};

module.exports.add = function (realm, collection, item, callback) {
    var _id = new mongojs.ObjectId(),
        itemToSave;

    item._id = _id;
    itemToSave = Object.merge(item, {realmName: realm.name, realmId: realm._id});
    db[collection].save(itemToSave, function (err, saved) {
        logger.info('ADD realm: ' + realm.name + ' collection: ' + collection);
        logger.debug(itemToSave);
        if (err || !saved) {
            callback(['Element non ajouté en base de données']);
        } else {
            logger.info('\tSuccess');
            logger.debug(item);
            callback([], item);
        }
    });
};

// module.exports.insert = function (realm, collection, item, callback) {
//     db[collection].insert(item, function (err, saved) {
//         logger.info('ADD realm: ' + realm.name + ' collection: ' + collection);
//         if (err || !saved) {
//             callback([err]);
//         } else {
//             logger.info('\tSuccess');
//             logger.debug(item);
//             callback([]);
//         }
//     });
// };

module.exports.updateWithFilter = function (realm, collection, filter, item, callback) {
    var itemToUpdate = { $set: Object.merge(item, {realmName: realm.name, realmId: realm._id}) };

    db[collection].update(
        filter,
        itemToUpdate,
        { multi: true },
        function (err, saved) {
            logger.info('UPDATEWITHFILTER realm: ' + realm.name + ' collection: ' + collection);
            logger.debug(itemToUpdate);
            logger.info('\tFilter: ' + JSON.stringify(filter, null, ' '));
            if (err || !saved) {
                callback(['Element non mis à jour en base de données']);
            } else {
                logger.info('\tSuccess');
                logger.debug(item);
                callback([]);
            }
        }
    );
};

module.exports.update = function (realm, collection, item, callback) {
    var _id = item._id.toString();
    delete item._id;
    module.exports.updateWithFilter(realm, collection, {_id: mongojs.ObjectId(_id)}, item, function(errors) {
        item._id = _id;
        callback(errors);
    });
};


module.exports.upsert = function (realm, collection, query, fieldsToSet, fieldsToSetOnInsert, callback) {
    var fieldsToUpdate = {
            $set: Object.merge(fieldsToSet, {realmName: realm.name, realmId: realm._id}),
            $setOnInsert: fieldsToSetOnInsert
        },
        options = {
            upsert: true
        };

    db[collection].update(
        query,
        fieldsToUpdate,
        options,
        function (err, saved) {
            logger.info('UPDATEWITHFILTER realm: ' + realm.name + ' collection: ' + collection);
            logger.debug(fieldsToUpdate);
            logger.info('\tFilter: ' + JSON.stringify(query, null, ' '));
            if (err || !saved) {
                callback(['Element non mis à jour en base de données']);
            } else {
                logger.info('\tSuccess');
                callback([]);
            }
        }
    );
};

module.exports.removeWithFilter = function (realm, collection, filter, callback) {
    if (filter) {
        db[collection].remove(filter, function (err, deleted) {
            logger.info('REMOVEWITHFILTER realm: ' + realm.name + ' collection: ' + collection);
            logger.debug(filter);
            if (err || !deleted) {
                callback(['Aucun element n\'a été supprimé en base de données']);
            } else {
                logger.info('\tSuccess');
                callback([]);
            }
        });
    } else {
        logger.info('REMOVEWITHFILTER realm: ' + realm.name + ' collection: ' + collection);
        logger.debug(filter);
        logger.info('\tFail. Empty query.');
        callback(['Aucun element n\'a été supprimé en base de données. Filtre de requête vide.']);
    }
};

module.exports.remove = function (realm, collection, items, callback) {
    var  filters = [],
        index;
    if (items && items.length > 0) {
        for (index = 0; index < items.length; index++) {
            filters.push({_id: mongojs.ObjectId(items[index])});
        }
        module.exports.removeWithFilter(realm, collection, {$or: filters}, callback);
    } else {
        logger.info('REMOVE realm: ' + realm.name + ' collection: ' + collection);
        logger.info('\tFail. Empty query.');
        callback(['Aucun element n\'a été supprimé en base de données. Filtre de requête vide.']);
    }
};
