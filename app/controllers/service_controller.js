'use strict';

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const Service = mongoose.model('Service');

/**
 * Service Controller
 *
 * @description :: Server-side logic for managing Service.
 */
module.exports = {
  /**
   * @function
   * @name services.index()
   * @description display a list of all services
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Service
      .list(request, function (error, results) {
        if (error) {
          next(error);
        } else {
          //map to legacy api
          results.services =
            _.map(results.services, function (service) {
              return Service.mapToLegacy(service);
            });
          response.ok(results);
        }
      });
  },


  /**
   * @function
   * @name services.create()
   * @description create a new service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    //support legacy
    let body = request.body;
    body = _.merge({}, body, {
      name: { en: body.name },
      description: { en: body.description || body.name },
      flags: { external: body.isExternal }
    });

    Service
      .create(body, function (error, service) {
        if (error) {
          next(error);
        } else {
          const _service = Service.mapToLegacy(service);
          response.created(_service);
        }
      });
  },


  /**
   * @function
   * @name services.show()
   * @description display a specific service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Service
      .show(request, function (error, service) {
        if (error) {
          next(error);
        } else {
          const _service = Service.mapToLegacy(service);
          response.ok(_service);
        }
      });
  },


  /**
   * @function
   * @name services.update()
   * @description update a specific service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    //support legacy
    let body = request.body;
    body = _.merge({}, body, {
      name: { en: body.name },
      description: { en: body.description || body.name },
      flags: { external: body.isExternal }
    });

    Service
      .findByIdAndUpdate(
        request.params.id,
        body, {
          upsert: true,
          new: true
        },
        function (error, service) {
          if (error) {
            next(error);
          } else {
            const _service = Service.mapToLegacy(service);
            response.ok(_service);
          }
        });
  },


  /**
   * @function
   * @name services.destroy()
   * @description delete a specific service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Service
      .findByIdAndRemove(
        request.params.id,
        function (error, service) {
          if (error) {
            next(error);
          } else {
            const _service = Service.mapToLegacy(service);
            response.ok(_service);
          }
        });
  }

};
