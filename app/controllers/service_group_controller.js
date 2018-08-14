'use strict';

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const ServiceGroup = mongoose.model('ServiceGroup');

/**
 * ServiceGroup Controller
 *
 * @description :: Server-side logic for managing ServiceGroup.
 */
module.exports = {
  /**
   * @function
   * @name servicegroups.index()
   * @description display a list of all servicegroups
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    ServiceGroup
      .list(request, function (error, results) {
        if (error) {
          next(error);
        } else {
          //map to legacy api
          results.servicegroups =
            _.map(results.servicegroups, function (servicegroup) {
              const _servicegroup = servicegroup.toObject();
              _servicegroup.name = servicegroup.name.en;
              _servicegroup.description = servicegroup.description.en;
              return _servicegroup;
            });
          response.ok(results);
        }
      });
  },


  /**
   * @function
   * @name servicegroups.create()
   * @description create a new servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    //support legacy
    let body = request.body;
    body = _.merge({}, body, {
      name: { en: body.name },
      description: { en: body.description || body.name }
    });

    ServiceGroup
      .create(body, function (error, servicegroup) {
        if (error) {
          next(error);
        } else {
          //support legacy
          const _servicegroup = servicegroup.toObject();
          _servicegroup.name = servicegroup.name.en;
          _servicegroup.description = servicegroup.description.en;
          response.created(_servicegroup);
        }
      });
  },


  /**
   * @function
   * @name servicegroups.show()
   * @description display a specific servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    ServiceGroup
      .show(request, function (error, servicegroup) {
        if (error) {
          next(error);
        } else {
          //support legacy
          const _servicegroup = servicegroup.toObject();
          _servicegroup.name = servicegroup.name.en;
          _servicegroup.description = servicegroup.description.en;
          response.ok(_servicegroup);
        }
      });
  },


  /**
   * @function
   * @name servicegroups.update()
   * @description update a specific servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    //support legacy
    let body = request.body;
    body = _.merge({}, body, {
      name: { en: body.name },
      description: { en: body.description || body.name }
    });

    ServiceGroup
      .findByIdAndUpdate(
        request.params.id,
        body, {
          upsert: true,
          new: true
        },
        function (error, servicegroup) {
          if (error) {
            next(error);
          } else {
            //support legacy
            const _servicegroup = servicegroup.toObject();
            _servicegroup.name = servicegroup.name.en;
            _servicegroup.description = servicegroup.description.en;
            response.ok(_servicegroup);
          }
        });
  },


  /**
   * @function
   * @name servicegroups.destroy()
   * @description delete a specific servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    ServiceGroup
      .findByIdAndRemove(
        request.params.id,
        function (error, servicegroup) {
          if (error) {
            next(error);
          } else {
            //support legacy
            const _servicegroup = servicegroup.toObject();
            _servicegroup.name = servicegroup.name.en;
            _servicegroup.description = servicegroup.description.en;
            response.ok(_servicegroup);
          }
        });
  }

};
