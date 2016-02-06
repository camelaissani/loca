'use strict';

require('sugar');

function ObjectFilter(schema) {
    this.schema = schema;
}

ObjectFilter.prototype.filter = function(data) {
    var self = this;
    var filteredData = {};

    Object.keys(self.schema, function(key, type) {
        var value = data[key];
        var number;
        if (typeof value != 'undefined') {
            if (type === Boolean) {
                if (typeof value == 'string' && (value === 'true' || value === 'false')) {
                    filteredData[key] = (value === 'true');
                } else if (typeof value == 'boolean') {
                    filteredData[key] = value;
                }
            } else if (type === Number) {
                number = value;
                if (typeof value == 'string') {
                    number = Number(value.replace(',', '.'));
                }
                if (!isNaN(number)) {
                    filteredData[key] = number;
                } else {
                    filteredData[key] = 0;
                }
            } else if (type === Array) {
                if (Array.isArray(value)) {
                    filteredData[key] = value;
                }
            } else if (type === Object) {
                if (typeof value == 'object') {
                    filteredData[key] = value;
                }
            } else if (type === String) {
                if (key === '_id' && typeof value == 'object') {
                    filteredData[key] = value.toString();
                } else if (typeof value == 'string') {
                    filteredData[key] = value;
                }
            } else {
                throw new Error('Cannot valid schema type unsupported ' + type);
            }
        }
    });

    return filteredData;
};

module.exports = ObjectFilter;