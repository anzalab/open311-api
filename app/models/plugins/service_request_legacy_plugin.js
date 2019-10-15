'use strict';

const _ = require('lodash');
const { model } = require('@lykmapipo/mongoose-common');

/**
 * @function legacy
 * @name legacy
 * @description Legacy support for service request
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @return {Function} valid mongoose plugin
 */
module.exports = exports = function legacy(schema /*, options*/ ) {

  /**
   * @name longitude
   * @description obtain service request(issue) longitude
   * @type {Number}
   * @since 0.1.0
   * @version 0.1.0
   */
  schema.virtual('longitude').get(function () {
    return this.location && this.location.coordinates ?
      this.location.coordinates[0] : 0;
  });


  /**
   * @name latitude
   * @description obtain service request(issue) latitude
   * @type {Number}
   * @since 0.1.0
   * @version 0.1.0
   */
  schema.virtual('latitude').get(function () {
    return this.location && this.location.coordinates ?
      this.location.coordinates[1] : 0;
  });


  /**
   * @name changelogs
   * @description obtain service request(issue) changelogs
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   */
  schema.virtual('changelogs', {
    ref: 'ChangeLog',
    localField: '_id',
    foreignField: 'request',
    autopopulate: true
  });

  /**
   * @name mapToLegacy
   * @description map service request to legacy data structure
   * @param {Function} done  a callback to invoke on success or failure
   * @since  0.1.0
   * @version 0.1.0
   * @public
   * @type {Function}
   */
  schema.methods.mapToLegacy = function mapToLegacy() {
    const servicerequest = this;
    const object = this.toObject();
    if (servicerequest.group) {
      object.group.name =
        servicerequest.group.name.en;
    }
    if (servicerequest.service) {
      const Service = model('Service');
      const service = Service.mapToLegacy(servicerequest.service);
      object.service =
        _.pick(service, ['_id', 'code', 'name', 'color', 'group',
          'isExternal'
        ]);
    }
    if (servicerequest.priority) {
      object.priority.name =
        servicerequest.priority.name.en;
    }
    if (servicerequest.status) {
      object.status.name =
        servicerequest.status.name.en;
    }
    object.changelogs =
      _.map(servicerequest.changelogs, function (changelog) {
        const _changelog = changelog.toObject();
        if (changelog.priority) {
          _changelog.priority.name =
            changelog.priority.name.en;
        }
        if (changelog.status) {
          _changelog.status.name =
            changelog.status.name.en;
        }
        return _changelog;
      });
    // ensure locations(longitude & latitude)
    return object;
  };

};
