'use strict';


/**
 * @module Call
 * @description call schema used to log call start and end time as well as
 *              call dutation.
 *               
 * @see {@link ServiceRequest}
 * @see {@link DurationSchema}
 * @author lally elias<lallyelias87@gmail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Duration = require(path.join(__dirname, 'duration_schema'));


/**
 * @name CallSchema
 * @description duration schema
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @private
 */
const CallSchema = new Schema({
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

}, { _id: false, timestamps: false });


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

  //always ensure duration
  const time = this.startedAt.getTime() - this.endedAt.getTime();

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
