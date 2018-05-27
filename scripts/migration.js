const moment = require('moment');
const math = require('mathjs');
const db = require('../backend/models/db');
const occupantModel = require('../backend/models/occupant');
const realmModel = require('../backend/models/realm');

const realmName = process.env.LOCA_REALM;

function updateOccupant(realm, occupant) {
    return new Promise((resolve, reject) => {
        occupantModel.update(realm, occupant, (errors) => {
            if (errors) {
                reject(errors);
                return;
            }
            resolve();
        });
    });
}

function occupant_rents_ObjectToArray() {
    return new Promise(function(resolve, reject) {
        realmModel.findAll((errors, realms) => {
            if (errors) {
                reject(errors);
                return;
            }
            const realmsFound = realms.filter(realm => realm.name === realmName);
            if (realmsFound.length ===0) {
                reject(`no realms found for ${realmName}`);
                return;
            }
            realmsFound.forEach(realm => {
                occupantModel.schema.schema.rents = Object;
                occupantModel.findAll(realm, (errors, occupants) => {
                    if (errors) {
                        reject(errors);
                        return;
                    }
                    occupantModel.schema.schema.rents = Array;
                    resolve(Promise.all(occupants.sort((o1, o2) => {
                        const O1 = o1.name.toUpperCase();
                        const O2 = o2.name.toUpperCase();
                        if (O1 > O2) {
                            return 1;
                        }
                        if (O1 < O2) {
                            return -1;
                        }
                        return 0;
                    })
                    .map(occupant => {
                        const rentsAsArray = [];
                        // console.log(occupant.company);
                        Object.keys(occupant.rents).forEach(year => {
                            const months = Object.keys(occupant.rents[year]);
                            // console.log(`${year}: ${months}`);
                            months.forEach(month => {
                                const oldRent = occupant.rents[year][month];
                                const newRent = {
                                    term: Number(moment(`01/${month}/${year} 00:00`, 'DD/MM/YYYY HH:mm').format('YYYYMMDDHH')),
                                    month: month,
                                    year: year,
                                    preTaxAmounts: [],
                                    charges: [],
                                    discounts: [],
                                    debts: [],
                                    vats: [],
                                    payments: [],
                                    total: {
                                        balance: 0,
                                        preTaxAmount: 0,
                                        charges: 0,
                                        discount: 0,
                                        vat: 0,
                                        grandTotal: 0,
                                        payment: 0
                                    }
                                };
                                const rate = occupant.vatRatio || 0;

                                occupant.properties.reduce((acc, property) => {
                                    const name = property.property.name || '';
                                    const preTaxAmount = property.property.price || 0;
                                    const charges = property.property.expense || 0;

                                    acc.preTaxAmounts.push({
                                        amount: preTaxAmount,
                                        description: name
                                    });
                                    acc.charges.push({
                                        description: `charges ${name}`,
                                        amount: charges
                                    });
                                    return acc;
                                }, newRent);

                                newRent.discounts.push({
                                    origin: 'contract',
                                    description: 'Remise exceptionnelle',
                                    amount: occupant.discount
                                });

                                if (oldRent.promo) {
                                    newRent.discounts.push({
                                        origin: 'settlement',
                                        description: oldRent.notepromo || '',
                                        amount: rate > 0 ? oldRent.promo * 1 / (1 + rate) : oldRent.promo
                                    });
                                }

                                newRent.preTaxAmounts.forEach((preTaxAmount) => {
                                    newRent.vats.push({
                                        origin: 'contract',
                                        description: `${preTaxAmount.description} T.V.A. (${rate*100}%)`,
                                        amount: preTaxAmount.amount*rate,
                                        rate
                                    });
                                });

                                newRent.charges.forEach((charges) => {
                                    newRent.vats.push({
                                        origin: 'contract',
                                        description: `${charges.description} T.V.A. (${rate*100}%)`,
                                        amount: charges.amount*rate,
                                        rate
                                    });
                                });


                                newRent.discounts.forEach((discount) => {
                                    newRent.vats.push({
                                        origin: discount.origin,
                                        description: `${discount.description} T.V.A. (${rate*100}%)`,
                                        amount: discount.amount*rate*(-1),
                                        rate
                                    });
                                });

                                newRent.total.balance = oldRent.balance;

                                newRent.description = oldRent.description || '';


                                if (oldRent.payment) {
                                    newRent.payments.push({
                                        date: oldRent.paymentDate || '',
                                        amount: oldRent.payment || 0,
                                        type: oldRent.paymentType || '',
                                        reference: oldRent.paymentReference || ''
                                    });
                                }

                                const preTaxAmount = newRent.preTaxAmounts.reduce((total, preTaxAmount) => total + preTaxAmount.amount, 0);
                                const charges = newRent.charges.reduce((total, charges) => total + charges.amount, 0);
                                const discount = newRent.discounts.reduce((total, discount) => total + discount.amount, 0);
                                const vat = math.round(newRent.vats.reduce((total, vat) => total + vat.amount, 0), 2);

                                newRent.total.preTaxAmount = preTaxAmount;
                                newRent.total.charges = charges;
                                newRent.total.discount = discount;
                                newRent.total.vat = vat;
                                newRent.total.grandTotal = math.round(preTaxAmount + charges - discount + vat + newRent.total.balance, 2);
                                newRent.total.payment = oldRent.payment;

                                rentsAsArray.push(newRent);
                            });
                        });
                        // console.log(rentsAsArray.length);
                        occupant.rents = rentsAsArray;

                        return updateOccupant(realm, occupant);
                    })));
                });
            });
        });
    });
}

// Main
db.init();
console.log(`working on realm ${realmName}`);

occupant_rents_ObjectToArray()
.then(() => process.exit())
.catch(reason => {
    console.error(reason);
    process.exit(1);
});

