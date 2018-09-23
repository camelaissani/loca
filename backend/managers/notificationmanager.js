'use strict';

const moment = require('moment');
const crypto = require('crypto');
const sugar = require('sugar');
const occupantModel = require('../models/occupant');
const notificationModel = require('../models/notification');

// TODO remove this lib
sugar.extend();

function _buildViewData(currentDate, notifications) {
    notifications.forEach((notification) => {
        if (!notification.expirationDate) {
            notification.expired = true;
        } else {
            const currentMoment = moment(currentDate).endOf('day');
            const expirationMoment = moment(notification.expirationDate).endOf('day');
            notification.expired = currentMoment.isAfter(expirationMoment);
        }
    });

    return notifications;
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
function generateId(name) {
    return crypto.createHash('md5').update(name).digest('hex');
}

const feeders = [

    //function expiredDocuments(t, realm, callback) {
    (t, realm, callback) => {
        const notifications = [];
        occupantModel.findFilter(realm, {
            $orderby: {
                name: 1
            }
        }, (errors, occupants) => {
            if (errors || (occupants && occupants.length === 0)) {
                callback(notifications);
                return;
            }

            occupants.forEach((occupant) => {
                if (occupant.documents && occupant.documents.length > 0) {
                    occupant.documents.forEach((document) => {
                        notifications.push({
                            type: 'expiredDocument',
                            notificationId: generateId(occupant._id.toString() + '_document_' + moment(document.expirationDate).format('DD-MM-YYYY') + document.name),
                            expirationDate: document.expirationDate,
                            title: occupant.name,
                            description: t('has expired', {document: document.name, date: moment(document.expirationDate).format('L'), interpolation: {escape: false}}),
                            actionUrl: ''
                        });
                    });
                } else if (!occupant.terminationDate && occupant.properties) {
                    occupant.properties.some((p) => {
                        if (p.property.type !== 'letterbox' && p.property.type !== 'parking') {
                            notifications.push({
                                type: 'warning',
                                notificationId: generateId(occupant._id.toString() + '_no_document'),
                                title: occupant.name,
                                description:  t('There are no documents attached to the lease contract. Is the insurance certficate is missing?'),
                                actionUrl: ''
                            });
                            return true;
                        }
                        return false;
                    });
                }
            });
            callback(notifications);

        });
    },
    //function chequesToCollect(t, realm, callback) {
    (t, realm, callback) => {
        callback([]);
    }
];

function all(req, res) {
    const realm = req.realm;
    const notifications = [];

    function feederLoop(index, endLoopCallback) {
        if (index < feeders.length) {
            const feederFct = feeders[index];
            feederFct(req.t, realm, (foundNotifications) => {
                foundNotifications.forEach((notification) => {
                    notifications.push(notification);
                });
                index++;
                feederLoop(index, endLoopCallback);
            });
        } else {
            endLoopCallback();
        }
    }

    feederLoop(0, () => {
        notificationModel.findAll(realm, (errors, dbNotifications) => {
            if (errors) {
                res.json({
                    errors: errors
                });
                return;
            }
            if (dbNotifications && dbNotifications.length > 0 && notifications && notifications.length > 0) {
                dbNotifications.forEach((dbNotification) => {
                    notifications.forEach((notification) => {
                        if (dbNotification._id === notification._id) {
                            notification.changes = dbNotification.changes;
                        }
                    });
                });
            }
            res.json(_buildViewData(new Date(), notifications));
        });
    });
}

function update(req, res) {
    const date = new Date();
    const user = req.user;
    const realm = user.realm;
    const notification = notificationModel.schema.filter(req.body);

    notification.findOne(realm, notification._id, (errors, dbNotification) => {
        if (errors) {
            res.json({
                errors: errors
            });
            return;
        }

        if (dbNotification) {
            delete dbNotification._id;
        } else {
            dbNotification = {};
        }

        if (!dbNotification.changes) {
            dbNotification.changes = [];
        }
        dbNotification.changes.push({
            date: date,
            email: user.email,
            status: notification.status
        });

        notificationModel.upsert(realm, {
            _id: notification._id
        }, dbNotification, null, (errors) => {
            if (errors) {
                res.json({
                    errors: errors
                });
                return;
            }

            res.json(_buildViewData(date, Object.merge(dbNotification, {
                _id: notification._id
            })));
        });
    });
}

module.exports = {
    update,
    all,
    generateId,
    feeders,
};
