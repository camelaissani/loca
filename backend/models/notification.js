'use strict';
const OF = require('./objectfilter');
const Model = require('./model');

class NotificationModel extends Model {
    constructor() {
        super('notifications');
        this.schema = new OF({
            id: String,
            status: String
        });
    }
}

module.exports = new NotificationModel();
