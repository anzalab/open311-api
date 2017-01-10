'use strict';

/**
 * open311 Compliant Controller
 *
 * @description :: Server-side logic for open311 endpoints
 */

//dependencies


module.exports = {
  /**
   * @description handle /discovery request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  discovery: function (request, response /*, next*/ ) {
    response.ok({});
  }

};
