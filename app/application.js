'use strict';

//dependencies

//set environment to development by default
if (!(process.env || {}).NODE_ENV) {
  process.env.NODE_ENV = 'development';
}


//suppress configuration warning
process.env.SUPPRESS_NO_CONFIG_WARNING = true;


const path = require('path');
require('config'); //load configurations
const environment = require('execution-environment');
const mkdir = require('mkdir-p');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressWinston = require('express-winston');
const cors = require('cors');
const helmet = require('helmet');
const respond = require('express-respond');


//register environment variables
environment.registerEnvironments({
  isLocal: ['test', 'dev', 'development']
});


//build logs directory if does not exists
const logPath = path.join(__dirname, '..', 'logs');
mkdir.sync(logPath);

//start initializers

//setup winston application logger
let winston = require('winston');
winston.add(require('winston-daily-rotate-file'), {
  filename: path.join(logPath, 'log.log')
});
winston.level = 'silly';

//setup application mongoose instance
require(path.join(__dirname, 'initializers', 'mongoose'));

//finish initializers


//create an express application
let app = express();


//setup public directories
app.use(express.static(path.join(__dirname, '..', 'public')));


//enable cors
app.use(cors());


//use express respond
app.use(respond());


//configure helmet
app.use(helmet.hidePoweredBy({
  setTo: 'open311 0.1.0'
}));


// aplication favicon
// un comment after adding application favicon in public directory
// var favicon = require('serve-favicon');
// app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));


//parsing body
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('_method'));


//setup mongoose express pagination middleware
app.use(require('express-mquery').middleware());


//setup application request logger
if (!environment.isLocal()) {
  app.use(expressWinston.logger({
    winstonInstance: winston
  }));
}


//bind settings loader middleware
app.use(require(path.join(__dirname, 'middlewares', 'settings')));


// load all routers recursively
require('require-all')({
  dirname: path.join(__dirname, 'routers'),
  filter: /(.+_router)\.js$/,
  excludeDirs: /^\.(git|svn|md)$/,
  resolve: function (router) {
    app.use(router);
  }
});


//setup application request error logger
if (!environment.isLocal()) {
  app.use(expressWinston.errorLogger({
    winstonInstance: winston
  }));
}


// catch 404 and forward to error handler
app.use(function (request, response, next) {
  let error = new Error('Not Found');
  error.status = 404;
  next(error);
});


// error handlers

/*jshint unused:false */
// development error handlers
if (environment.isLocal()) {
  app.use(function (error, request, response, next) {

    //log all errors
    winston.error(error);

    //respond
    response.status(error.status || 500);
    response.json({
      success: false,
      message: error.message,
      error: {
        status: error.code
      }
    });
  });
}


// production error handler
if (environment.isProd()) {
  app.use(function (error, request, response, next) {

    //log all errors
    winston.error(error);

    //respond
    response.status(error.status || 500);
    response.json({
      success: false,
      message: error.message,
      error: {
        status: error.code
      }
    });
  });
}
/*jshint unused:true */


//export express application
module.exports = app;
