'use strict';

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


/**
 * @description extend mongoose schema with soft delete ability
 * @param  {Schema} schema  valid mongoose schema
 * @param  {Object} options soft delete plugin configurations
 * @return {Function} valid mongoose plugin        
 */
module.exports = function (schema, options) {

  //merge default options
  options = _.merge({
    deleteBy: false,
    ref: 'Party'
  }, options);

  //add deletedAt schema property
  schema.add({
    deletedAt: {
      type: Date
    }
  });

  //add deletedBy schema property
  if (options && options.deletedBy === true && !schema.path('deletedBy')) {
    let deletedBy = {
      deletedBy: {
        type: ObjectId,
        ref: options.ref,
        autoset: true
      }
    };

    //merge deletedBy options
    if (_.isPlainObject) {
      deletedBy.deletedBy =
        _.merge(deletedBy.deletedBy, options.deletedBy);
    }

    schema.add(deletedBy);
  }



  /**
   * @description soft delete model
   * @param  {Function} [callback] callback to invoke on success or error 
   */
  schema.methods.delete = function (deletedBy, callback) {
    //normalize arguments
    if (deletedBy && _.isFunction(deletedBy)) {
      callback = deletedBy;
      deletedBy = undefined;
    }

    //set soft delete properties
    this.deletedAt = new Date();

    //set deletedBy
    if (deletedBy) {
      this.deletedBy = deletedBy;
    }

    if (callback && _.isFunction(callback)) {
      return this.save(callback);
    } else {
      return this.save();
    }
  };



  /**
   * @description soft delete models
   * @param {Object} [criteria] additional query criteria
   * @param  {Function} [callback] callback to invoke on success or error
   */
  schema.statics.delete = function (criteria, callback) {

    //normalize arguments
    if (criteria && _.isFunction(criteria)) {
      callback = criteria;
      criteria = {};
    }

    //extend defaults
    criteria = _.merge({}, criteria);

    //prepare delete doc
    let doc = {
      deletedAt: new Date(),
      deletedBy: criteria.deletedBy
    };

    let options = {
      multi: true
    };

    delete criteria.deletedBy;

    if (callback && _.isFunction(callback)) {
      return this.update(criteria, doc, options, callback);
    } else {
      return this.update(criteria, doc, options);
    }
  };


  /**
   * @description soft delete models
   * @param {ObjectId} [id] id of the model to delete
   * @param  {Function} [callback] callback to invoke on success or error
   */
  schema.statics.findByIdAndDelete = function (id, callback) {
    this.findById(id).exec(function (error, model) {
      model.delete(callback);
    });
  };



  /**
   * @description restore deleted model
   * @param  {Function} [callback] callback to invoke on success or error
   */
  schema.methods.restore = function (callback) {
    //clear soft delete properties
    this.deletedAt = undefined;
    this.deletedBy = undefined;

    if (callback && _.isFunction(callback)) {
      return this.save(callback);
    } else {
      return this.save();
    }
  };



  /**
   * @description restore deleted models
   * @param {Object} [criteria] additional query criteria
   * @param  {Function} [callback] callback to invoke on success or error
   */
  schema.statics.restore = function (criteria, callback) {

    //normalize arguments
    if (criteria && _.isFunction(criteria)) {
      callback = criteria;
      criteria = {};
    }

    //extend defaults
    criteria = _.merge({
      deletedAt: {
        $ne: null
      }
    }, criteria);

    //prepare restore doc
    let doc = {
      deletedAt: undefined,
      deletedBy: undefined
    };

    let options = {
      multi: true
    };


    if (callback && _.isFunction(callback)) {
      return this.update(criteria, doc, options, callback);
    } else {
      return this.update(criteria, doc, options);
    }
  };
};
