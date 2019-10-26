'use strict';

const { idOf } = require('@lykmapipo/common');
const { model } = require('@lykmapipo/mongoose-common');
const { parallel } = require('async');
const _ = require('lodash');

/**
 * @name instance
 * @description preload model instance
 * @type {Function}
 * @since 0.1.0
 * @version 0.1.0
 */
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
    _.forEach(bodyInstances, (value, key) => {
      preloads[key] = (after) => {
        const id = idOf(value) || value;
        const modelName = instances[key];
        const Model = model(modelName);
        return Model.findById(id, after);
      };
    });

    //TODO try use sub process(or paralleljs)
    //perfom preload(s) in parallel
    parallel(preloads, (error, _preloads) => {
      if (error) {
        next(error);
      } else {
        request.body = _.merge({}, request.body, _preloads);
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
