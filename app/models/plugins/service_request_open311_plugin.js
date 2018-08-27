'use strict';

/**
 * @name open311
 * @description extend a service request with open311 specifications
 *
 * @see {@link ServiceRequest}
 * @see {@link http://wiki.open311.org/GeoReport_v2/}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */

//global dependencies(or imports)
const path = require('path');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

//local dependencies(or imports)
const Media = require(path.join(__dirname, '..', 'schemas', 'media_schema'));

module.exports = exports = function open311(schema /*,options*/ ) {
  /**
   * @name toOpen311
   * @description convert service request instance to Open311 compliant schema
   * @return {Object} open311 compliant service request instance
   * @private
   * @since 0.1.0
   * @version 0.1.0
   * @type {Function}
   */
  schema.methods.toOpen311 = function () {
    /*jshint camelcase:false*/

    //TODO add all missing fields

    let as311 = {};

    //Unique id of the service request
    as311.service_request_id = this.code;

    //Explanation of why the status was changed to the current state
    //or more details on the current status than conveyed with status alone.
    //TODO make use of status description
    //TODO make use of latest public internal notice
    //TODO introduce status note when changin a status prompt for it
    as311.status_notes = _.get(this, 'status.name.en', '');

    //The human readable name of the service request type
    as311.service_name = _.get(this, 'service.name', '');

    //The unique identifier for the service request type
    as311.service_code = _.get(this, 'service.code', '');

    //The current status of the service request.
    as311.status = _.get(this, 'status.name.en', '');

    //A full description of the request or report submitted.
    as311.description = this.description;

    //The agency responsible for fulfilling or otherwise
    //addressing the service request.
    //TODO make use of current assignee
    as311.agency_responsible = _.get(this, 'jurisdiction.name', '');

    // Information about the action expected to fulfill the request or
    // otherwise address the information reported.
    as311.service_notice = '';

    // The date and time when the service request was made.
    as311.requested_datetime = this.createdAt;

    // The date and time when the service request was last modified.
    // For requests with status=closed, this will be the date the request was closed.
    as311.updated_datetime = this.updatedAt;

    //The date and time when the service request can be expected to be fulfilled.
    //This may be based on a service-specific service level agreement.
    as311.expected_datetime = this.expectedAt;

    //Human readable address or description of location.
    as311.address = this.address;

    //latitude using the (WGS84) projection.
    as311.lat = this.latitude;

    //longitude using the (WGS84) projection.
    as311.long = this.longitude;

    //A URL to media associated with the request, for example an image.
    if (!_.isEmpty(this.attachments)) {
      //TODO handle base 64 encoded images
      as311.media_url = (_.first(this.attachments) || {}).url;
    }

    //extras

    //service jurisdiction(or authority to where request presented)
    as311.jurisdiction = _.get(this, 'jurisdiction.name', '');

    //service group(or category)
    as311.group = _.get(this, 'group.name', '');

    //TODO reporter details
    // as311.reporter = _.get(this, 'reporter', '');

    /*jshint camelcase:true*/

    return as311;

  };

  /**
   * @name createFromOpen311Client
   * @description create a new service request from open 311 compliant client
   * @return {Object, ServiceRequest}  open 311 compliant issue create response
   *                                   & new instance of service request
   * @since 0.1.0
   * @version 0.1.0
   * @public
   * @type {Function}
   */
  schema.statics.createFromOpen311Client =
    function (serviceRequest, done) {

      //refs
      const ServiceRequest = this;
      const Service = mongoose.model('Service');

      //use open311 submitted method
      const CONTACT_METHOD_MOBILE_APP =
        (serviceRequest.method || ServiceRequest.CONTACT_METHOD_MOBILE_APP);

      async.waterfall([

        function ensureServiceExist(next) {
          /*jshint camelcase:false*/

          // find service by request code
          Service
            .findOne({ code: serviceRequest.service_code })
            .exec(function (error, service) {
              if (!service) {
                error = new Error('Service Not Found');
                error.status = 404;
              }

              next(error, service);
            });

          /*jshint camelcase:true*/
        },

        function createServiceRequest(service, next) {
          /*jshint camelcase:false*/

          //check for location presence
          let location;
          if (serviceRequest.long && serviceRequest.lat) {
            location = {
              coordinates: [serviceRequest.long, serviceRequest.lat]
            };
          }

          //prepare attachments
          //TODO support url fetch of remote image
          const mediaUrls = _.compact([].concat(serviceRequest.media_url));
          serviceRequest.attachments =
            _.map(mediaUrls, function (mediaUrl) {
              const attachment = {
                url: mediaUrl,
                name: 'Attachement',
                caption: serviceRequest.description,
                storage: Media.STORAGE_REMOTE
              };
              return attachment;
            });

          //prepare service request
          serviceRequest = {
            service: service,
            jurisdiction: serviceRequest.jurisdiction_id,
            reporter: {
              name: [serviceRequest.first_name,
                serviceRequest.last_name
              ].join(' '),
              phone: serviceRequest.phone,
              email: serviceRequest.email,
              account: serviceRequest.account_id
            },
            description: serviceRequest.description,
            address: serviceRequest.address_string,
            method: { name: CONTACT_METHOD_MOBILE_APP },
            location: location ? location : undefined,
            attachments: serviceRequest.attachments
          };

          /*jshint camelcase:false*/

          ServiceRequest.create(serviceRequest, next);
        },

        function prepareOpen311Response(serviceRequest, next) {
          /*jshint camelcase:false*/
          const open311Response = {
            service_request_id: serviceRequest.code,
            service_notice: '', //TODO return acknowledge
            account_id: serviceRequest.reporter.account
          };
          /*jshint camelcase:true*/
          next(null, [open311Response], serviceRequest);
        }

      ], done);

    };

};
