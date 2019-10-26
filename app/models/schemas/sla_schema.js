'use strict';

const { createSubSchema } = require('@lykmapipo/mongoose-common');

/**
 * @module SLA
 * @description service level agreement schema
 * @author lally elias<lallyelias87@gmail.com>
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 */
const SlaSchema = createSubSchema({
  /**
   * @name ttr
   * @description time required in hours to resolve(mark as done)
   *              an issue(service request)
   * @type {Object}
   */
  ttr: {
    type: Number
  }

});

/**
 * Exports service level agreement schema
 * @type {Schema}
 */
module.exports = exports = SlaSchema;
