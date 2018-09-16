'use strict';

//dependencies
const _ = require('lodash');
const inflection = require('inflection');

module.exports = exports = function (schema /*, options*/ ) {

  /**
   * @function
   * @description extend mongoose collection with static list method to handle both
   *              search and pagination
   * @param  {Request}   request valid express http request
   * @param  {Function} done    a callback to invoke on success or error
   * @return {Object}
   */
  schema.statics.list = function (request, done) {

    //prepare results name
    let name = this.modelName || this.collection.name;
    name = inflection.pluralize(name.toLowerCase());

    //reference request query
    const filter = { filter: { q: request.query.q } };
    const paginate = {
      paginate: { limit: Number((request.query || {}).limit || 10) }
    };
    const options =
      _.merge({}, request.mquery, filter, paginate);
    delete options.query;

    //get
    this.get(options, function afterGet(error, results) {

      if (results) {
        //prepare result
        results[name] = results.data;
        results.count = results.total;
        delete results.data;
      }

      done(error, results);

    });

  };

};
