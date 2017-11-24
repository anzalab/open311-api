'use strict';


/**
 * @name performance
 * @description build performance report per specified criteria.
 *              
 * @see {@link ServiceRequest}
 * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate}
 * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @return {Function} valid mongoose plugin
 */

//global dependencies(or import)
const _ = require('lodash');
const mongoose = require('mongoose');
const parseMs = require('parse-ms');


function normalizeTime(item) {

  //parse average resolve time
  item.averageResolveTime =
    (item.averageResolveTime > 0 ? item.averageResolveTime :
      -item.averageResolveTime);

  //parse to time units
  item.averageResolveTime =
    parseMs(item.averageResolveTime);

  //parse average attend time
  item.averageAttendTime =
    (item.averageAttendTime > 0 ? item.averageAttendTime :
      -item.averageAttendTime);

  //parse to time units
  item.averageAttendTime =
    parseMs(item.averageAttendTime);

  return item;

}


module.exports = exports = function performance(schema /*, options*/ ) {

  //overall stats facet

  const OVERALL_FACET = [{ //overall stats
    $group: {
      _id: null,
      pending: { $sum: '$pending' },
      resolved: { $sum: '$resolved' },
      late: { $sum: '$late' },
      unattended: { $sum: '$unattended' },
      count: { $sum: 1 },
      averageResolveTime: { $avg: '$ttr.milliseconds' },
      averageAttendTime: { $avg: '$call.duration.milliseconds' }
    }
  }, { // project name, color & stats
    $project: {
      _id: '$id',
      pending: '$pending',
      resolved: '$resolved',
      late: '$late',
      unattended: '$unattended',
      count: '$count',
      averageResolveTime: '$averageResolveTime',
      averageAttendTime: '$averageAttendTime'
    }
  }, { // re-shape to obtain overall stats
    $project: {
      _id: 0,
      name: 1,
      pending: 1,
      resolved: 1,
      late: 1,
      unattended: 1,
      count: 1,
      averageResolveTime: 1,
      averageAttendTime: 1
    }
  }];


  //jurisdictions performance stats facet

  const JURISDICTION_FACET = [{ //count and group by jurisdiction
    $group: {
      _id: '$jurisdiction._id',
      pending: { $sum: '$pending' },
      resolved: { $sum: '$resolved' },
      late: { $sum: '$late' },
      unattended: { $sum: '$unattended' },
      name: { $first: '$jurisdiction.name' },
      color: { $first: '$jurisdiction.color' },
      count: { $sum: 1 },
      averageResolveTime: { $avg: '$ttr.milliseconds' },
      averageAttendTime: { $avg: '$call.duration.milliseconds' }
    }
  }, { // project name, color & stats
    $project: {
      _id: '$_id',
      pending: '$pending',
      resolved: '$resolved',
      late: '$late',
      unattended: '$unattended',
      name: '$name',
      color: '$color',
      count: '$count',
      averageResolveTime: '$averageResolveTime',
      averageAttendTime: '$averageAttendTime'
    }
  }, { // re-shape to obtain jurisdiction, color & stats
    $project: {
      _id: 1,
      pending: 1,
      resolved: 1,
      late: 1,
      unattended: 1,
      name: 1,
      color: 1,
      count: 1,
      averageResolveTime: 1,
      averageAttendTime: 1
    }
  }, { //sort by count ascending
    $sort: { name: 1 }
  }];


  //service groups performance stats facet

  const SERVICE_GROUP_FACET = [{ // count and group by service group
    $group: {
      _id: '$group._id',
      pending: { $sum: '$pending' },
      resolved: { $sum: '$resolved' },
      late: { $sum: '$late' },
      unattended: { $sum: '$unattended' },
      name: { $first: '$group.name' },
      color: { $first: '$group.color' },
      count: { $sum: 1 },
      averageResolveTime: { $avg: '$ttr.milliseconds' },
      averageAttendTime: { $avg: '$call.duration.milliseconds' }
    }
  }, { // project name, color & stats
    $project: {
      _id: '$_id',
      pending: '$pending',
      resolved: '$resolved',
      late: '$late',
      unattended: '$unattended',
      name: '$name',
      color: '$color',
      count: '$count',
      averageResolveTime: '$averageResolveTime',
      averageAttendTime: '$averageAttendTime'
    }
  }, { // re-shape to obtain group, color & stats
    $project: {
      _id: 1,
      name: 1,
      pending: 1,
      resolved: 1,
      late: 1,
      unattended: 1,
      color: 1,
      count: 1,
      averageResolveTime: 1,
      averageAttendTime: 1
    }
  }, { //sort by count ascending
    $sort: { name: 1 }
  }];


  //services performance stats facet

  const SERVICE_FACET = [{ //count and group by service
    $group: {
      _id: '$service._id',
      pending: { $sum: '$pending' },
      resolved: { $sum: '$resolved' },
      late: { $sum: '$late' },
      unattended: { $sum: '$unattended' },
      name: { $first: '$service.name' },
      color: { $first: '$service.color' },
      count: { $sum: 1 },
      averageResolveTime: { $avg: '$ttr.milliseconds' },
      averageAttendTime: { $avg: '$call.duration.milliseconds' }
    }
  }, { // project name, color & stats
    $project: {
      _id: '$_id',
      pending: '$pending',
      resolved: '$resolved',
      late: '$late',
      unattended: '$unattended',
      name: '$name',
      color: '$color',
      count: '$count',
      averageResolveTime: '$averageResolveTime',
      averageAttendTime: '$averageAttendTime'
    }
  }, { // re-shape to obtain service, color & stats
    $project: {
      _id: 1,
      name: 1,
      pending: 1,
      resolved: 1,
      late: 1,
      unattended: 1,
      name: 1,
      color: 1,
      count: 1,
      averageResolveTime: 1,
      averageAttendTime: 1
    }
  }, { //sort by count ascending
    $sort: { name: 1 }
  }];


  //statuses(pipeline) performance stats facet

  const STATUS_FACET = [{ //count and group by status
    $group: {
      _id: '$status._id',
      name: { $first: '$status.name' },
      weight: { $first: '$status.weight' },
      color: { $first: '$status.color' },
      count: { $sum: 1 },
    }
  }, { // project name, color & stats
    $project: {
      _id: '$_id',
      name: '$name',
      color: '$color',
      weight: '$weight',
      count: '$count',
    }
  }, { // re-shape to obtain status, color & stats
    $project: {
      _id: 1,
      name: 1,
      color: 1,
      weight: 1,
      count: 1,
    }
  }, { //sort by count ascending
    $sort: { weight: 1 }
  }];


  const WORKSPACE_FACET = [{ // count and group by operator workspace
    $group: {
      _id: '$method.workspace', //group and count by workspace name
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      count: '$count'
    }
  }, { // re-shape to obtain group, color & count
    $project: {
      _id: 0,
      name: 1,
      count: 1
    }
  }, { //sort by count ascending
    $sort: { count: 1 }
  }];


  const METHOD_FACET = [{ // count and group by reporting method
    $group: {
      _id: '$method.name', //group and count by reporting method name
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      count: '$count'
    }
  }, { // re-shape to obtain group, color & count
    $project: {
      _id: 0,
      name: 1,
      count: 1
    }
  }, { //sort by count ascending
    $sort: { count: 1 }
  }];



  /**
   * @name performance
   * @description run performance aggregation facets
   * @param  {Object} [criteria] query criteria 
   * @param  {Function} done callback to invoke on success or failure
   * @return {Object}
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.1.0
   * @public
   * @function
   */
  schema.statics.performance = function (criteria, done) {

    //refs
    const ServiceRequest = mongoose.model('ServiceRequest');

    //run aggregation based on provided criteria
    ServiceRequest
      .aggregated(criteria)
      .append({ //add calculable fields
        $addFields: {
          late: {
            $subtract: [new Date(), '$expectedAt']
          }
        }
      })
      .append({ //add calculable fields
        $addFields: {
          late: { $ifNull: ['$late', 0] },
          unattended: { $ifNull: ['$operator', 0] },
          pending: { $ifNull: ['$resolvedAt', 0] }
        }
      })
      .append({ //add calculable fields
        $addFields: {
          late: {
            $cond: { if: { $gt: ['$late', 0] }, then: 1, else: 0 }
          },
          pending: {
            $cond: { if: { $eq: ['$pending', 0] }, then: 1, else: 0 }
          },
          resolved: {
            $cond: { if: { $ne: ['$pending', 0] }, then: 1, else: 0 }
          },
          unattended: {
            $cond: { if: { $eq: ['$unattended', 0] }, then: 1, else: 0 }
          }
        }
      })
      .facet({
        overall: OVERALL_FACET,
        jurisdictions: JURISDICTION_FACET,
        groups: SERVICE_GROUP_FACET,
        services: SERVICE_FACET,
        statuses: STATUS_FACET,
        workspaces: WORKSPACE_FACET,
        methods: METHOD_FACET
      })
      .exec(function (error, performances) {

        //normalize results
        performances = [].concat(performances);
        performances = _.first(performances);

        //normalize overalls
        performances.overall =
          _.map(performances.overall, normalizeTime);
        performances.overall = _.first(performances.overall);

        //normalize jurisdictions
        performances.jurisdictions =
          _.map(performances.jurisdictions, normalizeTime);

        //normalize groups
        performances.groups = _.map(performances.groups, normalizeTime);

        //normalize services
        performances.services = _.map(performances.services,
          normalizeTime);

        done(error, performances);

      });

  };

};
