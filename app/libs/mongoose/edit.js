'use strict';


//dependencies
const _ = require('lodash');
const async = require('async');


/**
 * @name edit
 * @description extend mongoose model with ability to update model instance
 *              from express request
 * @param  {Schema} schema  valid mongoose schema
 * @param  {Object} options edit plugin configurations
 * @return {Function} valid mongoose plugin
 */
module.exports = exports = function (schema) {

  schema.statics.edit = function edit(request, options, done) {

    //normalize options
    if (_.isFunction(options)) {
      done = options;
      options = {};
    }

    //prepare results name
    // let name = this.modelName || this.collection.name;

    //obtain id
    const id = (request.params.id || request.params._id);

    //reference model
    const Model = this;

    async.waterfall([

      function findExisting(next) {

        Model.findById(id, function (error, found) {

          if (error || !found) {

            //notify error
            if (error) {
              error.status = 400;
              next(error);
            }

            //create if not exists
            else {
              Model.create(request.body, next);
            }

          } else {
            next(null, found);
          }

        });

      },

      function upsert(model, next) {
        //prepare updates
        let updates = {};
        _.forEach(request.body, function (value, key) {
          updates[key] = value;
        });

        //ingore protected fields from update
        const ignore = _.compact([].concat(options.ignore));
        _.forEach(ignore, function (ignored) {
          delete updates[ignored];
        });

        Model.update({ _id: id }, updates, function (error) {
          next(error, model);
        });

      },

      function reload(saved, next) { //TODO clear hack
        Model.findById(saved._id, next);
      }
    ], done);

  };

};
