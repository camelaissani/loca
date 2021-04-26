const path = require('path');
const sugar = require('sugar');

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
const signup = toBoolean(process.env.LOCA_PRODUCTIVE || process.env.SIGNUP || false);

const website = require(path.join(configDir, 'website.json'));

const config = {
    ...website,
    loggerLevel,
    nginxPort,
    appHttpPort,
    configDir,
    businesslogic: 'FR',
    productive: process.env.NODE_ENV === 'production',
    signup,
    restoreDatabase,
    demoMode,
    database: process.env.MONGO_URL || process.env.LOCA_DBNAME || process.env.BASE_DB_URL || 'mongodb://localhost/demodb',
    EMAILER_URL: process.env.EMAILER_URL || 'http://localhost:8083/emailer',
    PDFGENERATOR_URL: process.env.PDFGENERATOR_URL || 'http://localhost:8082/pdfgenerator',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'access_token_secret',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret',
    CIPHER_KEY: process.env.CIPHER_KEY || 'cipher_key_secret',
    CIPHER_IV_KEY: process.env.CIPHER_IV_KEY || 'cipher_iv_key_secret'
};

module.exports = {
    ...config,
    log: () => {
        const escapedConfig = sugar.Object.clone(config);
        escapedConfig.ACCESS_TOKEN_SECRET = '****';
        escapedConfig.REFRESH_TOKEN_SECRET = '****';
        escapedConfig.CIPHER_KEY = '****';
        escapedConfig.CIPHER_IV_KEY = '****';
        return JSON.stringify(escapedConfig, null, 1);
    }
};
