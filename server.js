'use strict';

// Express web app requirements
var i18next = require('i18next'),
    i18nMiddleware = require('i18next-express-middleware'),
    i18nFS = require('i18next-node-fs-backend'),
    i18nSprintf = require('i18next-sprintf-postprocessor'),
    express = require('express'),
    favicon = require('serve-favicon'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cookieSession = require('cookie-session'),
    errorHandler = require('errorhandler'),
    router = express.Router(),
    app = express(),
    logger = require('winston'),
    expressWinston = require('express-winston'),
    config = require('./config');

// App requirements
var path = require('path'),
    moment = require('moment'),
    db = require('./server/models/db'),
    apiRoutes = require('./server/api'),
    pageRoutes = require('./server/pages');

// Server constants
var http_port = process.env.LOCA_NODEJS_PORT || 8081,
    debugMode = process.env.NODE_ENV !== 'production';

// Reconfigure default logger
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    level: debugMode ? 'debug' : 'info',
    colorize: true
});

// Init locale
i18next.use(i18nMiddleware.LanguageDetector)
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
            loadPath: path.join(__dirname, '/public/locales/{{lng}}.json')
        }
    });

// Init express
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
app.use(i18nMiddleware.handle(i18next));
app.use(function(req, res, next) {
    var splitedLanguage = req.language.split('-');
    moment.locale(splitedLanguage[0]);
    next();
});
// Icon / static files
app.use(favicon(path.join(__dirname, '/public/images/favicon.png'), {
    maxAge: 2592000000
}));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
//app.use('/locales', express.static(path.join(__dirname, '/public/locales')));
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/public/image', express.static(path.join(__dirname, '/public/images')));
app.use('/public/images', express.static(path.join(__dirname, '/public/images')));
app.use('/public/fonts', express.static(path.join(__dirname, '/node_modules/bootstrap/fonts')));
app.use('/public/pdf', express.static(path.join(__dirname, '/public/pdf')));
app.use('/robots.txt', express.static(path.join(__dirname, '/public/robots.txt')));
app.use('/sitemap.xml', express.static(path.join(__dirname, '/public/sitemap.xml')));

app.set('views', __dirname + '/server/views');
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

//Init routes
app.use(router);
apiRoutes(router);
pageRoutes(router);
//app.get('/locales/resources.json', i18nMiddleware.getResourcesHandler(i18n)); // serves resources for consumers (browser)

app.use(expressWinston.errorLogger({
    transports: [
        new logger.transports.Console({
            json: false,
            colorize: true
        })
    ]
}));

if (!debugMode) {
    logger.info('In production mode');
} else {
    // Create new middleware to handle errors and respond with content negotiation.
    // This middleware is only intended to be used in a development environment,
    // as the full error stack traces will be sent back to the client when an error occurs.
    app.use(errorHandler());
    logger.info('In development mode');
}

if (config.demomode) {
    logger.info('In demo mode (no login)');
}

// Init connection to database
db.init();

// Start web app
app.listen(http_port, function() {
    logger.info('Listening port ' + http_port);
});
