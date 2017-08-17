import fs from 'fs';
import path from 'path';
import logger from 'winston';

const restrictedList = []; // list of  {id, params}
const publicList = []; // list of  {id, params}
const publicRestrictedList = []; // list of  {id, params}

const root_pages_dir = path.join(__dirname);

fs.readdirSync(root_pages_dir)
.filter(page => fs.lstatSync(path.join(root_pages_dir, page)).isDirectory())
.forEach(page => {
    const pageDesc = Object.assign({
        public: false,
        restricted: false,
        supportView: true
    }, require(`./${page}`).default());

    if (pageDesc.public && pageDesc.restricted) {
        publicRestrictedList.push(pageDesc);
    } else if (pageDesc.public) {
        publicList.push(pageDesc);
    } else {
        restrictedList.push(pageDesc);
    }
    logger.debug(`loaded page ${page}`);
});

const list = [
    ...publicList,
    ...restrictedList,
    ...publicRestrictedList
];

export default {
    list,
    publicList,
    restrictedList,
    publicRestrictedList
};