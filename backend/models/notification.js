'use strict';

var Model = require('./model'),
    OF = require('./objectfilter');

function NotificationModel() {
    Model.call(this, 'notifications');
    this.schema = new OF({
        id: String,
        status: String
    });
}

NotificationModel.prototype = Object.create(Model.prototype);
NotificationModel.constructor = NotificationModel;

module.exports = new NotificationModel();