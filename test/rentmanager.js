// 'use strict';

// var assert = require('assert'),
//     moment = require('moment'),
//     proxyquire = require('proxyquire'),
//     mocks = require('./mocks'),
//     manager = proxyquire('../backend/managers/rentmanager', {'../modules/db': new mocks.DB()});

// describe('rentmanager', function() {
//     describe('Compute one rent price - contract started first day of month', function() {
//         var properties = [
//             {
//                 entryDate: '01/01/2000',
//                 exitDate: '31/12/2008',
//                 property: { price: 100, expense: 10 }
//             },
//             {
//                 entryDate: '01/02/2000',
//                 exitDate: '31/12/2008',
//                 property: { price: 50 }
//             }
//         ];

//         it('Assert first rent price', function(){
//             var price = manager._computeRent(1, 2000, properties);
//             assert.equal(100, price.amount);
//             assert.equal(10, price.expense);
//         });

//         it('Assert second rent price', function(){
//             var price = manager._computeRent(2, 2000, properties);
//             assert.equal(150, price.amount);
//             assert.equal(10, price.expense);
//         });
//     });

//     describe('Compute one rent price - contract not started the first day of month', function() {
//         var properties = [
//             {
//                 entryDate: '11/01/2015',
//                 exitDate: '10/01/2025',
//                 property: { price: 100, expense: 10 }
//             },
//             {
//                 entryDate: '11/01/2015',
//                 exitDate: '10/01/2025',
//                 property: { price: 50 }
//             }
//         ];

//         it('Assert first rent price', function(){
//             var price = manager._computeRent(1, 2015, properties);
//             assert.equal(150, price.amount);
//             assert.equal(10, price.expense);
//         });

//         it('Assert last rent price', function(){
//             var price = manager._computeRent(1, 2025, properties);
//             assert.equal(150, price.amount);
//             assert.equal(10, price.expense);
//         });
//     });

//     describe('Create rents between two dates', function() {
//         var o = {
//             discount: 0,
//             isVat: true,
//             vatRatio: 0.2,
//             properties: [
//                 {
//                     entryDate: '01/01/2000',
//                     exitDate: '31/12/2008',
//                     property: { price: 100, expense: 10 }
//                 },
//                 {
//                     entryDate: '01/02/2000',
//                     exitDate: '31/12/2008',
//                     property: { price: 50 }
//                 }
//             ]
//         };
//         var begin = moment('01/01/2000', 'DD/MM/YYYY');
//         var rentMoment = moment('01/01/2000', 'DD/MM/YYYY');
//         var contractDuration = moment.duration(9, 'years');
//         var end = moment(begin).add(contractDuration).subtract(1, 'days');
//         var previousRent;
//         var testVatAmount = (o.properties[0].property.price + o.properties[0].property.expense + o.properties[1].property.price)*o.vatRatio;
//         var testRentAmount = (o.properties[0].property.price + o.properties[0].property.expense + o.properties[1].property.price) + testVatAmount;
//         var testVatAmountOneProp = (o.properties[0].property.price + o.properties[0].property.expense)*o.vatRatio;
//         var testRentAmountOneProp = (o.properties[0].property.price + o.properties[0].property.expense) + testVatAmountOneProp;

//         while (rentMoment.isSameOrBefore(end, 'month')) {
//             const contract = {
//                 begin,
//                 end,
//                 discount: o.discount || 0,
//                 vatRate: o.vatRatio,
//                 properties: o.properties
//             };
//             previousRent = manager.createRent(contract, rentMoment, end, previousRent);
//             rentMoment.add(1, 'months');
//         };

//         it('Assert number of years and months are correct', function(){
//             var year, month;
//             var countYear = 0;
//             var countMonth;

//             assert.notEqual(undefined, o.rents);
//             for (year in o.rents) {
//                 countYear++;
//                 assert.equal(true, Number(year)<2009);
//                 assert.equal(true, Number(year)>1999);
//                 countMonth = 0;
//                 for (month in o.rents[year]) {
//                     countMonth++;
//                     assert.equal(true, Number(month)<13);
//                     assert.equal(true, Number(month)>0);
//                 }
//                 assert.equal(12, countMonth);
//             }
//             assert.equal(9, countYear);
//         });

//         it('Assert amounts are correct', function(){
//             var year, month;
//             var runningRentAmount = 0;
//             var runningBalance = 0;
//             for (year in o.rents) {
//                 for (month in o.rents[year]) {
//                     assert.strictEqual(Number(year), o.rents[year][month].year);
//                     assert.strictEqual(Number(month), o.rents[year][month].month);
//                     assert.strictEqual(o.discount, o.rents[year][month].discount);
//                     assert.strictEqual(o.isVat, o.rents[year][month].isVat);
//                     assert.strictEqual(o.vatRatio, o.rents[year][month].vatRatio);
//                     runningBalance = runningRentAmount;
//                     if (year==2000 && month==1) {
//                         runningRentAmount += testRentAmountOneProp;
//                         assert.strictEqual(runningBalance, o.rents[year][month].balance);
//                         assert.strictEqual(testVatAmountOneProp, o.rents[year][month].vatAmount);
//                         assert.strictEqual(runningRentAmount, o.rents[year][month].totalAmount);
//                     }
//                     else {
//                         runningRentAmount += testRentAmount;
//                         assert.strictEqual(runningBalance, o.rents[year][month].balance);
//                         assert.strictEqual(testVatAmount, o.rents[year][month].vatAmount);
//                         assert.strictEqual(runningRentAmount, o.rents[year][month].totalAmount);
//                     }
//                 }
//             }
//         });

