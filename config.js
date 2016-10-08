var logger = require('winston'),
    configdir = process.env.LOCA_CONFIG_DIR || __dirname,
    config = JSON.parse(require('fs').readFileSync(configdir + '/config.json', 'utf8'));

config.productive = process.env.NODE_ENV === 'production';

config.subscription = process.env.LOCA_PRODUCTIVE === 'true'
                      || process.env.LOCA_PRODUCTIVE === 'TRUE'
                      || process.env.LOCA_PRODUCTIVE === true;

config.demomode = process.env.LOCA_DEMOMODE === 'true'
                  || process.env.LOCA_DEMOMODE === 'TRUE'
                  || process.env.LOCA_DEMOMODE === true;

config.database = process.env.LOCA_DBNAME || 'demodb';
if (config.demomode) {
    config.database = 'demodb';
}

logger.debug('Loaded configuration from', configdir + '/config');
logger.silly('Configuration content:', config);

module.exports = config;
