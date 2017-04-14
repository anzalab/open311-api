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


//TODO update open311 discovery meta before release
//TODO add method to be OPEN311 REPORTER to be able to know the issue
//was submitted with open 311 compliant application
//check https://dev.hel.fi/apis/open311/
//https://dev.hel.fi/apis/open311/
//TODO improve documentation


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
   * @name requests
   * @description handle /requests request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  requests: function (request, response /*,next*/ ) {
    console.log(request.body);
    response.created([{
      'service_request_id': new Date().getTime(),
      'service_notice': ''
    }]);
  }

};
