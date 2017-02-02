import path from 'path';
import mongobackup from 'mongobackup';
import config from '../config';

mongobackup.dump({
    db: config.database,
    out: path.join(__dirname, '..', 'bkp')
});
