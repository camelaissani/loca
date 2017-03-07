// 'use strict';

// var assert = require('assert'),
//     sinon = require('sinon'),
//     proxyquire = require('proxyquire'),
//     mocks = require('./mocks');


// describe('occupantmanager', function() {
//     it('Check create contract 9 years', function(done) {
//         var manager;
//         var properties = [{
//             _id: '12345'
//         }];
//         var occupantToAdd = {
//             beginDate: '01/01/2000',
//             endDate: '31/12/2008',
//             isCompany: false,
//             company: null,
//             legalForm: null,
//             siret: null,
//             capital: null,
//             manager: '',
//             name: '',
//             properties: properties
//         };
//         var req = {
//             session: {
//                 user: {
//                     realm: {
//                         name: 'test'
//                     }
//                 }
//             },
//             body: occupantToAdd
//         };
//         var res = {
//             json: function(occupant) {
//                 assert.deepStrictEqual(occupant, occupantToAdd);
//                 assert(mockedPropertyModel.findFilter.called);
//                 assert(mockedOccupantModel.add.called);
//                 done();
//             }
//         };
//         var mockedOccupantModel = new mocks.Model();
//         var mockedPropertyModel = new mocks.Model();
//         mockedPropertyModel.findFilter = function(realm, filter, callback) {
//             callback(null, properties);
//         };
//         mockedOccupantModel.add = function(realm, occupant, callback) {
//             var index, index2;
//             assert(occupant.rents);
//             assert(occupant.rents.hasOwnProperty('1999') === false);
//             assert(occupant.rents.hasOwnProperty('2009') === false);
//             for (index = 2000; index < 2009; index++) {
//                 assert(occupant.rents.hasOwnProperty('' + index));
//                 for (index2 = 1; index2 < 13; index2++) {
//                     assert(occupant.rents[index].hasOwnProperty('' + index2));
//                     assert(occupant.rents[index][index2]);
//                 }
//             }
//             callback(null, occupant);
//         };
//         sinon.spy(mockedPropertyModel, 'findFilter');
//         sinon.spy(mockedOccupantModel, 'add');

//         manager = proxyquire('../backend/managers/occupantmanager', {
//             '../models/occupant': mockedOccupantModel,
//             '../models/property': mockedPropertyModel
//         });
//         manager.add(req, res);
//     });

//     it('Check update contract 9 years', function(done) {
//         var manager;
//         var properties = [{
//             _id: '12345'
//         }];
//         var originalOccupant = {
//             beginDate: '01/01/2000',
//             endDate: '31/12/2008',
//             isCompany: false,
//             company: null,
//             legalForm: null,
//             siret: null,
//             capital: null,
//             manager: '',
//             name: '',
//             properties: properties
//         };
//         var occupantToModify = {
//             beginDate: '01/01/2001',
//             endDate: '31/12/2009',
//             isCompany: false,
//             company: null,
//             legalForm: null,
//             siret: null,
//             capital: null,
//             manager: 'Camel',
//             name: 'Camel',
//             properties: properties
//         };
//         var req = {
//             session: {
//                 user: {
//                     realm: {
//                         name: 'test'
//                     }
//                 }
//             },
//             body: occupantToModify
//         };
//         var res = {
//             json: function(occupant) {
//                 assert.deepStrictEqual(occupant, occupantToModify);
//                 assert(mockedPropertyModel.findFilter.called);
//                 assert(mockedOccupantModel.update.called);
//                 done();
//             }
//         };
//         var mockedOccupantModel = new mocks.Model();
//         var mockedPropertyModel = new mocks.Model();
//         mockedPropertyModel.findFilter = function(realm, filter, callback) {
//             callback(null, properties);
//         };
//         mockedOccupantModel.update = function(realm, occupant, callback) {
//             var index, index2;
//             assert(occupant.rents);
//             assert(occupant.rents.hasOwnProperty('2000') === false);
//             assert(occupant.rents.hasOwnProperty('2010') === false);
//             for (index = 2001; index < 2010; index++) {
//                 assert(occupant.rents.hasOwnProperty('' + index));
//                 for (index2 = 1; index2 < 13; index2++) {
//                     assert(occupant.rents[index].hasOwnProperty('' + index2));
//                     assert(occupant.rents[index][index2]);
//                 }
//             }
//             callback(null, occupant);
//         };
//         sinon.spy(mockedPropertyModel, 'findFilter');
//         sinon.spy(mockedOccupantModel, 'update');

//         manager = proxyquire('../backend/managers/occupantmanager', {
//             '../models/occupant': mockedOccupantModel,
//             '../models/property': mockedPropertyModel
//         });
//         manager.findOccupant = function(realm, id, callback) {
//             callback(null, originalOccupant);
//         };
//         manager.update(req, res);
//     });

//     it('Check remove contract 9 years', function(done) {
//         var manager;
//         var properties = [{
//             _id: '12345'
//         }];
//         var occupant = {
//             beginDate: '01/01/2000',
//             endDate: '31/12/2008',
//             isCompany: false,
//             company: null,
//             legalForm: null,
//             siret: null,
//             capital: null,
//             manager: '',
//             name: '',
//             properties: properties
//         };
//         var req = {
//             session: {
//                 user: {
//                     realm: {
//                         name: 'test'
//                     }
//                 }
//             },
//             body: {
//                 ids: ['occupantId']
//             }
//         };
//         var res = {
//             json: function(data) {
//                 assert.equal(data.errors, null);
//                 assert(mockedOccupantModel.findFilter.called);
//                 assert(mockedOccupantModel.remove.called);
//                 done();
//             }
//         };
//         var mockedOccupantModel = new mocks.Model();
//         mockedOccupantModel.findFilter = function(realm, filter, callback) {
//             callback(null, [occupant]);
//         };
//         mockedOccupantModel.remove = function(realm, occupantIds, callback) {
//             assert(occupantIds[0], 'occupantId');
//             callback(null);
//         };
//         sinon.spy(mockedOccupantModel, 'findFilter');
//         sinon.spy(mockedOccupantModel, 'remove');

//         manager = proxyquire('../backend/managers/occupantmanager', {
//             'mongojs': {
//                 ObjectId: function(t) {
//                     return t;
//                 }
//             },
//             '../models/occupant': mockedOccupantModel
//         });
//         manager.remove(req, res);
//     });

// });
