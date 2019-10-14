'use strict';

const { createSubSchema } = require('@lykmapipo/mongoose-common');
const Duration = require('./duration_schema');

/**
 * @module Call
 * @description call schema used to log call start and end time as well as
 *              call dutation.
 *
 * @see {@link ServiceRequest}
 * @see {@link DurationSchema}
 * @author lally elias<lallyelias87@gmail.com>
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
const CallSchema = createSubSchema({
  /**
   * @name startedAt
   * @description time when a call received at the call center
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  startedAt: {
    type: Date,
    default: new Date(),
    index: true
  },


  /**
   * @name endedAt
   * @description time when a call center operator end the call
   *              and release a reporter
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  endedAt: {
    type: Date,
    default: new Date(),
    index: true
  },


  /**
   * @name duration
   * @description call duration from time when call picked up to time when
   *              a call released by the call center operator in duration
   *              formats.
   *
   * @type {Object}
   * @see {@link DurationSchema}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  duration: Duration

});


//---------------------------------------------------------
// CallSchema Hooks
//---------------------------------------------------------


/**
 * @name  preValidate
 * @description pre validation logics for call
 * @param  {Function} next a callback to be called after pre validation logics
 * @since  0.1.0
 * @version 0.1.0
 * @private
 */
CallSchema.pre('validate', function (next) {

  //ensure call times
  this.startedAt = this.startedAt || new Date();
  this.endedAt = this.endedAt || new Date();

  //always ensure duration
  const time = this.endedAt.getTime() - this.startedAt.getTime();

  this.duration = { milliseconds: time };

  next(null, this);

});


/**
 * @name CallSchema
 * @description exports call schema
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = exports = CallSchema;
