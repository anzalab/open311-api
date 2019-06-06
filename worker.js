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


/* dependencies */
const path = require('path');
const { getNumber } = require('@lykmapipo/env');
const { worker, httpServer } = require('@lykmapipo/postman');
const mkdir = require('mkdir-p');


/* constants */
const QUEUE_HTTP_PORT = getNumber('QUEUE_HTTP_PORT');


//build logs directory if does not exists
const logPath = path.join(__dirname, 'logs');
mkdir.sync(logPath);


/* setup models */
require(path.join(__dirname, 'app', 'initializers', 'mongoose'));


/* run work */
worker.start();


/* open web interface to monitor jobs */
if (QUEUE_HTTP_PORT) {
  httpServer.listen(QUEUE_HTTP_PORT);
}
