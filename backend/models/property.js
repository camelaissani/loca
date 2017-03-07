'use strict';
import OF from './objectfilter';
import Model from './model';

class PropertyModel extends Model {
    constructor() {
        super('properties');
        this.schema = new OF({
            _id: String,
            type: String,
            name: String,
            description: String,
            surface: Number,
            phone: String,
            building: String,
            level: String,
            location: String,
            price: Number,
            expense: Number
        });
    }
}

export default new PropertyModel();
