'use strict';

const { FileTypes } = require('@lykmapipo/file');

/**
 * @name files
 * @description  common files fields for service request and changelog
 * @see {@link ServiceRequest}
 * @see {@link ChangeLog}
 *
 * @author lally elias<lallyelias87@gmail.com>
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */

module.exports = exports = {};

/**
 * @name image
 * @description Associated image for service request(issue).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.image = FileTypes.Image;

/**
 * @name audio
 * @description Associated audio for service request(issue).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.audio = FileTypes.Audio;

/**
 * @name video
 * @description Associated video for service request(issue).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.video = FileTypes.Video;

/**
 * @name document
 * @description Associated document for service request(issue).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.document = FileTypes.Document;
