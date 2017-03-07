import moment from 'moment';
import occupantManager from './occupantmanager.js';

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function all(req, res) {
    const year = req.params.year;
    const beginOfYear = moment('01/01/'+year, 'DD/MM/YYYY').startOf('day');
    const endOfYear = moment('31/12/'+year, 'DD/MM/YYYY').endOf('day');

    occupantManager.findAllOccupants(req.realm, (errors, occupants) => {
        const occupantsOfYear = occupants.filter((occupant) => {
            const beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
            const endMoment = moment(occupant.terminationDate ? occupant.terminationDate : occupant.endDate, 'DD/MM/YYYY');
            return beginMoment.isBetween(beginOfYear, endOfYear, '[]') ||
                   endMoment.isBetween(beginOfYear, endOfYear, '[]')   ||
                   (beginMoment.isSameOrBefore(beginOfYear) && endMoment.isSameOrAfter(endOfYear));
        }) || [];
        res.json({
            payments: {
                occupants: occupantsOfYear.map((occupant) => {
                    return {
                        year,
                        occupantId: occupant._id,
                        name: occupant.name,
                        reference: occupant.reference,
                        properties: occupant.properties.map((p) => { return {name: p.property.name, type: p.property.type};}),
                        beginDate: occupant.beginDate,
                        endDate: occupant.terminationDate?occupant.terminationDate:occupant.endDate,
                        deposit: occupant.guaranty,
                        rents: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((month) => {
                            const currentRent = occupant.rents[year][month];
                            if (currentRent) {
                                currentRent.occupantId = occupant._id;
                            }
                            return currentRent || {inactive: true};
                        })

                    };
                })
            },
            entriesExists: {
                entries: {
                    occupants: occupantsOfYear.filter((occupant) => {
                        const beginMoment = moment(occupant.beginDate, 'DD/MM/YYYY');
                        return beginMoment.isBetween(beginOfYear, endOfYear, '[]');
                    }).map((occupant) => {
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
                    occupants: occupantsOfYear.filter((occupant) => {
                        const endMoment = moment(occupant.terminationDate ? occupant.terminationDate : occupant.endDate, 'DD/MM/YYYY');
                        return endMoment.isBetween(beginOfYear, endOfYear, '[]');
                    }).map((occupant) => {
                        const totalAmount = Object.keys(occupant.rents[year]).reduce((prev, cur) => {
                            const rent = occupant.rents[year][cur];
                            let balance = rent.totalAmount - (rent.payment ? rent.payment : 0);
                            return balance!==0?balance*-1:balance;
                        });

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
        });
    });
}

export default {
    all
};
