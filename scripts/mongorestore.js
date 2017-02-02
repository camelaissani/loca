import path from 'path';
import mongobackup from 'mongobackup';
import config from '../config';

mongobackup.restore({
    drop: true,
    path: path.join(__dirname, '..', 'bkp', config.database)
});
