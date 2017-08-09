'use strict';

//dependencies
const _ = require('lodash');

/**
 * @name show
 * @description extend mongoose model with ability to load a model based on
 *              express mquery options
 * @param  {Schema} schema  valid mongoose schema
 * @param  {Object} options show plugin configurations
 * @return {Function} valid mongoose plugin 
 */
module.exports = exports = function (schema) {

  schema.statics.show = function show(request, done) {

    //obtain id
    const id = request.params.id;

    //prapare query
    const query = this.findById(id);

    //select specified fields
    const select = _.get(request.mquery, 'select', undefined);
    if (select) {
      query.select(select);
    }

    //populate refs
    const populate = _.get(request.mquery, 'populate', undefined);
    if (populate) {
      query.populate(populate);
    }

    //if callback execute
    if (done && _.isFunction(done)) {
      return query.exec(function (error, instance) {

        //ensure instance exists
        if (!error && !instance) {
          error = new Error('Not Found');
          error.status = 404;
        }

        done(error, instance);

      });
    }

    //else return query
    else {
      return query;
    }

  };

};
