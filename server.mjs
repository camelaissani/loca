'use strict';

const debugMode = process.env.NODE_ENV !== 'production';

import logger from 'winston';
// configure default logger
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    level: process.env.LOCA_LOGGER_LEVEL || process.env.LOGGER_LEVEL || 'debug',
    colorize: true
});

import i18next from 'i18next';
import i18nMiddleware,{LanguageDetector} from 'i18next-express-middleware';
import i18nFS from 'i18next-node-fs-backend';
import i18nSprintf from 'i18next-sprintf-postprocessor';
import express from 'express';
import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import errorHandler from 'errorhandler';
import passport from 'passport';
import expressWinston from 'express-winston';
import path from 'path';
import moment from 'moment';
import config from './config';
import routes from './backend/routes';
import db from './backend/models/db';


const dist_directory = path.join(__dirname, 'dist');

// Init locale
i18next.use(LanguageDetector)
    .use(i18nFS)
    .use(i18nSprintf)
    .init({
        debug: false,
        fallbackLng: 'en',
        pluralSeparator: '_',
        keySeparator: '::',
        nsSeparator: ':::',
        detection: {
            order: [ /*'path', 'session', 'querystring',*/ 'cookie', 'header'],
            lookupCookie: 'locaI18next',
            cookieDomain: 'loca',
            caches: ['cookie']
        },
        backend: {
            loadPath: path.join(dist_directory, 'locales', '{{lng}}.json')
        }
    });

// Init express
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(cookieSession({
    secret: 'loca-secret',
    cookie: {
        maxAge: 3600000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(i18nMiddleware.handle(i18next));
app.use(function(req, res, next) {
    var splitedLanguage = req.language.split('-');
    moment.locale(splitedLanguage[0]);
    next();
});
// Icon / static files
app.use(favicon(path.join(dist_directory, 'images', 'favicon.png'), {
    maxAge: 2592000000
}));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
app.use('/public', express.static(dist_directory));
app.use('/public/image', express.static(path.join(dist_directory, 'images')));
app.use('/public/images', express.static(path.join(dist_directory, 'images')));
app.use('/public/fonts', express.static(path.join(__dirname, '/node_modules/bootstrap/fonts')));
app.use('/public/pdf', express.static(path.join(dist_directory, 'pdf')));
app.use('/robots.txt', express.static(path.join(dist_directory, 'robots.txt')));
app.use('/sitemap.xml', express.static(path.join(dist_directory, 'sitemap.xml')));

app.set('views', path.join(__dirname, 'backend', 'pages'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Express log through out winston
app.use(expressWinston.logger({
    transports: [
        new logger.transports.Console({
            json: false,
            colorize: true
        })
    ],
    meta: false, // optional: control whether you want to log the meta data about the request (default to true)
    msg: String, //'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
    colorStatus: true // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
    //ignoreRoute: function( /*req, res*/ ) {
    //    return false;
    //} // optional: allows to skip some log messages based on request and/or response
}));
app.use(expressWinston.errorLogger({
    transports: [
        new logger.transports.Console({
            json: false,
            colorize: true
        })
    ]
}));

// Init routes
routes.forEach(route => {
    app.use(route());
});

// Start web app
if (debugMode) {
    // Create new middleware to handle errors and respond with content negotiation.
    // This middleware is only intended to be used in a development environment,
    // as the full error stack traces will be sent back to the client when an error occurs.
    app.use(errorHandler());
}

db.init();

if (config.demomode) {
    require('./scripts/mongorestore.mjs');
}

const http_port = process.env.LOCA_NODEJS_PORT || process.env.PORT || 8081;
app.listen(http_port, function() {
    logger.info('Listening port ' + http_port);
    if (!debugMode) {
        logger.info('In production mode');
    } else {
        logger.info('In development mode (no minify/no uglify)');
    }
    if (config.demomode) {
        logger.info('In demo mode (login disabled)');
    }
    const configdir = process.env.LOCA_CONFIG_DIR || process.env.CONFIG_DIR || path.join(__dirname, 'config');
    logger.debug('loaded configuration from', configdir);
    logger.debug(JSON.stringify(config, null,'\t'));
    if (debugMode) {
        const LiveReloadServer = require('live-reload');
        LiveReloadServer({
           _: ['dist'],
            port: 9091
        });
    }
});
