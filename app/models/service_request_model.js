'use strict';

const _ = require('lodash');
const { uniq, mergeObjects } = require('@lykmapipo/common');
const { createSchema, model } = require('@lykmapipo/mongoose-common');
const actions = require('mongoose-rest-actions');
const { plugin: runInBackground } = require('mongoose-kue');
const {
  MODEL_NAME_SERVICEREQUEST
} = require('@codetanzania/majifix-common');

// plugins
const notification = require('./plugins/service_request_notification_plugin');
const open311 = require('./plugins/service_request_open311_plugin');
const overview = require('./plugins/service_request_overview_plugin');
const performance = require('./plugins/service_request_performance_plugin');
const pipeline = require('./plugins/service_request_pipeline_plugin');
const work = require('./plugins/service_request_work_plugin');
const duration = require('./plugins/service_request_duration_plugin');
const changelog = require('./plugins/service_request_changelog_plugin');
const preValidate = require('./plugins/service_request_prevalidate_plugin');
const legacy = require('./plugins/service_request_legacy_plugin');
const statistics = require('./plugins/service_request_statistics_plugin');

// schemas
const { requestBase } = require('./schemas/base_schema');
const basic = require('./schemas/request_basic_schema');
const { requestParties } = require('./schemas/parties_schema');
const geos = require('./schemas/geos_schema');
const files = require('./schemas/files_schema');
const timestamps = require('./schemas/timestamps_schema');

// definitions
const SCHEMA = mergeObjects(
  requestBase,
  basic,
  requestParties,
  geos,
  files,
  timestamps
);
const SCHEMA_OPTIONS = {};
const SCHEMA_PLUGINS = [preValidate,
  legacy,
  actions,
  runInBackground,
  notification,
  open311,
  overview,
  performance,
  pipeline,
  work,
  duration,
  changelog,
  statistics
];

/**
 * @module ServiceRequest
 * @name ServiceRequest
 * @description An service request(issue) reported by civilian(or customer)
 * e.g Water Leakage occur at a particular area.
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
const ServiceRequestSchema = createSchema(
  SCHEMA,
  SCHEMA_OPTIONS,
  ...SCHEMA_PLUGINS
);

/*
 *------------------------------------------------------------------------------
 * Hooks
 *------------------------------------------------------------------------------
 */

/**
 * @name preValidate
 * @function preValidate
 * @description pre validation logics for service request
 * @param {Function} next a callback to be called after pre validation logics
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
ServiceRequestSchema.pre('validate', function onPreValidate(next) {
  this.preValidate(next);
});


/*
 *------------------------------------------------------------------------------
 * Statics
 *------------------------------------------------------------------------------
 */
ServiceRequestSchema.statics.MODEL_NAME = MODEL_NAME_SERVICEREQUEST;

/**
 * @name getPhones
 * @function getPhones
 * @description pull distinct service request reporter phones
 * @param {Object} [criteria] valid query criteria
 * @param {function} done a callback to invoke on success or error
 * @return {String[]|Error}
 * @since 0.1.0
 * @version 0.1.0
 * @static
 */
ServiceRequestSchema.statics.getPhones = function getPhones(criteria, done) {

  // refs
  const ServiceRequest = this;

  // normalize arguments
  const filter = _.isFunction(criteria) ? {} : _.merge({}, criteria);
  const cb = _.isFunction(criteria) ? criteria : done;

  ServiceRequest
    .find(filter)
    .distinct('reporter.phone')
    .exec(function onGetPhones(error, phones) {
      if (!error) {
        phones = uniq([].concat(phones));
      }
      return cb(error, phones);
    });

};


/* export service request model */
module.exports = exports = model('ServiceRequest', ServiceRequestSchema);
