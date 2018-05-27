'use strict';
const OF = require('./objectfilter');

class DocumentModel {
    constructor() {
        this.schema = new OF({
            _id: String,
            documents: Array
        });
    }
}

module.exports = new DocumentModel();
