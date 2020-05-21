const path = require('path');

const toBoolean = (value) => {
    if (value && typeof (value) !== 'boolean') {
        value = value.toLowerCase() === 'true';
    }
    return value;
};

const loggerLevel = process.env.LOCA_LOGGER_LEVEL || process.env.LOGGER_LEVEL || 'debug';
const nginxPort = process.env.NGINX_PORT || 8080;
const appHttpPort = process.env.LOCA_NODEJS_PORT || process.env.PORT || 8080;
const configDir = process.env.LOCA_CONFIG_DIR || process.env.CONFIG_DIR || path.join(__dirname, '..', 'config');
const demoMode = toBoolean(process.env.LOCA_DEMOMODE || process.env.DEMO_MODE || true);
const restoreDatabase = toBoolean(process.env.RESTORE_DB || true);
const subscription = toBoolean(process.env.LOCA_PRODUCTIVE || process.env.PRODUCTIVE || false);

const website = require(path.join(configDir, 'website.json'));

module.exports = {
    ...website,
    loggerLevel,
    nginxPort,
    appHttpPort,
    configDir,
    businesslogic: 'FR',
    productive: process.env.NODE_ENV === 'production',
    subscription,
    restoreDatabase,
    demoMode,
    database: process.env.MONGO_URL || process.env.LOCA_DBNAME || process.env.BASE_DB_URL || 'mongodb://localhost/demodb',
    EMAILER_URL: process.env.EMAILER_URL || 'http://localhost:8083/emailer',
};
