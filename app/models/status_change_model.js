'use strict';


/**
 * @module StatusChange
 * @name StatusChange
 * @description A record of a status change on a service request(issue) 
 *              by a party.
 *
 * @see {@link Party}
 * @see {@link ServiceRequest}
 * @see {@link Status}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


/**
 * @name StatusChangeSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const StatusChangeSchema = new Schema({
  /**
   * @name request
   * @description A service requests which status has been changed
   * @type {Object}
   * @see {@link ServiceRequest}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  request: {
    type: ObjectId,
    ref: 'ServiceRequest',
    required: true,
    index: true,
    autoset: true,
    exists: true
  },


  /**
   * @name status
   * @description A current assigned status
   * @type {Object}
   * @see {@link Status}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  status: {
    type: ObjectId,
    ref: 'Status',
    required: true,
    index: true,
    autoset: true,
    exists: true,
    autopopulate: true
  },


  /**
   * @name changer
   * @description A party whose made a status change
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  changer: {
    type: ObjectId,
    ref: 'Party',
    required: true,
    index: true,
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'name email phone'
    }
  },


  /**
   * @name remarks
   * @description A note provided by a change when changing a status
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  remarks: {
    type: String,
    index: true,
    searchable: true
  }

}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// StatusChangeSchema Hooks
//-----------------------------------------------------------------------------


/**
 * @name preValidate
 * @description pre validation logics to be run before status change is saved
 * @param  {Function} next a callback to be run after pre save logics
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @type {Function}
 */
StatusChangeSchema.pre('save', function (next) {

  //ensure service request have the same status
  const serviceRequestHasSameStatus =
    (this.request && this.status) &&
    ((this.request.status || {})._id === this.status._id);

  //update current service request status
  if (!serviceRequestHasSameStatus) {
    this.request.status = this.status;

    //update request to ensure it has current status
    this.request.save(function (error /*, request*/ ) {

      //notify error
      if (error) {
        //flag internal server error
        error.code = error.status = 500;
        next(error);
      }

      //continue to save status change
      else {
        next(null, this);
      }

    }.bind(this)); //ensure instance context
  }

  //continue with saving status change
  else {
    next();
  }

});


/**
 * @name StatusChange
 * @description register StatusChangeSchema and initialize StatusChange
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('StatusChange', StatusChangeSchema);
