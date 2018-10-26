'use strict';


/* dependencies */
const _ = require('lodash');


/**
 * @name show
 * @function show
 * @description extend mongoose model with ability to load a model based on
 * express mquery options
 * @param {Schema} schema valid mongoose schema
 * @param {Object} options show plugin configurations
 * @return {Function} valid mongoose plugin
 */
module.exports = exports = function (schema) {

  schema.statics.show = function show(request, done) {

    //obtain request options
    const options = _.merge({}, request.mquery);

    //obtain jurisdiction id
    options._id = request.params.id;

    //execute find
    return this.getById(options, done);

  };

};
