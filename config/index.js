const path = require('path');
const fs = require('fs');

const configdir = process.env.LOCA_CONFIG_DIR || process.env.CONFIG_DIR || path.join(__dirname, '..', 'config');
const website = JSON.parse(fs.readFileSync(path.join(configdir, 'website.json'), 'utf8'));

let demomode = process.env.LOCA_DEMOMODE || process.env.DEMO_MODE || true;
if (demomode && typeof(demomode) !== 'boolean') {
    demomode = demomode.toLowerCase() === 'true';
}

let subscription = process.env.LOCA_PRODUCTIVE || process.env.PRODUCTIVE || false;
if (subscription && typeof(subscription) !== 'boolean') {
    subscription = subscription.toLowerCase() === 'true';
}

module.exports = Object.assign(website, {
    businesslogic: 'FR',
    productive: process.env.NODE_ENV === 'production',
    subscription,
    demomode,
    database: process.env.LOCA_DBNAME || process.env.BASE_DB_URL || 'mongodb://localhost/demodb',
    EMAILER_URL: process.env.EMAILER_URL ||'http://localhost:8083/emailer',
});
