'use strict';


/**
 * @module application
 * @name application
 * @alias app
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
const { getString } = require('@lykmapipo/env');
const { app, mount } = require('@lykmapipo/express-common');
const mkdir = require('mkdir-p');


/* constants */
const BASE_PATH = getString('BASE_PATH', process.cwd());
const LOG_PATH = getString('LOG_PATH', path.join(BASE_PATH, 'logs'));


// build logs directory if does not exists
mkdir.sync(LOG_PATH);


//setup application mongoose instance
require(path.join(__dirname, 'initializers', 'mongoose'));


//bind settings loader middleware(TODO: cleanup)
app.use(require(path.join(__dirname, 'middlewares', 'settings')));
app.use(require(path.join(__dirname, 'middlewares', 'preloader')));
app.use(require(path.join(__dirname, 'middlewares', 'defaults')));


/* load legacy routers recursively */
require('require-all')({
  dirname: path.join(__dirname, 'routers'),
  filter: /(.+_router)\.js$/,
  excludeDirs: /^\.(git|svn|md)$/,
  resolve: function (router) {
    app.use(router);
  }
});


/* load majifix modules versioned routers */
mount(require('@lykmapipo/permission').permissionRouter);
mount(require('@lykmapipo/role').roleRouter);
mount(require('@lykmapipo/predefine').predefineRouter);
mount(require('@lykmapipo/file').fileRouter);
mount(require('@codetanzania/majifix-jurisdiction').router);
mount(require('@codetanzania/majifix-priority').router);
mount(require('@codetanzania/majifix-status').router);
mount(require('@codetanzania/majifix-service-group').router);
mount(require('@codetanzania/majifix-service').router);
mount(require('@codetanzania/majifix-account').router);
mount(require('@codetanzania/majifix-alert').router);


/* export express application */
exports = module.exports = app;
