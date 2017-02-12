'use strict';

//dependencies


/**
 * @name jurisdiction
 * @description middleware to load & setup default values on every 
 *              http request.
 *
 * 				It is loaded before routers loaded and after all 
 * 				body parser middlewares.
 * 				
 * @param  {HttpRequest}   request  http request
 * @param  {HttpResponse}   response http response
 * @param  {Function} next     next http middleware to be invoked
 */
module.exports = function (request, response, next) {
  //TODO ensure default jurisdiction
  //TODO load defaults (priority, status) etc
  next();
};
