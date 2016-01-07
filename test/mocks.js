module.exports.db = { 
    init: function () {
        console.log('mocked function db.init');
    },
    
    findItemById: function (realm, collection, id, callback) {
        console.log('mocked function db.findItemById');
    },
    
    listWithFilter: function (realm, collection, filter, callback) {
        console.log('mocked function db.listWithFilter');
    },

    list: function (realm, collection, callback) {
        console.log('mocked function db.list');
    },

    add: function (realm, collection, item, callback) {
        console.log('mocked function db.add');
    },

    updateWithFilter: function (realm, collection, filter, item, callback) {
        console.log('mocked function db.updateWithFilter');
    },

    update: function (realm, collection, item, callback) {
        console.log('mocked function db.update');
    },

    upsert: function (realm, collection, query, fieldsToSet, fieldsToSetOnInsert, callback) {
        console.log('mocked function db.upsert');
    },

    removeWithFilter: function (realm, collection, filter, callback) {
        console.log('mocked function db.removeWithFilter');
    },

    remove: function (realm, collection, items, callback) {
        console.log('mocked function db.remove');
    }
};