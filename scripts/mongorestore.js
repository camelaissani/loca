const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const mongobackup = require('mongobackup');
const config = require('../config');

const db_url = new URL(config.database);
const db_name = db_url.pathname.slice(1);

const bkpDirectory = path.join(__dirname, '..', 'bkp');
const bkpFile = path.join(bkpDirectory, `${db_name}.dump`);

if (fs.existsSync(bkpFile)) {
    mongobackup.restore({
        host : db_url.hostname,
        drop: true,
        gzip: true,
        archive: bkpFile
    });
} else {
    mongobackup.restore({
        db : db_name,
        host : db_url.hostname,
        drop: true,
        path: path.join(bkpDirectory, db_name)
    });
}
