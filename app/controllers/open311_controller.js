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
const config = require('config');


//TODO update open311 discovery meta before release
//TODO add method to be OPEN311 REPORTER to be able to know the issue
//was submitted with open 311 compliant application
//check https://dev.hel.fi/apis/open311/
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
   * @description handle /services request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  services: function (request, response /*,next*/ ) {
    response.ok([{
      'service_code': '172',
      'service_name': 'Vandalism',
      'description': 'Give feedback if you find that property or equipment is broken.',
      'metadata': false,
      'type': 'realtime',
      'keywords': 'bench,parks,trashbins',
      'group': 'Sanitation'
    }]);
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
