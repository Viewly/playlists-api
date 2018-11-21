const express = require('express'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  app = express(),
  cors = require('cors'),
  logger = require('morgan'),
  path = require('path'),
  http = require('http'),
  Raven = require('raven'),
  helpers = require('./utils/helpers');

require('dotenv').config();

const wwwUtils = require('./utils/www.js');
const mainController = require('./controllers/main');
const userController = require('./controllers/user');
const adminController = require('./controllers/admin');

console.log(process.env.NODE_ENV, "- ENV");
/**
 * Setup express app
 */
Raven.config(process.env.SENTRY_DSN).install();
const is_live = wwwUtils.shouldRun();
is_live && app.use(Raven.requestHandler());
//CORS
const whitelist = require('./cors_whitelist.json');
const a = require('./domain/reddit/index');
let corsOptions = {
  origin: whitelist
};

if (!is_live) corsOptions = null;
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, '../public')));
app.use('/app', express.static(path.join(__dirname, '../frontend')));

/**
 * Wire controllers
 */
app.use('/v1/api', mainController);
app.use('/v1/api/user', userController);
app.use('/', adminController);
//app.use(auth.verifyToken()); // Protected endpoints below


/**
 * Setup and start http server
 */
is_live && app.use(Raven.errorHandler());
const server = http.createServer(app).listen(process.env.PORT || 3000);
server.on('error', wwwUtils.onError);
server.on('listening', () => wwwUtils.onListening(server));
module.exports = app;
