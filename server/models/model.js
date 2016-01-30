'use strict';

var db = require('./db');
// OF = require('./objectfilter');

function Model(collection) {
    this.collection = collection;
}

Model.prototype.findOne = function(realm, id, callback) {
    db.findItemById(realm, this.collection, id, function(errors, dbItems) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null, dbItems[0]);
        }
    });
};

Model.prototype.findAll = function(realm, callback) {
    this.findFilter(realm, {}, callback);
};

Model.prototype.findFilter = function(realm, filter, callback) {
    db.listWithFilter(realm, this.collection, filter, function(errors, dbItems) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null, dbItems);
        }
    });
};

Model.prototype.upsert = function(realm, query, fieldsToSet, fieldsToSetOnInsert, callback) {
    db.upsert(realm, this.collection, query, fieldsToSet, fieldsToSetOnInsert, function(errors) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null);
        }
    });
};

Model.prototype.update = function(realm, item, callback) {
    db.update(realm, this.collection, item, function(errors) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            callback(null);
        }
    });
};

Model.prototype.add = function(realm, item, callback) {
    db.add(realm, this.collection, item, function(errors, item) {
        if (errors && errors.length > 0) {
            callback(errors);
            return;
        }
        callback(null, item);
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