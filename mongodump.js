var configdir = process.env.LOCA_CONFIG_DIR || __dirname,
    config = require(configdir + '/config'),
    mongobackup = require('mongobackup');

mongobackup.dump({
    db: config.database,
    out: './bkp/'
});