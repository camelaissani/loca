import moment from 'moment';
import math from 'mathjs';
import config from '../../config';

function toRentData(inputRent, inputOccupant, emailStatus) {
    const rent = JSON.parse(JSON.stringify(inputRent));
    const rentMoment = moment(String(rent.term), 'YYYYMMDDHH');

    const rentToReturn = {
        month: rent.month,
        year: rent.year,
        balance: rent.total.balance,
        newBalance:  rent.total.payment - rent.total.grandTotal,
        payment: rent.total.payment || 0,
        discount: rent.total.discount,
        totalAmount: rent.total.grandTotal,
        totalWithoutBalanceAmount: rent.total.grandTotal - rent.total.balance,
        totalToPay: rent.total.grandTotal,
        description: rent.description,
        countMonthNotPaid: 0,
        paymentStatus: []
    };

    // Last payment win :(
    // Currently the UI support only one payment
    Object.assign(
        rentToReturn,
        rent.payments
        .reduce((acc, payment) => {
            return {
                paymentType: payment.type,
                paymentReference: payment.reference,
                paymentDate: payment.date,
            };
        }, {
            paymentType: '',
            paymentReference: '',
            paymentDate: ''
        })
    );

    Object.assign(
        rentToReturn,
        rent.discounts
        .filter(discount => discount.origin === 'settlement')
        .reduce((acc, discount) => {
            return {
                promo: acc.promo + discount.amount,
                notepromo: `${acc.notepromo}${discount.description}\n`
            };
        }, {promo:0, notepromo:''})
    );
    Object.assign(
        rentToReturn,
        rent.vats
        .filter(vat => vat.origin === 'settlement')
        .reduce((acc, vat) => {
            acc.promo -= vat.amount;
            return acc;
        }, rentToReturn)
    );

    Object.assign(
        rentToReturn,
        rent.discounts
        .filter(discount => discount.origin === 'contract')
        .reduce((acc, discount) => {
            return {
                totalWithoutVatAmount:  acc.totalWithoutVatAmount - discount.amount
            };
        }, {totalWithoutVatAmount: rent.total.preTaxAmount + rent.total.charges})
    );

    Object.assign(
        rentToReturn,
        rent.vats
        .filter(vat => vat.origin === 'contract')
        .reduce((acc, vat) => {
            return {
                vatAmount:  acc.vatAmount + vat.amount
            };
        }, {vatAmount: 0})
    );

    // payment status
    rentToReturn.status = '';
    if (rentMoment.isSameOrBefore(moment(), 'month')) {
        if (rentToReturn.totalAmount <= 0 || rentToReturn.newBalance >= 0) {
            rentToReturn.status = 'paid';
        } else if (rentToReturn.payment > 0) {
            rentToReturn.status = 'partialypaid';
        } else {
            rentToReturn.status = 'notpaid';
        }
    }


    if (inputOccupant) {
        // email status
        if (emailStatus) {
            Object.assign(rentToReturn, {emailStatus});
        }

        const occupant = toOccupantData(inputOccupant);

        Object.assign(
            rentToReturn,
            {
                _id: occupant._id,
                occupant: occupant,
                vatRatio: occupant.vatRatio,
                uid: `${occupant._id}|${rent.month}|${rent.year}`
            }
        );

        // count number of month rent not paid
        let endCounting = false;
        inputOccupant.rents
        //.reverse()
        .filter(currentRent => {
            if (moment(String(currentRent.term), 'YYYYMMDDHH').isSameOrBefore(moment(), 'month')) {
                if (endCounting) {
                    return false;
                }

                //const payment = currentRent.total.payment;
                const totalAmount = currentRent.total.grandTotal;
                const newBalance =  currentRent.total.payment - currentRent.total.grandTotal;

                //if (payment || totalAmount <= 0 || newBalance >= 0) {
                if (totalAmount <= 0 || newBalance >= 0) {
                    endCounting = true;
                    return false;
                }
                return true;
            }
            return false;
        })
        .forEach(currentRent => {
            const payment = currentRent.total.payment;
            const term = moment(String(currentRent.term), 'YYYYMMDDHH');
            rentToReturn.paymentStatus.push({
                month: term.month() + 1,
                status: payment > 0 ? 'partialypaid' : 'notpaid'
            });
            rentToReturn.countMonthNotPaid++;
        });
    }

    return rentToReturn;
}

