// 'use strict';

// var assert = require('assert'),
//     OF = require('../backend/models/objectfilter');

// describe('objectfilter', function() {
//     var schema = new OF({
//         a: String,
//         b: Number,
//         c: Object,
//         d: Array,
//         e: Boolean
//     });
//     describe('Convert type of object according to schema ', function() {
//         var value = {
//             a: 'my name',
//             b: '1,452',
//             c: {
//                 a: '2'
//             },
//             d: ['3', '4'],
//             e: 'true'
//         };

//         it('Asserts types are correct', function() {
//             var filteredValue = schema.filter(value);
//             assert.strictEqual('my name', filteredValue.a);
//             assert.strictEqual(1.452, filteredValue.b);
//             assert.strictEqual('2', filteredValue.c.a);
//             assert.strictEqual('3', filteredValue.d[0]);
//             assert.strictEqual('4', filteredValue.d[1]);
//             assert.strictEqual(true, filteredValue.e);
//         });
//     });

//     describe('Only keep attributes that are defined in schema ', function() {
//         var value = {
//             a: 'my name',
//             b: '1',
//             c: '2',
//             d: '3',
//             e: '4',
//             f: '5',
//             g: '6'
//         };

//         it('Look for attributes not in schema', function() {
//             var filteredValue = schema.filter(value);

//             assert.strictEqual(undefined, filteredValue.f);
//             assert.strictEqual(undefined, filteredValue.g);
//         });
//     });

//     describe('Ignore attributes with wrong types', function() {
//         var value = {
//             a: 1,
//             b: '1.452',
//             c: '2',
//             d: '3',
//             e: '4'
//         };

//         it('Asserts wrong types are ignored', function() {
//             var filteredValue = schema.filter(value);
//             assert.strictEqual(undefined, filteredValue.a);
//             assert.strictEqual(1.452, filteredValue.b);
//             assert.strictEqual(undefined, filteredValue.c);
//             assert.strictEqual(undefined, filteredValue.d);
//             assert.strictEqual(undefined, filteredValue.e);
//         });
//     });

//     describe('Empty or zero value', function() {
//         var value = {
//             a: '',
//             b: '',
//             c: '',
//             d: [],
//             e: ''
//         };

//         it('Asserts wrong types are ignored', function() {
//             var filteredValue = schema.filter(value);
//             assert.strictEqual('', filteredValue.a);
//             assert.strictEqual(0, filteredValue.b);
//             assert.strictEqual(undefined, filteredValue.c);
//             assert.strictEqual(0, filteredValue.d.length);
//             assert.strictEqual(undefined, filteredValue.e);
//         });
//     });

//     describe('NaN when number reqested', function() {
//         var value = {
//             a: '',
//             b: NaN,
//             c: '',
//             d: [],
//             e: ''
//         };

//         it('Asserts wrong types are ignored', function() {
//             var filteredValue = schema.filter(value);
//             assert.strictEqual('', filteredValue.a);
//             assert.strictEqual(0, filteredValue.b);
//             assert.strictEqual(undefined, filteredValue.c);
//             assert.strictEqual(0, filteredValue.d.length);
//             assert.strictEqual(undefined, filteredValue.e);
//         });
//     });

//     describe('Schema with unsuported type', function() {
//         var schema = new OF({
//             a: Function
//         });
//         var value = {
//             a: function() {}
//         };

//         it('Asserts throw an exception', function() {

//             assert.throws(function() {
//                     schema.filter(value);
//                 },
//                 Error);
//         });
//     });
// });
