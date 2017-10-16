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
   * @description application phone number
   * @type {String}
   */
  phone: '255714095061',


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
    },
    seed: {
      enable: false
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
    prefix: '',
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
    from: process.env.INFOBIP_FROM || 'DAWASCO',
    username: process.env.INFOBIP_USERNAME || 'DAWASCO311',
    password: process.env.INFOBIP_PASSWORD || 'DAWASCO311',
    fake: true,
    sync: true,
    templates: {
      ticket: {
        open: 'Dear customer. Your ticket # is {ticket} for {service} you have reported. Call {phone} for more support. Thanks.',
        resolve: 'Dear customer. Your issue # - {ticket} has been resolved. Call {phone} for confirmation. Thanks.'
      }
    }
  },

  /**
   * @description open311 configurations
   * @type {Object}
   */
  /*jshint camelcase:false*/
  open311: defer(function () {
    return {
      discovery: {
        changeset: '2017-04-13 09:20',
        contact: 'You can email or call for assistance lallyelias87@gmail.com +255 714 095 061',
        key_service: 'For detail on usage, contact lallyelias87@gmail.com +255 714 095 061',
        endpoints: [{
          specification: 'http://wiki.open311.org/GeoReport_v2',
          url: 'http://dawasco.herokuapp.com/open311',
          changeset: '2017-04-13 09:20',
          type: 'test',
          formats: [
            'application/json'
          ],
          locales: [
            'en_GB',
            'en_US'
          ]
        }, {
          specification: 'http://wiki.open311.org/GeoReport_v2',
          url: 'http://dawasco.herokuapp.com/open311',
          changeset: '2017-04-13 09:20',
          type: 'development',
          formats: [
            'application/json'
          ],
          locales: [
            'en_GB',
            'en_US'
          ]
        }]
      }
    };
  })
  /*jshint camelcase:true*/
};
