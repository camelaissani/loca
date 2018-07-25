const fs = require('fs');
const path = require('path');
const logger = require('winston');

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
        }, require(`./${page}`)());

        if (pageDesc.public && pageDesc.restricted) {
            publicRestrictedList.push(pageDesc);
        } else if (pageDesc.public) {
            publicList.push(pageDesc);
        } else {
            restrictedList.push(pageDesc);
        }
        logger.debug(`loaded page ${page}`);
    });

module.exports = {
    list: [
        ...publicList,
        ...restrictedList,
        ...publicRestrictedList
    ],
    publicList,
    restrictedList,
    publicRestrictedList
};
