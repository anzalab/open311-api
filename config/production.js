'use strict';

//dependencies
const _ = require('lodash');
const defer = require('config/defer').deferConfig;
const parseMongoUrl = require('parse-mongo-url');
let isHeroku = false;

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
  isHeroku = true;

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
  baseUrl: defer(function () {
    const _baseUrl = isHeroku ? 'https://dawasco.herokuapp.com' :
      'http://' + this.ip + ':' + this.port;
    return _baseUrl;
  }),


  /**
   * @description application port
   * @type {Number}
   */
  port: (process.env.PORT || 5000),


  /* @description application ip address
   * @type {String}
   */
  ip: '127.0.0.1',


  /**
   * @description application phone number
   * @type {String}
   */
  phone: '255714095061',


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
   * @description api token configuration
   * @type {Object}
   */
  token: {
    /**
     * @description lifespan of api token
     * @type {String}
     */
    expiresIn: '1000y',
  },


  /**
   * @description ticket number configuration
   * @type {Object}
   */
  counter: {
    prefix: 'P',
    suffix: ''
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
    concurrency: 10,
    timeout: 5000,
    prefix: 'open311',
    fake: false,
    sync: false,
    from: 'open311 <no-reply@open311.com>',
    sender: 'The open311 Team',
    transport: {
      auth: {
        api_key: process.env.SENDGRID_API_KEY || '',
      }
    }
  },
  /*jshint camelcase:true*/

  /**
   * @description infobip sms transport configurations
   * @type {Object}
   */
  infobip: {
    concurrency: 10,
    timeout: 5000,
    prefix: 'open311',
    fake: false,
    sync: false,
    from: process.env.INFOBIP_FROM || 'DAWASCO',
    username: process.env.INFOBIP_USERNAME || 'DAWASCO311',
    password: process.env.INFOBIP_PASSWORD || 'DAWASCO311',
    templates: {
      ticket: {
        open: 'Dear customer. Your ticket # is {ticket} for {service} you have reported. Call {phone} for more support. Thanks.',
        resolve: 'Dear customer. Your issue # - {ticket} has been resolved. Call {phone} for confirmation. Thanks.'
      }
    }
  }

};
