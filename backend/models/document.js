'use strict';
import OF from './objectfilter';

class DocumentModel {
    constructor() {
        this.schema = new OF({
            _id: String,
            documents: Array
        });
    }
}

export default new DocumentModel();
