'use strict';

// Express web app requirements
var express = require('express'),
    favicon = require('serve-favicon'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cookieSession = require('cookie-session'),
    errorHandler = require('errorhandler'),
    router = express.Router(),
    app = express(),
    logger = require('winston'),
    expressWinston = require('express-winston');

// App requirements
var path = require('path'),
    moment = require('moment'),
    db = require('./server/models/db'),
    apiRoutes = require('./server/api'),
    pageRoutes = require('./server/pages');

// Server constants
var http_port = process.env.SELFHOSTED_NODEJS_PORT || 8081,
    basedir = __dirname;

// Reconfigure default logger
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    colorize: true
});

// Init locale
moment.locale('fr');

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
// Icon / static files
app.use(favicon(path.join(basedir, '/public/images/favicon.png'), {
    maxAge: 2592000000
}));
app.use('/bower_components', express.static(path.join(basedir, '/bower_components')));
app.use('/public', express.static(path.join(basedir, '/public')));
app.use('/public/image', express.static(path.join(basedir, '/public/images')));
app.use('/public/images', express.static(path.join(basedir, '/public/images')));
app.use('/public/fonts', express.static(path.join(basedir, '/bower_components/bootstrap/fonts')));
app.use('/public/pdf', express.static(path.join(basedir, '/public/pdf')));
app.use('/robots.txt', express.static(path.join(basedir, '/public/robots.txt')));
app.use('/sitemap.xml', express.static(path.join(basedir, '/public/sitemap.xml')));

app.set('views', basedir + '/server/views');
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

app.use(expressWinston.errorLogger({
    transports: [
        new logger.transports.Console({
            json: false,
            colorize: true
        })
    ]
}));

// Init connection to database
db.init();

if (process.env.NODE_ENV === 'production') {
    logger.info('In production mode');
} else {
    // Create new middleware to handle errors and respond with content negotiation.
    // This middleware is only intended to be used in a development environment,
    // as the full error stack traces will be sent back to the client when an error occurs.
    app.use(errorHandler());
    logger.info('In development mode');
}

// Start web app
app.listen(http_port, function() {
    logger.info('Listening port ' + http_port);
});