'use strict';

//dependencies
const _ = require('lodash');

/**
 * @name reload
 * @description extend mongoose model instance with self refresh ability
 * @param  {Schema} schema  valid mongoose schema
 * @param  {Object} options soft delete plugin configurations
 * @return {Function} valid mongoose plugin 
 */
module.exports = exports = function (schema) {

  schema.methods.reload =
    schema.methods.refresh = function reload(done) {

      //prapare query
      const query = this.constructor.findById(this._id);

      //if callback execute
      if (done && _.isFunction(done)) {
        return query.exec(done);
      }

      //else return query
      else {
        return query;
      }

    };
};
