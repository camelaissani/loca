'use strict';
import OF from './objectfilter';
import Model from './model';

class NotificationModel extends Model {
    constructor() {
        super('notifications');
        this.schema = new OF({
            id: String,
            status: String
        });
    }
}

export default new NotificationModel();
