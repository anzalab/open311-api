'use strict';

const { createSubSchema } = require('@lykmapipo/mongoose-common');
const parseMs = require('parse-ms');
const prettyMs = require('pretty-ms');

/**
 * @module Duration
 * @description duration schema used to express time(milliseconds) in their
 *              descete formats i.e years, months, days, minutes, seconds,
 *              milliseconds etc.
 * @author lally elias<lallyelias87@gmail.com>
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
const DurationSchema = createSubSchema({
  /**
   * @name years
   * @description duration in years
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  years: {
    type: Number,
    default: 0,
    index: true
  },


  /**
   * @name months
   * @description duration in months
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  months: {
    type: Number,
    default: 0,
    index: true
  },


  /**
   * @name days
   * @description duration in days
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  days: {
    type: Number,
    default: 0,
    index: true
  },


  /**
   * @name hours
   * @description duration in hours
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  hours: {
    type: Number,
    default: 0,
    index: true
  },


  /**
   * @name minutes
   * @description duration in minutes
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  minutes: {
    type: Number,
    default: 0,
    index: true
  },


  /**
   * @name seconds
   * @description duration in seconds
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  seconds: {
    type: Number,
    default: 0,
    index: true
  },


  /**
   * @name milliseconds
   * @description duration in milliseconds
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  milliseconds: {
    type: Number,
    required: true,
    index: true
  },


  /**
   * @name human
   * @description duration in human readable format like 4d 2h 30s
   * @type {Object}
   * @since  0.1.0
   * @version 0.1.0
   */
  human: {
    type: String,
    required: true,
    trim: true
  }

});


//---------------------------------------------------------
// DurationSchema Hooks
//---------------------------------------------------------


/**
 * @name  preValidate
 * @description pre validation logics for duration
 * @param  {Function} next a callback to be called after pre validation logics
 * @since  0.1.0
 * @version 0.1.0
 * @private
 */
DurationSchema.pre('validate', function (next) {

  //convert millisecond to other parts
  try {

    //there is milliseconds
    if (this.milliseconds) {

      //always parse milliseconds to human readable format
      this.human =
        prettyMs(this.milliseconds || 0, { secDecimalDigits: 0 });

      //always parse milliseconds to respective parts
      const parsedMs = parseMs(this.milliseconds || 0);

      //TODO years
      //TODO months

      //set parts
      this.days = parsedMs.days;
      this.hours = parsedMs.hours;
      this.minutes = parsedMs.minutes;
      this.seconds = parsedMs.seconds;

      //continue to validations
      next(null, this);

    }

    //no milliseconds provided continue with validations
    else {
      next(null, this);
    }

  }

  //catch all errors and back-off
  catch (error) {
    next(error);
  }

});


/**
 * @name DurationSchema
 * @description exports duration schema
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = exports = DurationSchema;
