'use strict';

const Reporter = require('./reporter_schema');
const ContactMethod = require('./contact_method_schema');
const Call = require('./call_schema');
const Media = require('./media_schema');
const Duration = require('./duration_schema');


/**
 * @name basic
 * @description Common basic fields for service request
 * @see {@link ServiceRequest}
 *
 * @author lally elias<lallyelias87@gmail.com>
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */

module.exports = exports = {};


/**
 * @name code
 * @description A unique human readable identifier of the service request(issue).
 *
 * It mainly used by reporter to query for status and progress of the
 * reported issue.
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.code = {
  type: String,
  trim: true,
  uppercase: true,
  required: true,
  index: true,
  unique: true,
  searchable: true,
  taggable: true
};


/**
 * @name reporter
 * @description A party i.e civilian, customer etc which reported an
 * issue(service request).
 *
 * @type {Object}
 * @see {@link Reporter}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.reporter = Reporter; //TODO refactor to party

/**
 * @name description
 * @description A detailed human readable explanation about the
 * service request(issue).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.description = {
  type: String,
  trim: true,
  required: true,
  index: true,
  searchable: true
};


/**
 * @name method
 * @description A communication(contact) method(mechanism) used by a reporter
 * to report the service request(issue).
 *
 * @type {Object}
 * @see {@link ContactMethod}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.method = ContactMethod;


/**
 * @name call
 * @description Log of call details used by a reporter to report
 * the service request(issue).
 *
 * @type {Object}
 * @see {@link Call}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @deprecated
 */
exports.call = Call;


/**
 * @name attachments
 * @description Associated file(s) with service request(issue)
 *
 * @type {Array}
 * @see {@link Media}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @deprecated
 */
exports.attachments = { // TODO: deprecate and use image, audio and video files
  type: [Media],
  index: true
};


/**
 * @name ttr
 * @description A time taken to resolve the service request(issue) in duration
 * format.
 *
 * Used to calculcate Mean Time To Resolve(MTTR) KPI.
 *
 * It calculated as time taken since the issue reported to the time when
 * service request(issue) resolved.
 *
 * @type {Object}
 * @see {@link Duration}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @see {@link http://www.thinkhdi.com/~/media/HDICorp/Files/Library-Archive/Insider%20Articles/mean-time-to-resolve.pdf}
 */
exports.ttr = Duration;

/**
 * @name changelogs
 * @description Associated change(s) on service request(issue)
 *
 * @type {Array}
 * @see {@link ChangeLog}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
