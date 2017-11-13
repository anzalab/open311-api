'use strict';

/**
 * @name worker
 * @description job worker process for open311 API
 *
 * Alert!: Please ensure your have installed Redis Server
 * 
 * Alert!: Run worker in the separate process from main process
 *
 * Recommendation!: It also adviced to run each worker per process or per machine
 * with any number of concurrency(10 is sufficient max worker so far) 
 */


//set environment to development by default
if (!(process.env || {}).NODE_ENV) {
  process.env.NODE_ENV = 'development';
}


//suppress configuration warning
process.env.SUPPRESS_NO_CONFIG_WARNING = true;


//dependencies
const path = require('path');
const config = require('config'); //load configurations
const environment = require('execution-environment');
const mkdir = require('mkdir-p');
const kue = require('kue');


//register environment variables
environment.registerEnvironments({
  isLocal: ['test', 'dev', 'development']
});


//build logs directory if does not exists
mkdir.sync(path.join(__dirname, '..', 'logs'));


//setup application mongoose instance
require(path.join(__dirname, 'app', 'initializers', 'mongoose'));

//------------------------------------------------------------------------
// Transports Initialization & Run
//------------------------------------------------------------------------

//initialize infobip sms transport
const infobip = require('open311-infobip');
let infobipOptions = config.get('infobip');
if (process.env.REDIS_URL) {
  infobipOptions.redis = process.env.REDIS_URL;
}
infobip.options = infobipOptions;


//start
infobip.start();


//initialize mongoose-kue to run schema methods in background
const worker = require('mongoose-kue').worker;
const mongoose = require('mongoose');
let mongooseKueOptions = { mongoose: mongoose };
if (process.env.REDIS_URL) {
  mongooseKueOptions.redis = process.env.REDIS_URL;
}
worker.start(mongooseKueOptions);


//open web interface to monitor jobs
if (!process.env.REDIS_URL) {
  kue.app.listen(9000);
}
