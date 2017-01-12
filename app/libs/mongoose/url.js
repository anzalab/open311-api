'use strict';

//dependencies
const _ = require('lodash');
const inflection = require('inflection');
const config = require('config');

module.exports = exports = function (schema, options) {

  options = _.merge({}, {
    baseUrl: config.get('baseUrl')
  }, options);

  /**
   * @description extend mongoose model instance to add virtual url to
   *              where a resource can be full accessed
   */
  schema.virtual('uri').get(function () {
    let resource = (this.modelName || (this.collection || {}).name);

    if (resource) {
      resource = inflection.pluralize(resource).toLowerCase();
      const url = [options.baseUrl, resource, this._id].join('/');
      return url;
    } else {
      return '';
    }

  });

};
