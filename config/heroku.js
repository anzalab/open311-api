'use strict';

//dependencies
const _ = require('lodash');
const parseMongoUrl = require('parse-mongo-url');

//parse heroku mongo connection string
//see https://docs.mongodb.com/manual/reference/connection-string/
//see https://github.com/Automattic/mongoose/issues/4670
let mongoOptions = {
  database: 'open311',
  host: '127.0.0.1',
  port: 27017,
  user: '',
  password: '',
  options: {
    db: {
      safe: true
    },
    server: {
      socketOptions: {
        keepAlive: 1
      }
    },
    replset: {
      socketOptions: {
        keepAlive: 1
      }
    }
  }
};

//parse mongodb uri if exists
if (process.env && !_.isEmpty(process.env.MONGODB_URI)) {
  const parsed = parseMongoUrl(process.env.MONGODB_URI);
  mongoOptions = _.merge({}, mongoOptions, {
    database: _.get(parsed, 'dbName', 'open311'),
    host: _.get(parsed, 'servers[0].host', '127.0.0.1'),
    port: _.get(parsed, 'servers[0].port', 27017),
    user: _.get(parsed, 'auth.user', ''),
    password: _.get(parsed, 'auth.password', ''),
    options: {
      db: {
        readPreference: _.get(parsed, 'db_options.read_preference', null)
      }
    }
  });
}

/**
 * @description default configurations
 * @type {Object}
 */
module.exports = {
  /**
   * @description default application base url
   * @type {String}
   */
  baseUrl: 'https://dawasco.herokuapp.com',

  /**
   * @description mongoose database configurations
   * @type {Object}
   */
  mongoose: mongoOptions,

  /**
   * @description json web token configuration
   * @type {Object}
   */
  jwt: {
    /**
     * @description a secret to be used on encoding and decoding jwt
     * @type {String}
     */
    secret: '78+3fsw9_4n13.hs~ns*ma42#@!`',

    /**
     * @description an algorithm to be used on encoding and decoding jwt
     * @type {String}
     */
    algorithm: 'HS256',

    /**
     * @description lifespan of jwt
     * @type {String}
     */
    expiresIn: '7 days',

    /**
     * @description intended audience for jwt
     * @type {String}
     */
    audience: 'open311'
  },


  /**
   *@description logger configurations
   */
  logger: {
    console: {
      timestamp: true,
      level: 'silly',
      color: true
    },
    mongoose: {
      timestamp: true,
      level: 'silly',
      model: 'Log'
    }
  },


  /**
   * @description sendgrid configurations
   * @type {Object}
   */
  /*jshint camelcase:false*/
  mailer: {
    from: 'open311 <no-reply@open311.com>',
    sender: 'The open311 Team',
    transport: {
      auth: {
        api_key: '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',
      }
    },
    kue: {
      concurrency: 10,
      timeout: 5000,
      connection: {
        prefix: 'open311'
      }
    }
  }
  /*jshint camelcase:true*/

};
