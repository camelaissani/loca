'use strict';

var Model = require('./model'),
    OF = require('./objectfilter');

function PropertyModel() {
    Model.call(this, 'properties');
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

PropertyModel.prototype = Object.create(Model.prototype);
PropertyModel.constructor = PropertyModel;

module.exports = new PropertyModel();