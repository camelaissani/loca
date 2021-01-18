// 'use strict';

// var assert = require('assert'),
//     sinon = require('sinon'),
//     moment = require('moment'),
//     proxyquire = require('proxyquire'),
//     mocks = require('./mocks'),
//     manager;

// describe('notificationmanager', function() {
//     before(function() {
//         var mockedModel = new mocks.Model();
//         mockedModel.findAll = function(realm, callback) {
//             callback(null, []);
//         };
//         manager = proxyquire('../backend/managers/notificationmanager', {
//             '../models/notification': mockedModel
//         });
//     });

//     it('list all notifications', function(done) {
//         var req = {
//                 session: {
//                     user: {
//                         realm: {
//                             name: 'test'
//                         } 
//                     }
//                 }
//             },
//             res = {
//                 json: function(result) {
//                     assert(result.length === 2);
//                     assert(result[0].notificationId !== result[1].notificationId);
//                     assert(result[0].expired === false);
//                     assert(result[1].expired === false);
//                     done();
//                 }
//             },
//             expirationDate = new Date();

//         expirationDate.setDate(expirationDate.getDate() + 1);

//         manager.feeders = [

//             function expiredDocuments(t, realmName, callback) {
//                 var occupantId = "123",
//                     occupantName = "Mike",
//                     documentDescription = "assurance 2014";
//                 callback([{
//                     notificationId: manager.generateId(occupantId + '_document_' + moment(expirationDate).format('DD/MM/YYYY') + documentDescription),
//                     expirationDate: expirationDate,
//                     title: occupantName,
//                     description: 'Document ' + documentDescription + ' à expiré le ' + moment(expirationDate).format('DD/MM/YYYY'),
//                     actionUrl: ''
//                 }]);
//             },
//             function chequesToCollect(t, realmName, callback) {
//                 var occupantId = "123",
//                     occupantName = "Mike",
//                     chequeNumber = "XXXXX";
//                 callback([{
//                     notificationId: manager.generateId(occupantId + '_rentPayment_' + moment(expirationDate).format('DD/MM/YYYY') + chequeNumber),
//                     expirationDate: expirationDate,
//                     title: occupantName,
//                     description: 'Encaisser le chèque de ' + occupantName + ' n°' + chequeNumber + ' le ' + moment(expirationDate).format('DD/MM/YYYY'),
//                     actionUrl: ''
//                 }]);
//             }
//         ];

//         manager.findAll(req, res);
//     });

//     it('Assert one is expired', function(done) {
//         var req = {
//                 session: {
//                     user: {
//                         realm: {
//                             name: 'test'
//                         } 
//                     }
//                 }
//             },
//             res = {
//                 json: function(result) {
//                     assert(result.length === 3);
//                     assert(result[0].notificationId !== result[1].notificationId);
//                     assert(result[0].expired === true);
//                     assert(result[1].expired === false);
//                     assert(result[2].expired === false);
//                     done();
//                 }
//             };

//         manager.feeders = [

//             function expiredDocuments(t, realmName, callback) {
//                 var occupantId = "123",
//                     occupantName = "Mike",
//                     documentDescription = "assurance 2014",
//                     expirationDate = new Date();
//                 expirationDate.setDate(expirationDate.getDate() - 1);
//                 callback([{
//                     type: 'expiredDocument',
//                     notificationId: manager.generateId(occupantId + '_document_' + moment(expirationDate).format('DD/MM/YYYY') + documentDescription),
//                     expirationDate: expirationDate,
//                     title: occupantName,
//                     description: 'Document ' + documentDescription + ' à expiré le ' + moment(expirationDate).format('DD/MM/YYYY'),
//                     actionUrl: ''
//                 }]);
//             },
//             function chequesToCollect(t, realmName, callback) {
//                 var occupantId = "123",
//                     occupantName = "Mike",
//                     chequeNumber = "XXXXX",
//                     expirationDate = new Date();
//                 expirationDate.setDate(expirationDate.getDate());
//                 callback([{
//                     type: 'chequeToCollect',
//                     notificationId: manager.generateId(occupantId + '_rentPayment_' + moment(expirationDate).format('DD/MM/YYYY') + chequeNumber),
//                     expirationDate: expirationDate,
//                     title: occupantName,
//                     description: 'Encaisser le chèque de ' + occupantName + ' n°' + chequeNumber + ' le ' + moment(expirationDate).format('DD/MM/YYYY'),
//                     actionUrl: ''
//                 }]);
//             },
//             function chequesToCollect(t, realmName, callback) {
//                 var occupantId = "123",
//                     occupantName = "Mike",
//                     chequeNumber = "XXXXX",
//                     expirationDate = new Date();
//                 expirationDate.setDate(expirationDate.getDate() + 1);
//                 callback([{
//                     type: 'chequeToCollect',
//                     notificationId: manager.generateId(occupantId + '_rentPayment_' + moment(expirationDate).format('DD/MM/YYYY') + chequeNumber),
//                     expirationDate: expirationDate,
//                     title: occupantName,
//                     description: 'Encaisser le chèque de ' + occupantName + ' n°' + chequeNumber + ' le ' + moment(expirationDate).format('DD/MM/YYYY'),
//                     actionUrl: ''
//                 }]);
//             }
//         ];

//         manager.findAll(req, res);
//     });
// });
