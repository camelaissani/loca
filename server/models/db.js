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
        realmFilter = {
            realmId: realm._id
        };
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

module.exports.init = function() {
    if (!db) {
        logger.info('connecting database', config.database + '...');
        db = mongojs(config.database, collections);
        logger.info('database connected');
    } else {
        logger.info('database already connected');
    }
};

module.exports.findItemById = function(realm, collection, id, callback) {
    var items = [],
        _id = id,
        query = buildFilter(realm, {
            $query: {
                _id: mongojs.ObjectId(_id)
            }
        });

    logger.info('find by id in collection', collection, 'in realm:', realm ? realm.name : '');
    logger.debug('\tid is', id);
    db[collection].find(query, function(err, dbItems) {
        var errors = [];
        if (err || !dbItems) {
            errors.push('Element non trouvé en base de données');
        } else {
            dbItems.forEach(function(dbItem) {
                items.push(dbItem);
                logger.silly('\treturned values', dbItem);
                logger.info('\tsuccess');
            });
        }
        callback(errors, items);
    });
};

module.exports.listWithFilter = function(realm, collection, filter, callback) {
    var items = [],
        query = buildFilter(realm, filter);
    if (filter === null || Object.keys(filter).length === 0) {
        logger.info('find all in collection:', collection, 'in realm:', realm ? realm.name : 'not set??');
    } else {
        logger.info('find filtered values in collection:', collection, 'in realm:', realm ? realm.name : 'not set??');
        logger.debug('\tfilter is', filter);
    }
    db[collection].find(query, function(err, dbItems) {
        if (!err && dbItems) {
            dbItems.forEach(function(dbItem) {
                items.push(dbItem);
            });
            logger.silly('\treturned values', items);
            logger.info('\tsuccess');
        }
        callback([], items);
    });
};

module.exports.list = function(realm, collection, callback) {
    module.exports.listWithFilter(realm, collection, {}, callback);
};

module.exports.add = function(realm, collection, item, callback) {
    var _id = new mongojs.ObjectId(),
        itemToSave;

    item._id = _id;
    itemToSave = Object.merge(item, {
        realmName: realm.name,
        realmId: realm._id
    });
    logger.info('insert item in collection', collection, 'in realm:', realm ? realm.name : '');
    logger.debug('\titem is', itemToSave);
    db[collection].save(itemToSave, function(err, saved) {
        if (err || !saved) {
            callback(['Element non ajouté en base de données']);
        } else {
            logger.silly('\treturned values is', item);
            logger.info('\tsuccess');
            callback([], item);
        }
    });
};

module.exports.updateWithFilter = function(realm, collection, filter, item, callback) {
    var itemToUpdate = {
        $set: Object.merge(item, {
            realmName: realm.name,
            realmId: realm._id
        })
    };

    if (filter === null || Object.keys(filter).length === 0) {
        logger.info('update all in collection:', collection, 'in realm:', realm ? realm.name : 'not set??');
    } else {
        logger.info('update filtered values in collection:', collection, 'in realm:', realm ? realm.name : 'not set??');
        logger.debug('\tfilter is', filter);
    }
    db[collection].update(
        filter,
        itemToUpdate, {
            multi: true
        },
        function(err, saved) {
            if (err || !saved) {
                callback(['Element non mis à jour en base de données']);
            } else {
                logger.silly('\treturned value is', item);
                logger.info('\tsuccess');
                callback([]);
            }
        }
    );
};

module.exports.update = function(realm, collection, item, callback) {
    var _id = item._id.toString();
    delete item._id;
    module.exports.updateWithFilter(realm, collection, {
        _id: mongojs.ObjectId(_id)
    }, item, function(errors) {
        item._id = _id;
        callback(errors);
    });
};

module.exports.upsert = function(realm, collection, query, fieldsToSet, fieldsToSetOnInsert, callback) {
    var fieldsToUpdate = {
            $set: Object.merge(fieldsToSet, {
                realmName: realm.name,
                realmId: realm._id
            }),
            $setOnInsert: fieldsToSetOnInsert
        },
        options = {
            upsert: true
        };

    logger.info('upsert in collection', collection, 'in realm: ', realm ? realm.name : '');
    logger.debug('\tfilter is', query);
    logger.debug('\titem to update is', fieldsToSet);
    logger.debug('\titem to insert is', fieldsToSetOnInsert);
    db[collection].update(
        query,
        fieldsToUpdate,
        options,
        function(err, saved) {
            if (err || !saved) {
                callback(['Element non mis à jour en base de données']);
            } else {
                logger.info('\tsuccess');
                callback([]);
            }
        }
    );
};

module.exports.removeWithFilter = function(realm, collection, filter, callback) {
    if (filter !== null && Object.keys(filter).length > 0) {
        logger.info('remove filtered values in collection:', collection, 'in realm:', realm ? realm.name : 'not set??');
        logger.debug('\tfilter is', filter);
        db[collection].remove(filter, function(err, deleted) {
            if (err || !deleted) {
                callback(['Aucun element n\'a été supprimé en base de données']);
            } else {
                logger.info('\tsuccess');
                callback([]);
            }
        });
    } else {
        logger.error('fail to remove items in collection', collection, 'in realms:', realm ? realm.name : 'not set??');
        logger.error('\tfilter is empty');
        logger.info('\tfailure');
        callback(['Aucun element n\'a été supprimé en base de données.Filtre de requête vide.']);
    }
};

module.exports.remove = function(realm, collection, items, callback) {
    var filter = null,
        subFilters = [],
        index;
    if (items && items.length > 0) {
        for (index = 0; index < items.length; index++) {
            subFilters.push({
                _id: mongojs.ObjectId(items[index])
            });
        }
        filter = {
            $or: subFilters
        };
    }
    module.exports.removeWithFilter(realm, collection, filter, callback);
};