function toPrintData(realm, doc, fromMonth, month, year, occupants) {
    if (month) {
        month = month > 12 ? 12 : month;
    }
    if (fromMonth) {
        fromMonth = fromMonth > 12 ? 12 : fromMonth;
    }

    const data = {
        today: moment().format('LL'),
        year: moment().format('YYYY'),
        months: Array.from(Array(13).keys()).slice(1), // [1,2..,12]
        occupants: occupants.map(occupant => toOccupantData(occupant)),
        config,
        document: doc,
        realm: realm.manager ? realm : {
            manager: '?',
            company: '?',
            legalForm: '?',
            capital: 0,
            rcs: '?',
            vatNumber: '?',
            street1: '?',
            street2: '?',
            zipCode: '?',
            city: '?',
            contact: '?',
            phone1: '?',
            phone2: '?',
            email: '?',
            bank: '?',
            rib: '?'
        },
        rents: []
    };
    if (month) {
        data.months = [Number(month)];
    }
    if (fromMonth) {
        data.months = Array.from(Array(13).keys()).slice(fromMonth); // [fromMonth,..,12]
    }

    const terms = data.months.map(month => Number(moment(`01/${month}/${year} 00:00`, 'DD/MM/YYYY HH:mm').format('YYYYMMDDHH')));
    occupants.forEach(currentOccupant => {
        currentOccupant.rents
        .filter(currentRent => terms.indexOf(currentRent.term) !== -1 )
        .reduce((acc, currentRent) => {
            const rent = JSON.parse(JSON.stringify(currentRent));
            const occupant = JSON.parse(JSON.stringify(currentOccupant));

            const beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
            const endMoment = moment(occupant.endDate, 'DD/MM/YYYY');
            const fyear = String(Number(year) - 2000);
            const fmonth = rent.month > 9 ? `${rent.month}` : `0${rent.month}`;

            // find first day of renting to display on invoice
            let beginRentMoment = moment(`01/${month}/${year}`, 'DD/MM/YYYY').startOf('day');
            if (beginMoment.month() === Number(month)-1 && beginMoment.year() === Number(year)) {
                beginRentMoment = moment(beginMoment).startOf('day');
            }
            // find last day of renting to display on invoice
            let endRentMoment = moment(beginRentMoment).endOf('month').endOf('day');
            if (endMoment.month() === Number(month)-1 && endMoment.year() === Number(year)) {
                endRentMoment = moment(endMoment).endOf('day');
            }

            occupant.properties = occupant.properties.map(property => {
                const entryMoment = moment(property.entryDate, 'DD/MM/YYYY').startOf('day');
                const exitMoment = moment(property.exitDate, 'DD/MM/YYYY').endOf('day');
                if (beginRentMoment.isBetween(entryMoment, exitMoment, 'day', '[]') &&
                    endRentMoment.isBetween(entryMoment, exitMoment, 'day', '[]')) {
                    property.visibleOnInvoice = true;
                }
                return property;
            });

            occupant.durationInMonth = Math.round(moment.duration(endMoment.diff(beginMoment)).asMonths());
            acc.push(Object.assign(
                toRentData(rent, occupant),
                {
                    callDate: moment(`20/${rent.month}/${year}`, 'DD/MM/YYYY').subtract(1, 'months').format('LL'),
                    invoiceDate: moment(`20/${rent.month}/${year}`, 'DD/MM/YYYY').format('LL'),
                    period: moment(`01/${rent.month}/${year}`, 'DD/MM/YYYY').format('MMMM YYYY'),
                    dueDate: moment(`05/${rent.month}/${year}`, 'DD/MM/YYYY').format('LL'),
                    reference: `${fmonth}_${fyear}_${occupant.reference}`,
                    month: fmonth,
                }
            ));
            return acc;
        }, data.rents);
    });
    return data;
}

function toOccupantData(inputOccupant) {
    const occupant = JSON.parse(JSON.stringify(inputOccupant));

    // set default values for occupant
    Object.assign(
        occupant,
        {
            street1: occupant.street1 || '',
            street2: occupant.street2 || '',
            zipCode: occupant.zipCode || '',
            city: occupant.city || '',
            legalForm: occupant.legalForm || '',
            siret: occupant.siret || '',
            contract: occupant.contract || '',
            reference: occupant.reference || '',
            guaranty: occupant.guaranty ? Number(occupant.guaranty) : 0,
            vatRatio: occupant.vatRatio ? Number(occupant.vatRatio) : 0,
            discount: occupant.discount ? Number(occupant.discount) : 0,
        }
    );

    // Compute if contract is completed
    occupant.terminated = false;
    const currentDate = moment();
    if (occupant.terminationDate) {
        if (moment(occupant.terminationDate, 'DD/MM/YYYY').isBefore(currentDate, 'month')) {
            occupant.terminated = true;
        }
    } else {
        if (moment(occupant.endDate, 'DD/MM/YYYY').isBefore(currentDate, 'month')) {
            occupant.terminated = true;
        }
    }

    occupant.office = {
        surface: 0,
        m2Price: 0,
        m2Expense: 0,
        price: 0,
        expense: 0
    };
    occupant.parking = {
        price: 0,
        expense: 0
    };
    occupant.properties.forEach((item) => {
        var property = item.property;
        if (property.type === 'parking') {
            occupant.parking.price += property.price;
            if (property.expense) {
                occupant.parking.expense += property.expense;
            }
        } else {
            occupant.office.surface += property.surface;
            occupant.office.price += property.price;
            if (property.expense) {
                occupant.office.expense += property.expense;
            }
        }
    });
    if (occupant.office) {
        occupant.office.m2Price = occupant.office.price / occupant.office.surface;
        occupant.office.m2Expense = occupant.office.expense / occupant.office.surface;
    }
    delete occupant.rents;
    return occupant;
}

