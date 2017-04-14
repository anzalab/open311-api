'use strict';

/**
 * @name open311
 * @description controller to handle open311 compliant requests
 * @see {@link http://wiki.open311.org/GeoReport_v2/| GeoReporter V2}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const _ = require('lodash');
const config = require('config');
const mongoose = require('mongoose');
const Service = mongoose.model('Service');
const ServiceRequest = mongoose.model('ServiceRequest');

//TODO handle date & other open 311 filter on get request(s) status
//TODO handle specific client issues

module.exports = {
  /**
   * @name discovery
   * @description handle /discovery request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  discovery: function (request, response /*, next*/ ) {
    const _config = config.get('open311');
    response.ok(_config.discovery);
  },


  /**
   * @name services
   * @description handle /services request.
   * 
   *              It provides a list of all acceptable service request types 
   *              and their associated service codes.
   *
   * 
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  services: function (request, response, next) {
    //TODO filter per jurisdiction
    let criteria = {};

    Service
      .find(criteria)
      .exec(function (error, services) {
        if (error) {
          next(error);
        } else {
          //map services to open311 compliant service list
          services = _.map(services, function (service) {
            return service.toOpen311();
          });

          response.ok(services);
        }
      });
  },


  /**
   * @function
   * @name open311.index()
   * @description display a list of all service request in open311 compliant fomart
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    //TODO filter per jurisdiction
    //TODO filter per client
    let criteria = {};

    ServiceRequest
      .find(criteria)
      .exec(function (error, serviceRequests) {
        if (error) {
          next(error);
        } else {
          //map serviceRequests to open311 compliant serviceRequest list
          serviceRequests =
            _.map(serviceRequests, function (serviceRequest) {
              return serviceRequest.toOpen311();
            });

          response.ok(serviceRequests);
        }
      });
  },


  /**
   * @function
   * @name open311.create()
   * @description create a new service request from open311 compliant client
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    //TODO support media upload & media_url
    let serviceRequest = request.body;

    ServiceRequest
      .createFromOpen311Client(serviceRequest,
        function (error, open311Response /*, serviceRequest*/ ) {
          if (error) {
            next(error);
          } else {
            response.created(open311Response);
          }
        });
  },


  /**
   * @function
   * @name open311.show()
   * @description display a specific service request in open 311 compliant format
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    //obtain service request code
    const code = request.params.id;

    ServiceRequest
      .findOne({ code: code })
      .exec(function (error, serviceRequest) {
        if (error) {
          next(error);
        } else {
          response.ok([serviceRequest.toOpen311()]);
        }
      });
  }

};
