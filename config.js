var logger = require('winston'),
    configdir = process.env.SELFHOSTED_CONFIG_DIR || __dirname,
    //config = require(configdir + '/config.json');
    config = JSON.parse(require('fs').readFileSync(configdir + '/config.json', 'utf8'));

config.productive = process.env.SELFHOSTED_PRODUCTIVE === 'true' || process.env.SELFHOSTED_PRODUCTIVE === 'TRUE' || process.env.SELFHOSTED_PRODUCTIVE === true;

config.demomode = process.env.SELFHOSTED_DEMOMODE === 'true' || process.env.SELFHOSTED_DEMOMODE === 'TRUE' || process.env.SELFHOSTED_DEMOMODE === true;

if (config.demomode) {
    config.database = 'demodb';
}
else {
    config.database = process.env.SELFHOSTED_DBNAME || 'demodb';
}

logger.debug('Loaded configuration from', configdir + '/config');
logger.silly('Configuration content:', config);

module.exports = config;
