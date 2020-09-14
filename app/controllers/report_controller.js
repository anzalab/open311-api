'use strict';

/**
 * Report Controller
 *
 * @description :: Server-side logic for managing report controller.
 */

//dependencies
const _ = require('lodash');
const csv = require('csv');
const moment = require('moment');
const { model } = require('@lykmapipo/mongoose-common');
const ServiceRequest = model('ServiceRequest');

module.exports = {

  /**
   * @name standings
   * @description handle standings request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  standings: function (request, response, next) {
    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation pipelines from request(express-mquery)
    let criteria = _.merge({}, request.mquery);
    criteria = (criteria.filter || {});

    ServiceRequest
      .standings(criteria, function (error, standings) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(standings);
        }
      });
  },

  /**
   * @name overviews
   * @description handle overviews request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  overviews: function (request, response, next) {
    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation pipelines from request(express-mquery)
    let criteria = _.merge({}, request.mquery);
    criteria = (criteria.filter || {});

    ServiceRequest
      .overview(criteria, function (error, overviews) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(overviews);
        }
      });
  },



  /**
   * @name performances
   * @description handle performances request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  performances: function (request, response, next) {
    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation pipelines from request(express-mquery)

    let criteria = _.merge({}, request.mquery);
    criteria = (criteria.filter || {});

    ServiceRequest
      .performance(criteria, function (error, performances) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(performances);
        }
      });

  },


  /**
   * @name pipelines
   * @description handle pipelines request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  pipelines: function (request, response, next) {

    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation pipelines from request(express-mquery)
    let criteria = _.merge({}, request.mquery);
    criteria = (criteria.filter || {});

    ServiceRequest
      .pipeline(criteria, function (error, pipelines) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(pipelines);
        }
      });

  },


  /**
   * @name works
   * @description handle works request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  works: function (request, response, next) {

    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation works from request(express-mquery)
    let criteria = _.merge({}, request.mquery);
    criteria = (criteria.filter || {});

    ServiceRequest
      .work(criteria, function (error, works) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(works);
        }
      });

  },


  /**
   * @name durations
   * @description handle durations request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  durations: function (request, response, next) {

    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation durations from request(express-mquery)
    let criteria = _.merge({}, request.mquery);
    criteria = (criteria.filter || {});

    ServiceRequest
      .duration(criteria, function (error, durations) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(durations);
        }
      });

  },


  /**
   * @name exports
   * @description handle exports request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  export: function (request, response /*, next*/ ) {
    //TODO implement plugin for other models(schemas)

    //prepare criteria
    let criteria = _.merge({}, request.mquery);
    criteria = (criteria.filter || {});

    //prepare query cursor/stream
    const query =
      ServiceRequest.lookup(criteria).sort({ createdAt: -1 }).cursor();
    const serviceRequests = query.exec();

    //prepare file name
    const fileName = 'service_requests_exports_' + Date.now() + '.csv';

    // Set approrpiate download headers
    response.attachment(fileName);
    response.status(200);


    //stream service requests as csv
    serviceRequests
      .pipe(csv.transform(function (serviceRequest) {
        //TODO
        // Call Start Time Call End Time Call Duration(Minutes)  Call Duration(Seconds)
        // Time Taken(days)  Time Taken(hrs) Time Taken(mins)  Time Taken(secs)
        return {
          'Ticket Number': serviceRequest.code,
          'Reported Date': moment(serviceRequest.createdAt).toISOString(),
          'Reported Day': moment(serviceRequest.createdAt).format(
            'DD-MM-YYYY'),
          'Reported Time': moment(serviceRequest.createdAt).format(
            'HH:mm:ss'),
          'Reporter Name': _.get(serviceRequest, 'reporter.name', ''),
          'Reporter Phone': _.get(serviceRequest, 'reporter.phone', ''),
          'Reporter Account': _.get(serviceRequest, 'reporter.account',
            ''),
          'Operator': _.get(serviceRequest, 'operator.name',
            'Un-Attended'),
          'Area': _.get(serviceRequest, 'jurisdiction.name', ''),
          'Service Type': _.get(serviceRequest, 'type.name.en', ''),
          'Service Group': _.get(serviceRequest, 'group.name.en', ''),
          'Service': _.get(serviceRequest, 'service.name.en', ''),
          'Status': _.get(serviceRequest, 'status.name.en', ''),
          'Priority': _.get(serviceRequest, 'priority.name.en', ''),
          'Assignee': _.get(serviceRequest, 'assignee.name', ''),
          'Resolved Date': serviceRequest.resolvedAt ? moment(
            serviceRequest.resolvedAt).toISOString() : '',
          'Resolved Day': serviceRequest.resolvedAt ? moment(
            serviceRequest.resolvedAt).format(
            'DD-MM-YYYY') : '',
          'Resolved Time': serviceRequest.resolvedAt ? moment(
            serviceRequest.resolvedAt).format(
            'HH:mm:ss') : '',
          'Re-Opened Date': serviceRequest.reopenedAt ? moment(
            serviceRequest.reopenedAt).toISOString() : '',
          'Re-Opened Day': serviceRequest.reopenedAt ? moment(
            serviceRequest.reopenedAt).format(
            'DD-MM-YYYY') : '',
          'Re-Opened Time': serviceRequest.reopenedAt ? moment(
            serviceRequest.reopenedAt).format(
            'HH:mm:ss') : '',
          'Updated Date': serviceRequest.updatedAt ? moment(
            serviceRequest.updatedAt).toISOString() : '',
          'Contact Method': _.get(serviceRequest, 'method.name', ''),
          'Workspace': _.get(serviceRequest, 'method.workspace', ''),
          'Longitude': (serviceRequest.longitude || 0),
          'Latitude': (serviceRequest.latitude || 0),
          'Address': (serviceRequest.address || '').replace(/,/g, ';'),
          'Description': (serviceRequest.description || '').replace(
            /,/g, ';'),
          'Root Cause': _.get(serviceRequest, 'cause.name.en', '').replace(
            /,/g, ';'),
          'Action Taken': _.get(serviceRequest, 'measure.name.en', '').replace(
            /,/g, ';'),
          'Way Forward': _.get(serviceRequest, 'advisory.name.en', '').replace(
            /,/g, ';'),
        };

      }))
      .pipe(csv.stringify({ header: true }))
      .pipe(response);
  }

};
