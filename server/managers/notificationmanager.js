'use strict';

var moment = require('moment'),
    crypto = require('crypto'),
    db = require('../modules/db'),
    OF = require('../modules/objectfilter');

var collection = 'notifications';
var updateSchema = new OF({
    _id: String,
    status: String
});

require('sugar');

module.exports.generateId = function (name) {
    return crypto.createHash('md5').update(name).digest('hex');
};

module.exports._buildViewData = function (currentDate, notifications) {
    var currentMoment = moment(currentDate).endOf('day');
    notifications.forEach(function (notification) {
        var expirationMoment;
        if (!notification.expirationDate) {
            notification.expired = true;
        } else {
            expirationMoment= moment(notification.expirationDate).endOf('day');
            notification.expired = currentMoment.isAfter(expirationMoment);
        }
    });

    return notifications;
};

module.exports.findAll = function (req, res) {
    var realm = req.session.user.realm,
        notifications = [],
        feederLoop;

    feederLoop = function (index, endLoopCallback) {
        var feederFct;
        if (index < module.exports.feeders.length) {
            feederFct = module.exports.feeders[index];
            feederFct(realm, function (foundNotifications) {
                foundNotifications.forEach(function (notification) {
                    notifications.push(notification);
                });
                index++;
                feederLoop(index, endLoopCallback);
            });
        } else {
            endLoopCallback();
        }
    };

    feederLoop(0, function () {
        db.list(realm, collection, function (errors, dbNotifications) {
            if (errors && errors.length > 0) {
                res.json({errors: errors});
                return;
            }
            if (dbNotifications && dbNotifications.length > 0 && notifications && notifications.length > 0) {
                dbNotifications.forEach(function (dbNotification) {
                    notifications.forEach(function (notification) {
                        if (dbNotification._id === notification._id) {
                            notification.changes = dbNotification.changes;
                        }
                    });
                });
            }
            res.json(module.exports._buildViewData(new Date(), notifications));
        });
    });
};

module.exports.update = function (req, res) {
    var date = new Date(),
        user = req.session.user,
        realm = user.realm,
        notification = updateSchema.filter(req.body);

    db.findItemById(realm, collection, notification._id, function (errors, notifications) {
        var dbNotification;
        if (errors && errors.length > 0) {
            res.json({errors: errors});
            return;
        }

        if (notifications.length > 0) {
            dbNotification = notifications[0];
            delete dbNotification._id;
        }
        else {
            dbNotification = {};
        }

        if (!dbNotification.changes) {
            dbNotification.changes = [];
        }
        dbNotification.changes.push({date: date, email: user.email, status: notification.status});

        db.upsert(realm, collection, {_id : notification._id}, dbNotification, null, function (errors) {
            if (errors && errors.length > 0) {
                res.json({errors: errors});
                return;
            }

            res.json(module.exports._buildViewData(date, Object.merge(dbNotification, {_id: notification._id})));
        });
    });
};

module.exports.feeders = [
    function expiredDocuments(realm, callback) {
        var notifications = [];
        db.listWithFilter(realm, 'occupants', {$orderby: {name: 1}}, function (errors, occupants) {
            if ((errors && errors.length > 0) || occupants.length === 0) {
                callback(notifications);
                return;
            }

            occupants.forEach(function (occupant) {
                if (occupant.documents && occupant.documents.length>0) {
                    occupant.documents.forEach(function (document) {
                        notifications.push({
                            type: 'expiredDocument',
                            notificationId: module.exports.generateId(occupant._id.toString() + '_document_' + moment(document.expirationDate).format('DD/MM/YYYY') + document.name),
                            expirationDate: document.expirationDate,
                            title: occupant.name,
                            description: document.name + ' a expiré le ' + moment(document.expirationDate).format('DD/MM/YYYY'),
                            actionUrl: ''
                        });
                    });
                } else if (!occupant.terminationDate && occupant.properties) {
                    occupant.properties.some(function (p) {
                        if (p.property.type !== 'letterbox' && p.property.type !== 'parking') {
                            notifications.push({
                                type: 'warning',
                                notificationId: module.exports.generateId(occupant._id.toString() + '_no_document'),
                                title: occupant.name,
                                description: 'Aucun document n\'est associé au contrat de bail. L\'assurance du bien loué est-elle manquante ?',
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
    function chequesToCollect(realm, callback) {
        callback([]);
    }
];