function toAccountingData(year, inputOccupants) {
    const beginOfYear = moment(year, 'YYYY').startOf('year');
    const endOfYear = moment(beginOfYear).endOf('year');
    const termsOfYear = Array.from(Array(13).keys()).slice(1).map(month => {
        //         2017000000           +         120000          + 100
        //       = 2017120100  // YYYYMMDDHH
        return (Number(year) * 1000000) + (Number(month) * 10000) + 100;
    });

    const occupants = JSON.parse(JSON.stringify(inputOccupants))
    .filter(occupant => {
        const beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
        const endMoment = moment(occupant.terminationDate ? occupant.terminationDate : occupant.endDate, 'DD/MM/YYYY');
        return beginMoment.isBetween(beginOfYear, endOfYear, 'day', '[]') ||
               endMoment.isBetween(beginOfYear, endOfYear, 'day', '[]')   ||
               (beginMoment.isSameOrBefore(beginOfYear) && endMoment.isSameOrAfter(endOfYear));
    });


    return {
        payments: {
            occupants: occupants.map((occupant) => {
                return {
                    year,
                    occupantId: occupant._id,
                    name: occupant.name,
                    reference: occupant.reference,
                    properties: occupant.properties.map((p) => { return {name: p.property.name, type: p.property.type};}),
                    beginDate: occupant.beginDate,
                    endDate: occupant.terminationDate?occupant.terminationDate:occupant.endDate,
                    deposit: occupant.guaranty,
                    rents: termsOfYear.map(term => {
                        let currentRent = occupant.rents.find(rent => rent.term === term);
                        if (currentRent) {
                            currentRent = toRentData(currentRent);
                            currentRent.occupantId = occupant._id;
                        }
                        return currentRent || {inactive: true};
                    })
                };
            })
        },
        entriesExists: {
            entries: {
                occupants: occupants
                .filter(occupant => {
                    const beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
                    return beginMoment.isBetween(beginOfYear, endOfYear, 'day', '[]');
                })
                .map(occupant => {
                    return {
                        name: occupant.name,
                        reference: occupant.reference,
                        properties: occupant.properties.map((p) => { return {name: p.property.name, type: p.property.type};}),
                        beginDate: occupant.beginDate,
                        deposit: occupant.guaranty
                    };
                })
            },
            exits: {
                occupants: occupants
                .filter((occupant) => {
                    const endMoment = moment(occupant.terminationDate || occupant.endDate, 'DD/MM/YYYY');
                    return endMoment.isBetween(beginOfYear, endOfYear, 'day', '[]');
                })
                .map((occupant) => {
                    const totalAmount = occupant.rents
                    .filter(rent => {
                        return rent.term >= Number(beginOfYear.format('YYYYMMDDHH')) &&
                               rent.term <= Number(endOfYear.format('YYYYMMDDHH'));
                    })
                    .reduce((acc, rent) => {
                        let balance = rent.total.grandTotal - rent.total.payment;
                        return balance!==0?balance*-1:balance;
                    }, 0);

                    return {
                        name: occupant.name,
                        reference: occupant.reference,
                        properties: occupant.properties.map((p) => { return {name: p.property.name, type: p.property.type};}),
                        leaseBroken: occupant.terminationDate && occupant.terminationDate!==occupant.endDate,
                        endDate: occupant.terminationDate?occupant.terminationDate:occupant.endDate,
                        deposit: occupant.guaranty,
                        depositRefund: occupant.guarantyPayback,
                        totalAmount: totalAmount,
                        toPay: Number(occupant.guarantyPayback?0:occupant.guaranty) + Number(totalAmount)
                    };
                })
            }
        }
    };
}

function toProperty(inputProperty, inputOccupant) {
    const property = {
        _id: inputProperty._id,
        name: inputProperty.name,
        type: inputProperty.type,
        location: inputProperty.location,
        phone: inputProperty.phone,
        price: inputProperty.price,
        surface: inputProperty.surface,
        expense: inputProperty.expense || 0,
        priceWithExpenses: math.round(inputProperty.price + inputProperty.expense, 2),
        m2Expense: inputProperty.surface ? math.round((inputProperty.expense / inputProperty.surface), 2) : null,
        m2Price: inputProperty.surface ? math.round((inputProperty.price / inputProperty.surface), 2) : null,
        beginDate: '',
        endDate: '',
        lastBusyDay: '',
        occupantLabel: '',
        available: true
    };
    if (inputOccupant) {
        Object.assign(
            property,
            {
                beginDate: inputOccupant.entryDate,
                endDate:  inputOccupant.exitDate,
                lastBusyDay: inputOccupant.terminationDate || inputOccupant.endDate,
                occupantLabel: inputOccupant.name
            }
        );
        if (property.lastBusyDay) {
            property.available = moment(property.lastBusyDay, 'DD/MM/YYYY').isBefore(moment(), 'month');
        }
    }

    return property;
}

export default {
    toOccupantData,
    toProperty,
    toRentData,
    toPrintData,
    toAccountingData
};
