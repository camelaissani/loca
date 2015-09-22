'use strict';

// Express web app requirements
var express = require('express'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cookieSession = require('cookie-session'),
    errorHandler = require('errorhandler'),
    router = express.Router(),
    app = express(),
    logger = require('winston');

// App requirements
var path = require('path'),
    moment = require('moment'),
    dbviamongoose = require('./server/modules/dbviamongoose'),
    db = require('./server/modules/db'),
    apiRoutes = require('./server/api'),
    pageRoutes = require('./server/pages');

// Server constants
var ipaddr = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP,
    http_port = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8081,
    basedir = process.env.OPENSHIFT_REPO_DIR || __dirname;

if (process.env.NODE_ENV !== 'production') {
    // Create new middleware to handle errors and respond with content negotiation.
    // This middleware is only intended to be used in a development environment,
    // as the full error stack traces will be sent back to the client when an error occurs.
    app.use(errorHandler());
    //logger.level = 'debug';
    logger.info('In development mode');
} else {
    logger.info('In production mode');
}

// Init locale
moment.locale('fr');

// Init connection to database
// TODO replace mongoose db management by home made one
dbviamongoose.init();
db.init();

// Init express
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cookieSession({ secret: 'loca-secret', cookie : { maxAge  : 3600000 } }));
app.use(methodOverride());

//Init routes
app.use(router);
apiRoutes(router);
pageRoutes(router);

// Icon / static files
app.use(favicon(path.join(basedir, '/public/images/favicon.png'), { maxAge: 2592000000 }));
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

// Start web app
app.listen(http_port, ipaddr, function () {
    logger.info('Listening port ' + http_port);
});