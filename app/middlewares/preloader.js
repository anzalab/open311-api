'use strict';


/**
 * @name instance
 * @description preload model instance
 * @type {Function}
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const mongoose = require('mongoose');
const async = require('async');
const _ = require('lodash');


module.exports = exports = function (request, response, next) {

  //instance variable to model mapping
  const instances = {
    operator: 'Party',
    commentator: 'Party',
    worker: 'Party',
    changer: 'Party',
    assignee: 'Party',
    jurisdiction: 'Jurisdiction',
    group: 'ServiceGroup',
    service: 'Service',
    priority: 'Priority',
    request: 'ServiceRequest',
    status: 'Status',
    zone: 'Predefine',
    item: 'Predefine',
  };

  //check if request has any instance
  const hasInstances = (
    request &&
    request.body &&
    _.intersection(_.keys(request.body), _.keys(instances))
  );

  //populate request body with instances
  if (hasInstances) {

    //prepare instance preloads
    const bodyInstances = _.pick(request.body, _.keys(instances));
    let preloads = {};
    _.forEach(bodyInstances, function (value, key) {
      preloads[key] = function (after) {
        const id = _.get(instances[key], '_id', instances[key]);
        const Model = mongoose.model(id);
        Model.findById(value, after);
      };
    });

    //TODO try use sub process(or paralleljs)
    //perfom preload(s) in parallel
    async.parallel(preloads, function (error, _preloads) {
      if (error) {
        next(error);
      } else {
        _.merge(request.body, _preloads);
        next();
      }
    });
  }

  //no instances on request body
  //continue
  else {
    next();
  }

};
