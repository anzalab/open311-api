'use strict';

//dependencies
const defer = require('config/defer').deferConfig;

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
    return 'http://' + this.ip + ':' + this.port;
  }),


  /**
   * @description application port
   * @type {Number}
   */
  port: 3000,


  /**
   * @description application ip address
   * @type {String}
   */
  ip: '127.0.0.1',


  /**
   * @description mongoose database configurations
   * @type {Object}
   */
  mongoose: {
    database: 'open311-dev',
    host: '127.0.0.1',
    user: '',
    password: '',
    port: 27017,
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
  },


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
    expiresIn: '1000y', //7 days

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
  },
  /*jshint camelcase:true*/

  /**
   * @description infobip sms transport configurations
   * @type {Object}
   */
  infobip: {
    from: 'open311', //process.env.INFOBIP_FROM,
    username: 'open311', //process.env.INFOBIP_USERNAME,
    password: 'open311', //process.env.INFOBIP_PASSWORD,
    fake: true,
    sync: true,
    templates: {
      ticket: 'Your ticket # is {ticket} for {service} you have reported. Thanks.'
    }
  }

};
