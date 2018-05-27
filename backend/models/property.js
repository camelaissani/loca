'use strict';
const OF = require('./objectfilter');
const Model = require('./model');

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

module.exports = new PropertyModel();
