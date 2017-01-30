'use strict';

var logger = require('winston'),
    db = require('./db');

function Model(collection) {
    this.collection = collection;
    db.addCollection(collection);
}

Model.prototype.findOne = function(realm, id, callback) {
    var self = this,
        item;
    db.findItemById(realm, this.collection, id, function(errors, dbItems) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            item = (dbItems && dbItems.length > 0) ? dbItems[0] : null;
            callback(null, self.schema ? self.schema.filter(item) : item);
        }
    });
};

Model.prototype.findAll = function(realm, callback) {
    this.findFilter(realm, {}, callback);
};

Model.prototype.findFilter = function(realm, filter, callback) {
    var self = this,
        items;
    db.listWithFilter(realm, this.collection, filter, function(errors, dbItems) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            items = dbItems ? dbItems : [];
            if (self.schema) {
                items.forEach(function(item, index) {

                    items[index] = self.schema.filter(item);
                });
            }
            callback(null, items);
        }
    });
};

Model.prototype.upsert = function(realm, query, fieldsToSet, fieldsToSetOnInsert, callback) {
    var updateSchema = this.updateSchema || this.schema;

    if (!updateSchema.exists(fieldsToSet)) {
        logger.error('cannot update', this.collection, fieldsToSet, 'not valid');
        callback(['cannot update database fields not valid']);
        return;
    }

    db.upsert(realm, this.collection, query, fieldsToSet, this.schema.filter(fieldsToSetOnInsert), function(errors) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null);
        }
    });
};

Model.prototype.update = function(realm, item, callback) {
    var updateSchema = this.updateSchema || this.schema,
        itemToUpdate = updateSchema.filter(item);
    db.update(realm, this.collection, itemToUpdate, function(errors) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null);
        }
    });
};

Model.prototype.add = function(realm, item, callback) {
    var self = this,
        addSchema = this.addSchema || this.schema,
        itemToAdd = addSchema.filter(item);
    db.add(realm, this.collection, itemToAdd, function(errors, dbItem) {
        if (errors && errors.length > 0) {
            callback(errors);
            return;
        }
        callback(null, self.schema.filter(dbItem));
    });
};

Model.prototype.remove = function(realm, ids, callback) {
    db.remove(realm, this.collection, ids, function(errors) {
        if (errors && errors.length > 0) {
            callback(errors);
            return;
        }
        callback(null);
    });
};

module.exports = Model;