// 'use strict';

// var assert = require('assert'),
//     sinon = require('sinon'),
//     proxyquire = require('proxyquire'),
//     mocks = require('./mocks');

// require('sugar').extend();

// describe('model', function() {
//     it('findOne', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.findItemById = function(realm, collection, id, callback) {
//             assert(realm === 'myrealm');
//             assert(id === 'myid');
//             assert(collection === 'mycollection');
//             callback(null, ['itemtoreturn']);
//         };
//         sinon.spy(mockedDB, 'findItemById');

//         model.schema = {
//             filter: function(item) {
//                 return item;
//             }
//         };

//         model.findOne('myrealm', 'myid', function(errors, item) {
//             assert(mockedDB.findItemById.called);
//             assert(item === 'itemtoreturn');
//             done();
//         });
//     });

//     it('findOne without schema', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.findItemById = function(realm, collection, id, callback) {
//             assert(realm === 'myrealm');
//             assert(id === 'myid');
//             assert(collection === 'mycollection');
//             callback(null, ['itemtoreturn']);
//         };
//         sinon.spy(mockedDB, 'findItemById');

//         model.findOne('myrealm', 'myid', function(errors, item) {
//             assert(mockedDB.findItemById.called);
//             assert(item === 'itemtoreturn');
//             done();
//         });
//     });

//     it('findOne returns nothing', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.findItemById = function(realm, collection, id, callback) {
//             assert(realm === 'myrealm');
//             assert(id === 'myid');
//             assert(collection === 'mycollection');
//             callback(null, null);
//         };
//         sinon.spy(mockedDB, 'findItemById');

//         model.findOne('myrealm', 'myid', function(errors, item) {
//             assert(mockedDB.findItemById.called);
//             assert(item === null);
//             done();
//         });
//     });

//     it('findOne returns errors', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.findItemById = function(realm, collection, id, callback) {
//             assert(realm === 'myrealm');
//             assert(id === 'myid');
//             assert(collection === 'mycollection');
//             callback(['error!!!']);
//         };
//         sinon.spy(mockedDB, 'findItemById');

//         model.findOne('myrealm', 'myid', function(errors, item) {
//             assert(mockedDB.findItemById.called);
//             assert(errors.length > 0);
//             assert(typeof item === 'undefined');
//             done();
//         });
//     });

//     it('findAll', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         model.findFilter = function(realm, filter, callback) {
//             assert(realm === 'myrealm');
//             assert(Object.isEqual(filter, {}));
//             callback(null, ['myitem']);
//         };
//         sinon.spy(model, 'findFilter');

//         model.findAll('myrealm', function(errors, items) {
//             assert(model.findFilter.called);
//             assert(errors === null);
//             assert(items.length > 0);
//             done();
//         });
//     });

//     it('findFilter', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.listWithFilter = function(realm, collection, filter, callback) {
//             assert(realm === 'myrealm');
//             assert(collection === 'mycollection');
//             assert(Object.isEqual(filter, {
//                 my: 'filter'
//             }));
//             callback(null, ['itemtoreturn']);
//         };
//         sinon.spy(mockedDB, 'listWithFilter');

//         model.schema = {
//             filter: function(item) {
//                 return item;
//             }
//         };

//         model.findFilter('myrealm', {
//             my: 'filter'
//         }, function(errors, items) {
//             assert(mockedDB.listWithFilter.called);
//             assert(items[0] === 'itemtoreturn');
//             done();
//         });
//     });

//     it('findFilter without schema', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.listWithFilter = function(realm, collection, filter, callback) {
//             assert(realm === 'myrealm');
//             assert(collection === 'mycollection');
//             assert(Object.isEqual(filter, {
//                 my: 'filter'
//             }));
//             callback(null, ['itemtoreturn']);
//         };
//         sinon.spy(mockedDB, 'listWithFilter');

//         model.findFilter('myrealm', {
//             my: 'filter'
//         }, function(errors, items) {
//             assert(mockedDB.listWithFilter.called);
//             assert(items[0] === 'itemtoreturn');
//             done();
//         });
//     });

//     it('findFilter returns nothing', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.listWithFilter = function(realm, collection, filter, callback) {
//             assert(realm === 'myrealm');
//             assert(collection === 'mycollection');
//             assert(Object.isEqual(filter, {
//                 my: 'filter'
//             }));
//             callback(null, []);
//         };
//         sinon.spy(mockedDB, 'listWithFilter');

//         model.findFilter('myrealm', {
//             my: 'filter'
//         }, function(errors, items) {
//             assert(mockedDB.listWithFilter.called);
//             assert(items.length === 0);
//             done();
//         });
//     });

//     it('findFilter returns null', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.listWithFilter = function(realm, collection, filter, callback) {
//             assert(realm === 'myrealm');
//             assert(collection === 'mycollection');
//             assert(Object.isEqual(filter, {
//                 my: 'filter'
//             }));
//             callback(null, null);
//         };
//         sinon.spy(mockedDB, 'listWithFilter');

//         model.findFilter('myrealm', {
//             my: 'filter'
//         }, function(errors, items) {
//             assert(mockedDB.listWithFilter.called);
//             assert(items.length === 0);
//             done();
//         });
//     });

//     it('findFilter returns error', function(done) {
//         var mockedDB = new mocks.DB(),
//             mockedLogger = new mocks.Logger(),
//             Model = proxyquire('../backend/models/model', {
//                 './db': mockedDB,
//                 'winston': mockedLogger
//             }),
//             model = new Model('mycollection');

//         mockedDB.listWithFilter = function(realm, collection, filter, callback) {
//             assert(realm === 'myrealm');
//             assert(collection === 'mycollection');
//             assert(Object.isEqual(filter, {
//                 my: 'filter'
//             }));
//             callback(['error!!!']);
//         };
//         sinon.spy(mockedDB, 'listWithFilter');

//         model.findFilter('myrealm', {
//             my: 'filter'
//         }, function(errors, items) {
//             assert(mockedDB.listWithFilter.called);
//             assert(errors.length > 0);
//             assert(typeof items === 'undefined');
//             done();
//         });
//     });
// });
