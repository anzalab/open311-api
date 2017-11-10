'use strict';

//dependencies
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
    const queryParams = request.query;
    let result = {};

    //handle search request
    if (queryParams.q) {

      const skip = queryParams.skip || 0;
      const limit = queryParams.limit || 10;
      const sort = request.mquery ? request.mquery.sort : undefined;
      const criteria = request.mquery ? request.mquery.query : undefined;
      const select = request.mquery ? request.mquery.select : undefined;
      const populate = request.mquery ? request.mquery.populate : undefined;

      const query = this.search(queryParams.q);

      if (criteria) {
        query.where(criteria);
      }

      if (sort) {
        query.sort(sort);
      }

      if (select) {
        query.select(select);
      }

      if(populate){
        query.populate(populate);
      }

      query.skip(skip).limit(limit).exec(function (error, models) {
        //handle error
        if (error) {
          done(error);
        }

        //handle success
        else {
          //prepare result
          result[name] = models;
          result.pages = skip;
          result.count = limit;

          done(null, result);
        }
      }.bind(this));
    }

    //handle pagination request
    else {
      this.paginate(request, function (error, models, pages, total) {
        //handle error
        if (error) {
          done(error);
        }
        //handle success
        else {
          //prepare result
          result[name] = models;
          result.pages = pages;
          result.count = total;

          done(null, result);
        }
      }.bind(this));
    }
  };

};
