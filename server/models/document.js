'use strict';

var OF = require('./objectfilter');

module.exports.schema = new OF({
    _id: String,
    documents: Array
});