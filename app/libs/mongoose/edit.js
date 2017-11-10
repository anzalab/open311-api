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

  schema.statics.edit = function edit(request, done) {

    //prepare results name
    let name = this.modelName || this.collection.name;

    //obtain id
    const id = (request.params.id || request.params._id);

    //reference model
    const Model = this;

    async.waterfall([

      function findExisting(next) {

        Model.findById(id, function (error, found) {
          if (error || !found) {
            if (!found) {
              error =
                new Error(name + ' with id ' + id + ' Not Found');
              error.status = 400;
            }
            next(error);
          } else {
            next(null, found);
          }
        });

      },

      function upsert(model, next) {
        _.forEach(request.body, function (value, key) {
          model[key] = value;
        });

        model.save(function (error, saved) {
          next(error, saved);
        });

      },

      function reload(saved, next) { //TODO clear hack
        Model.findById(saved._id, next);
      }

    ], done);

  };

};
