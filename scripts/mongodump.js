const path = require('path');
const mongobackup = require('mongobackup');
const config = require('../config');

mongobackup.dump({
    db: config.database,
    out: path.join(__dirname, '..', 'bkp')
});
