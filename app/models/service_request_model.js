'use strict';


/**
 * @module ServiceRequest
 * @name ServiceRequest
 * @description An issue(or service request) reported by civilian(or customer)
 *              e.g Water Leakage occur at a particular area
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */

/**
 * Reporting Steps:
 * 0. ensure reporter
 * 0. ensure operator
 * 0. ensure assignee
 * 1. receive issue from reporter
 *  1.1 ensure reporter details(account etc) from previous details
 * 2. ensure jurisdiction
 *  2.1 ensure from issue coordinates
 *  2.2 ensure from reporter account
 *  2.2 ensure from default
 * 3. ensure zone(neighbourhood)
 *  3.1 Ensure zone from operator
 *  3.2 Ensure zone from assignee
 * 4. ensure group
 * 5. ensure type
 * 6. ensure service
 * 7. ensure status
 * 8. ensure priority
 * 8. ensure code(ticket number)
 * 9. save issue
 *  9.1 Generate reported changelog
 * 10. send reporter notifications
 *   10.1 generate ticket sent changelog
 * 11. send jurisdiction notifications
 *   11.1 generate jurisdiction notification changelog
 * 12. send assignee notification
 *   12.1 generate assignee notifiction changelog
 * 13.
 */

/**
 * Changelog Steps:
 * 0. ensure issue
 * 0. ensure changer, use current request party
 * 1. calculate and parse changelogs
 * 2. update service request
 * 3. save changelogs
 * 4. update changer last location details
 * 5. send notification to reporter
 * 6. send notification to assignee
 * 7. send notification to jurisdiction
 * 8. send notification to supervisor
 * 9. send notification to team
 * 10. send notification to workspace(operator, assignee, jurisdiction, zone)
 * 11.
 */

//global dependencies(or imports)
const _ = require('lodash');
const { uniq, mergeObjects } = require('@lykmapipo/common');
const { createSchema, model } = require('@lykmapipo/mongoose-common');
const actions = require('mongoose-rest-actions');

//local dependencies(or imports)

//plugins
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


//schemas
const { requestBase } = require('./schemas/base_schema');
const { requestParties } = require('./schemas/parties_schema');
const geos = require('./schemas/geos_schema');
const files = require('./schemas/files_schema');
const timestamps = require('./schemas/timestamps_schema');
const Media = require('./schemas/media_schema');
const Duration = require('./schemas/duration_schema');
const Call = require('./schemas/call_schema');
const Reporter = require('./schemas/reporter_schema');
const ContactMethod = require('./schemas/contact_method_schema');

/**
 * @name ServiceRequestSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const ServiceRequestSchema = createSchema(mergeObjects(requestBase,
  requestParties, {
    /**
     * @name call
     * @description log operator call details at a call center
     * @type {CallSchema}
     * @see {@link Party}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     * @deprecated
     */
    call: Call,


    /**
     * @name reporter
     * @description A party i.e civilian, customer etc which reported an
     *              issue(service request)
     * @type {Object}
     * @see {@link Reporter}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    reporter: Reporter, //TODO refactor to party

    /**
     * @name code
     * @description A unique human readable identifier of the
     *              service request(issue).
     *
     *              It mainly used by reporter to query for status and
     *              progress of the reported issue
     *
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
      searchable: true,
      taggable: true
    },


    /**
     * @name description
     * @description A detailed human readable explanation about the
     *              service request(issue)
     *
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    description: {
      type: String,
      index: true,
      trim: true,
      required: true,
      searchable: true
    },


    /**
     * @name method
     * @description A communication(contact) method(mechanism) used by a reporter
     *              to report the issue
     *
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    method: ContactMethod,


    /**
     * @name attachments
     * @description Associated file(s) with service request(issue)
     * @type {Array}
     * @see {@link MediaSchema}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     * @deprecated
     */
    attachments: { // TODO: deprecate and use image, audio and video files
      type: [Media],
      index: true
    },

    /**
     * @name ttr
     * @description A time taken to resolve the issue(service request) in duration format.
     *
     *              Used to calculcate Mean Time To Resolve(MTTR) KPI.
     *
     *              It calculated as time taken since the issue reported to the
     *              time when issue resolved.
     *
     * @type {Duration}
     * @see {@link DurationSchema}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     * @see {@link http://www.thinkhdi.com/~/media/HDICorp/Files/Library-Archive/Insider%20Articles/mean-time-to-resolve.pdf}
     */
    ttr: Duration,

    /**
     * @name changelogs
     * @description Associated change(s) on service request(issue)
     * @type {Array}
     * @see {@link ChangeLog}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
  }, geos, files, timestamps));


//-----------------------------------------------------------------------------
// ServiceRequestSchema Virtuals
//-----------------------------------------------------------------------------



//-----------------------------------------------------------------------------
// ServiceSchema Instance Methods
//-----------------------------------------------------------------------------



//-----------------------------------------------------------------------------
// ServiceRequestSchema Hooks
//-----------------------------------------------------------------------------


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


//-----------------------------------------------------------------------------
// ServiceRequestSchema Static Properties & Methods
//-----------------------------------------------------------------------------

ServiceRequestSchema.statics.MODEL_NAME = 'ServiceRequest';


//contact methods constants
ServiceRequestSchema.statics.CONTACT_METHOD_PHONE_CALL =
  ContactMethod.PHONE_CALL;
ServiceRequestSchema.statics.CONTACT_METHOD_FAX = ContactMethod.FAX;
ServiceRequestSchema.statics.CONTACT_METHOD_LETTER = ContactMethod.LETTER;
ServiceRequestSchema.statics.CONTACT_METHOD_VISIT = ContactMethod.VISIT;
ServiceRequestSchema.statics.CONTACT_METHOD_SMS = ContactMethod.SMS;
ServiceRequestSchema.statics.CONTACT_METHOD_USSD = ContactMethod.USSD;
ServiceRequestSchema.statics.CONTACT_METHOD_EMAIL = ContactMethod.EMAIL;
ServiceRequestSchema.statics.CONTACT_METHOD_MOBILE_APP =
  ContactMethod.MOBILE_APP;
ServiceRequestSchema.statics.CONTACT_METHODS = ContactMethod.METHODS;
ServiceRequestSchema.statics.WEB_CONTACT_METHODS = ContactMethod.WEB_METHODS;


//-----------------------------------------------------------------------------
// ServiceRequestSchema Plugins
//-----------------------------------------------------------------------------
ServiceRequestSchema.plugin(preValidate);
ServiceRequestSchema.plugin(legacy);
ServiceRequestSchema.plugin(actions);
ServiceRequestSchema.plugin(notification);
ServiceRequestSchema.plugin(open311);
ServiceRequestSchema.plugin(overview);
ServiceRequestSchema.plugin(performance);
ServiceRequestSchema.plugin(pipeline);
ServiceRequestSchema.plugin(work);
ServiceRequestSchema.plugin(duration);
ServiceRequestSchema.plugin(changelog);
ServiceRequestSchema.plugin(statistics);


//-----------------------------------------------------------------------------
// ServiceRequestSchema Statistics
//-----------------------------------------------------------------------------


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


/**
 * @name ServiceRequest
 * @description register ServiceRequestSchema and initialize ServiceRequest
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = model('ServiceRequest', ServiceRequestSchema);
