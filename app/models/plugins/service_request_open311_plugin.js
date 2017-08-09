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

//dependencies
const async = require('async');
const mongoose = require('mongoose');


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
    as311.status_notes = this.status.name; //TODO make use of status description

    //The human readable name of the service request type
    as311.service_name = this.service.name;

    //The unique identifier for the service request type
    as311.service_code = this.service.code;

    //The current status of the service request.
    as311.status = this.status.name;

    //A full description of the request or report submitted.
    as311.description = this.description;

    //The agency responsible for fulfilling or otherwise
    //addressing the service request.
    as311.agency_responsible = '';

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
    as311.expected_datetime = '';

    //Human readable address or description of location.
    as311.address = this.address;

    //latitude using the (WGS84) projection.
    as311.lat = this.latitude;

    //longitude using the (WGS84) projection.
    as311.long = this.longitude;

    //A URL to media associated with the request, for example an image.
    as311.media_url = '';

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

      const CONTACT_METHOD_MOBILE_APP =
        ServiceRequest.CONTACT_METHOD_MOBILE_APP;

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
            location = [serviceRequest.long, serviceRequest.lat];
          }

          //prepare service request
          serviceRequest = {
            service: service,
            reporter: {
              name: [serviceRequest.first_name,
                serviceRequest.last_name
              ].join(''),
              phone: serviceRequest.phone,
              email: serviceRequest.email
            },
            description: serviceRequest.description,
            address: serviceRequest.address_string,
            method: CONTACT_METHOD_MOBILE_APP,
            location: location ? location : undefined
          };

          /*jshint camelcase:false*/

          ServiceRequest.create(serviceRequest, next);
        },

        function prepareOpen311Response(serviceRequest, next) {
          /*jshint camelcase:false*/
          const open311Response = {
            service_request_id: serviceRequest.code,
            service_notice: '' //TODO return acknowledge
          };
          /*jshint camelcase:true*/
          next(null, [open311Response], serviceRequest);
        }

      ], done);

    };

};