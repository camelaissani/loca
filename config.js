var logger = require('winston'),
    configdir = process.env.LOCA_CONFIG_DIR || __dirname,
    config = JSON.parse(require('fs').readFileSync(configdir + '/config.json', 'utf8'));

config.productive = process.env.NODE_ENV === 'production';

config.subscription = process.env.LOCA_PRODUCTIVE !== undefined && process.env.LOCA_PRODUCTIVE.toLowerCase() === 'true';

config.demomode = !(process.env.LOCA_DEMOMODE !== undefined && process.env.LOCA_DEMOMODE.toLowerCase() === 'false');

config.database = process.env.LOCA_DBNAME || 'demodb';

logger.debug('loaded configuration from', configdir + '/config');
logger.silly('configuration content:', config);

module.exports = config;