//         it('Make a payment', function(){
//             var year, month;
//             // var countRent = 0;
//             var previousRent;
//             var paymentData = {
//                 payment: (47*testRentAmount)+testRentAmountOneProp,
//                 paymentType: 'cash',
//                 paymentReference: '211221',
//                 paymentDate: '01/01/2004',
//                 description: 'no description'
//             };
//             // var isPayment = false;
//             var runningRentAmount = 0;
//             var runningBalance = 0;

//             rentMoment = moment('01/01/2004', 'DD/MM/YYYY');
//             let currentPaymentMonth = true;
//             do {
//                 previousRent = manager.updateRentAmount(rentMoment, end, previousRent, o, currentPaymentMonth ? paymentData : null);
//                 rentMoment.add(1, 'months');
//                 currentPaymentMonth = false;
//             } while (previousRent);

//             for (year in o.rents) {
//                 for (month in o.rents[year]) {
//                     assert.strictEqual(Number(year), o.rents[year][month].year);
//                     assert.strictEqual(Number(month), o.rents[year][month].month);
//                     assert.strictEqual(o.discount, o.rents[year][month].discount);
//                     assert.strictEqual(o.isVat, o.rents[year][month].isVat);
//                     assert.strictEqual(o.vatRatio, o.rents[year][month].vatRatio);

//                     runningBalance = runningRentAmount;
//                     if (year == 2000 && month==1) {
//                         runningRentAmount += testRentAmountOneProp;
//                     }
//                     else {
//                         runningRentAmount += testRentAmount;
//                     }
//                     if (Number(year)==2004 && Number(month)==1) {
//                         assert.strictEqual(runningRentAmount, o.rents[year][month].totalAmount);
//                         assert.strictEqual(runningBalance, o.rents[year][month].balance);
//                         runningRentAmount-=paymentData.payment;
//                         runningBalance -= paymentData.payment;
//                     }
//                     else {
//                         assert.strictEqual(runningRentAmount, o.rents[year][month].totalAmount);
//                         assert.strictEqual(runningBalance, o.rents[year][month].balance);
//                     }

//                     if (year == 2000 && month==1) {
//                         assert.strictEqual(testVatAmountOneProp, o.rents[year][month].vatAmount);
//                     }
//                     else {
//                         assert.strictEqual(testVatAmount, o.rents[year][month].vatAmount);
//                     }
//                 }
//             }
//         });

//         it('Modify contract duration', function() {
//             var duration = moment.duration(1, 'years');
//             var momentEnd = moment(end).add(duration);
//             var year, month;
//             var countYear = 0;
//             var countMonth;

//             previousRent = null;
//             rentMoment = moment('01/01/2000', 'DD/MM/YYYY');
//             do {
//                 previousRent = manager.updateRentAmount(rentMoment, momentEnd, previousRent, o);
//                 rentMoment.add(1, 'months');
//             } while (previousRent);

//             assert.notEqual(undefined, o.rents);
//             for (year in o.rents) {
//                 countYear++;
//                 assert.equal(true, Number(year)<2010);
//                 assert.equal(true, Number(year)>1999);
//                 countMonth = 0;
//                 for (month in o.rents[year]) {
//                     countMonth++;
//                     assert.equal(true, Number(month)<13);
//                     assert.equal(true, Number(month)>0);
//                 }
//                 assert.equal(12, countMonth);
//             }
//             assert.equal(10, countYear);

//             countYear = 0;
//             momentEnd = moment(momentEnd).subtract(duration);
//             previousRent = null;
//             rentMoment = moment('01/01/2000', 'DD/MM/YYYY');
//             do {
//                 previousRent = manager.updateRentAmount(rentMoment, momentEnd, previousRent, o);
//                 rentMoment.add(1, 'months');
//             } while (previousRent)

//             assert.notEqual(undefined, o.rents);
//             for (year in o.rents) {
//                 countYear++;
//                 assert.equal(true, Number(year)<2009);
//                 assert.equal(true, Number(year)>1999);
//                 countMonth = 0;
//                 for (month in o.rents[year]) {
//                     countMonth++;
//                     assert.equal(true, Number(month)<13);
//                     assert.equal(true, Number(month)>0);
//                 }
//                 assert.equal(12, countMonth);
//             }
//             assert.equal(9, countYear);
//         });
//     });
// });
