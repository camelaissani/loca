'use strict';

var assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    mocks = require('./mocks');


describe('occupantmanager', function() {
    it('Check create contract 9 years', function(done) {
        var manager;
        var properties = [{_id: '12345'}];
        var occupantToAdd = {
            beginDate: '01/01/2000', endDate: '31/12/2008',
            isCompany: false,
            company: null,
            legalForm: null,
            siret: null,
            capital: null,
            manager: '',
            name: '',
            properties: properties
        };
        var req = { 
            session : { user: { realm: {name : 'test'}} },
            body: occupantToAdd
        };
        var res = {
            json: function (occupant) {
                assert.deepStrictEqual(occupant, occupantToAdd);
                assert(mockedDB.listWithFilter.called);
                assert(mockedDB.add.called);
                done();
            }
        };
        var mockedDB = new mocks.DB();
        mockedDB.listWithFilter = function(realm, collection, filter, callback) {
            if (collection === 'properties') {
                callback(null, properties);
            } else {
                assert(false, 'should not call db.listWithFilter on collection ' + collection);
                done();
            }

        };
        mockedDB.add = function(realm, collection, occupant, callback) {
            var index, index2;
            if (collection === 'occupants') {
                assert(occupant.rents);
                assert(occupant.rents.hasOwnProperty('1999') === false);
                assert(occupant.rents.hasOwnProperty('2009') === false);
                for (index=2000; index<2009; index++) {
                    assert(occupant.rents.hasOwnProperty(''+index));
                    for (index2=1; index2<13; index2++) {
                        assert(occupant.rents[index].hasOwnProperty(''+index2));
                        assert(occupant.rents[index][index2]);
                    }
                }
                callback(null, occupant);
            }
            else {
                assert(false, 'should not call db.add on collection ' + collection);
                done();
            }
        };
        sinon.spy(mockedDB, 'listWithFilter');
        sinon.spy(mockedDB, 'add');

        manager = proxyquire('../server/managers/occupantmanager', {'../modules/db': mockedDB});
        manager.add(req, res);
    });

    it('Check update contract 9 years', function(done) {
        var manager;
        var properties = [{_id: '12345'}];
        var originalOccupant = {
            beginDate: '01/01/2000', endDate: '31/12/2008',
            isCompany: false,
            company: null,
            legalForm: null,
            siret: null,
            capital: null,
            manager: '',
            name: '',
            properties: properties
        };
        var occupantToModify = {
            beginDate: '01/01/2001', endDate: '31/12/2009',
            isCompany: false,
            company: null,
            legalForm: null,
            siret: null,
            capital: null,
            manager: 'Camel',
            name: 'Camel',
            properties: properties
        };
        var req = { 
            session : { user: { realm: {name : 'test'}} },
            body: occupantToModify
        };
        var res = {
            json: function (occupant) {
                assert.deepStrictEqual(occupant, occupantToModify);
                assert(mockedDB.listWithFilter.called);
                assert(mockedDB.update.called);
                done();
            }
        };
        var mockedDB = new mocks.DB();
        mockedDB.listWithFilter = function(realm, collection, filter, callback) {
            if (collection === 'properties') {
                callback(null, properties);
            } else {
                assert(false, 'should not call db.listWithFilter on collection ' + collection);
                done();
            }

        };
        mockedDB.update = function(realm, collection, occupant, callback) {
            var index, index2;
            if (collection === 'occupants') {
                assert(occupant.rents);
                assert(occupant.rents.hasOwnProperty('2000') === false);
                assert(occupant.rents.hasOwnProperty('2010') === false);
                for (index=2001; index<2010; index++) {
                    assert(occupant.rents.hasOwnProperty(''+index));
                    for (index2=1; index2<13; index2++) {
                        assert(occupant.rents[index].hasOwnProperty(''+index2));
                        assert(occupant.rents[index][index2]);
                    }
                }
                callback(null, occupant);
            }
            else {
                assert(false, 'should not call db.update on collection ' + collection);
                done();
            }
        };
        sinon.spy(mockedDB, 'listWithFilter');
        sinon.spy(mockedDB, 'update');

        manager = proxyquire('../server/managers/occupantmanager', {'../modules/db': mockedDB});
        manager.findOccupant = function(realm, id, callback) {
            callback(null, originalOccupant);
        };
        manager.update(req, res);
    });

    it('Check remove contract 9 years', function(done) {
        var manager;
        var properties = [{_id: '12345'}];
        var occupant = {
            beginDate: '01/01/2000', endDate: '31/12/2008',
            isCompany: false,
            company: null,
            legalForm: null,
            siret: null,
            capital: null,
            manager: '',
            name: '',
            properties: properties
        };
        var req = { 
            session : { user: { realm: {name : 'test'}} },
            body: {ids: ['occupantId']}
        };
        var res = {
            json: function (data) {
                assert.equal(data.errors, null);
                assert(mockedDB.listWithFilter.called);
                assert(mockedDB.remove.called);
                done();
            }
        };
        var mockedDB = new mocks.DB();
        mockedDB.listWithFilter = function(realm, collection, filter, callback) {
            if (collection === 'occupants') {
                callback(null, [occupant]);
            } else {
                assert(false, 'should not call db.listWithFilter on collection ' + collection);
                done();
            }

        };
        mockedDB.remove = function(realm, collection, occupantIds, callback) {
            if (collection === 'occupants') {
                assert(occupantIds[0], 'occupantId');
                callback(null);
            }
            else {
                assert(false, 'should not call db.add on collection ' + collection);
                done();
            }
        };
        sinon.spy(mockedDB, 'listWithFilter');
        sinon.spy(mockedDB, 'remove');

        manager = proxyquire('../server/managers/occupantmanager', {
            'mongojs': { ObjectId: function(t) { return t;}},
            '../modules/db': mockedDB
        });
        manager.remove(req, res);
    });

});