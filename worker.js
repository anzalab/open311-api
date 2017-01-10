'use strict';

/**
 * @name worker
 * @description job worker process for DRM API
 *
 * Alert!: Please ensure your have installed Redis Server
 * 
 * Alert!: Run worker in the separate process from main process 
 */


//set environment to development by default
if (!(process.env || {}).NODE_ENV) {
  process.env.NODE_ENV = 'development';
}


//suppress configuration warning
process.env.SUPPRESS_NO_CONFIG_WARNING = true;


const path = require('path');

//dependencies
require('config'); //load configurations
const environment = require('execution-environment');
const mkdir = require('mkdir-p');


//register environment variables
environment.registerEnvironments({
  isLocal: ['test', 'dev', 'development']
});


//build logs directory if does not exists
mkdir.sync(path.join(__dirname, '..', 'logs'));


//setup application mongoose instance
require(path.join(__dirname, 'app', 'initializers', 'mongoose'));


//load worker and it dependencies
const mongoose = require('mongoose');
const Mail = mongoose.model('Mail');

//start worker(s)
Mail.worker.start();
