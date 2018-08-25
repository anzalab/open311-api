'use strict';


/**
 * @module application
 * @description application entry point responsible to load components
 *
 * Booting Order(Sequence):
 *   1. setup application environment
 *   2. loading configuration
 *   3. sync log folder if not exists
 *   4. initialize database (mongoose)
 *     4.1 loading models
 *     4.2 setup mongoose common plugins
 *     4.3 establish mongodb connection
 *   5. setup express
 *     5.1 loading common express middlewares
 *     5.1 setup application routes
 *     5.2 setup error hanlders middlewares
 *
 * @since 0.1.0
 * @version 0.1.0
 * @author lally elias <lallyelias87@gmail.com>
 * @public
 */


/* dependencies */
const path = require('path');
const env = require('@lykmapipo/env');
const app = require('@lykmapipo/express-common');
const mkdir = require('mkdir-p');
const config = require('config');
const respond = require('express-respond');


/* constants */
const BASE_PATH = env('BASE_PATH', process.cwd());
const LOG_PATH = env('LOG_PATH', path.join(BASE_PATH, 'logs'));


// build logs directory if does not exists
mkdir.sync(LOG_PATH);


//setup application mongoose instance
require(path.join(__dirname, 'initializers', 'mongoose'));


//setup messages transports(TODO: use postman)
const infobip = require('open311-infobip');
let infobipOptions = config.get('infobip');
if (process.env.REDIS_URL) {
  infobipOptions.redis = process.env.REDIS_URL;
}
infobip.options = infobipOptions;
infobip.init();

//finish initializers


//use express respond to force
//response content type to json always
app.use(respond({ types: 'json' })); //TODO remove


//bind settings loader middleware(TODO: cleanup)
app.use(require(path.join(__dirname, 'middlewares', 'settings')));
app.use(require(path.join(__dirname, 'middlewares', 'preloader')));
app.use(require(path.join(__dirname, 'middlewares', 'defaults')));


// load legacy routers recursively
require('require-all')({
  dirname: path.join(__dirname, 'routers'),
  filter: /(.+_router)\.js$/,
  excludeDirs: /^\.(git|svn|md)$/,
  resolve: function (router) {
    app.use(router);
  }
});


/* load modules versioned routers */
// const { router: accountRouter } = require('@codetanzania/majifix-account');


//export express application
exports = module.exports = app;
