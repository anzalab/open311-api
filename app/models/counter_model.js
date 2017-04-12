'use strict';


/**
 * @module Counter
 * @name Counter
 * @description A record of service request(issue) ticket number.
 *
 *              Used to generate sequencial ticket number for 
 *              service request(issue) based on jurisdiction, service and year.
 *
 *              The format for the ticket number is as below:
 *              jurisdiction code - service code - year(2digits) - sequence(4digits)
 *              i.e ILLK170001
 *              
 *              At any time the above combo is ensured to be unique for better
 *              ticket number generation.
 *
 * @see {@link ServiceRequest}
 * @see {@link Jurisdiction}
 * @see {@link Service}
 * @see {@link https://docs.mongodb.com/v3.0/tutorial/create-an-auto-incrementing-field/}
 * @see {@link https://momentjs.com/|moment}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//default year digits to use
const YEAR_FORMAT = 'YY'; //TODO move this to configurations


/**
 * @name CounterSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const CounterSchema = new Schema({
  /**
   * @name area
   * @description A jurisdiction code for the counter e.g if a jurisdiction 
   *              called Ilala and has a code IL the IL will be used in
   *              generating next ticket number
   *               
   * @type {Object}
   * @see {@link Jurisdiction}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  jurisdiction: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    searchable: true
  },


  /**
   * @name service
   * @description A service code for the counter e.g if a service 
   *              called Leakage and has a code LK the LK will be used in
   *              generating next ticket number.
   *               
   * @type {Object}
   * @see {@link Jurisdiction}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  service: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    searchable: true
  },


  /**
   * @name year
   * @description A 2-digit year used in generating next ticket number. 
   *              
   *              So if year is 2017 the 17 will be used in generating ticket number.
   *              
   *              If not provide current year will be used as default year.
   *               
   * @type {Object}
   * @see {@link Jurisdiction}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  year: {
    type: Number,
    default: Number(moment(new Date()).format(YEAR_FORMAT)),
    searchable: true
  },


  /**
   * @name sequence
   * @description Latest ticket number generated. It will be used as a suffix
   *              for the full ticke number i.e if the last sequence is 999 then
   *              a full ticket number will be formatted as below:
   *              jurisdction-service-year(2digit)-0999
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  sequence: {
    type: Number,
    default: 1, //default to start point of the ticket sequences
    searchable: true
  }

}, { timestamps: true, emitIndexErrors: true });


/**
 * force uniqueness of the ticket key per jurisdiction, per service per year
 * and sequence
 */
CounterSchema.index({
  jurisdiction: 1,
  service: 1,
  year: 1,
  sequence: 1
}, { unique: true });


/**
 * @name format
 * @description format a counter to meaningful(human readable) ticket number
 * @return {String} formatted ticket number
 * @see  {@link https://lodash.com/docs/4.17.4#padStart}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
CounterSchema.methods.format = function () {

  //format ticket number to whole meaningful(human readable) number

  //TODO move this to configurations
  let padSize = 4; //we envision four digit sequence number

  //format a sequence by padding 0's at the begin of it
  const sequence = _.padStart(this.sequence, padSize, '0');

  //format the ticket number as (jurisdiction code)(service code)(year)(sequence)
  const ticketNumber = [
    this.jurisdiction, this.service, this.year, sequence
  ].join('');

  return ticketNumber;

};


/**
 * @name generate
 * @param  {Object}   options valid counter options
 * @param  {String}   options.jurisdiction valid jurisdiction code
 * @param  {String}   options.service valid service code
 * @param  {String}   [options.year] optional year to be used. default to current
 *                                   year
 * @param  {Function} done    a callback to invoke on success or error
 * @return {String|Error}     next ticket number or error
 * @see {@link https://docs.mongodb.com/v3.0/tutorial/create-an-auto-incrementing-field/}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
CounterSchema.statics.generate = function (options, done) {
  //reference counter
  const Counter = this;

  //ensure options
  options = _.merge({
    year: Number(moment(new Date()).format(YEAR_FORMAT))
  }, options);


  //ensure jurisdiction code
  if (!options.jurisdiction) {
    let error = new Error('Missing Jurisdiction Code');
    error.status = 400;
    return done(error);
  }

  //ensure service code
  if (!options.service) {
    let error = new Error('Missing Service Code');
    error.status = 400;
    return done(error);
  }

  //atomically upsert & increment sequence
  const criteria = _.pick(options, ['jurisdiction', 'service', 'year']);
  Counter
    .findOneAndUpdate(
      criteria, {
        $inc: {
          sequence: 1 //increment sequence by one
        }
      }, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      })
    .exec(function (error, counter) {

      //generated formatted ticket number
      let ticketNumber;
      if (!error && counter) {
        ticketNumber = counter.format();
        //return
        return done(null, ticketNumber, counter);
      }

      //loop till succeed
      else {
        return Counter.generate(options, done);
      }

    });

};


/**
 * @name Counter
 * @description register CounterSchema and initialize Counter
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('Counter', CounterSchema);
