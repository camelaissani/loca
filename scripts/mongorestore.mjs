import path from 'path';
import { URL } from 'url';
import mongobackup from 'mongobackup';
import config from '../config';

const db_url = new URL(config.database);
const db_name = db_url.pathname.slice(1);

mongobackup.restore({
    db : db_name,
    host : db_url.hostname,
    drop: true,
    path: path.join(__dirname, '..', 'bkp', db_name)
});
