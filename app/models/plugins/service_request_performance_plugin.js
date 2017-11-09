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


//constants
const SUMMARIES = [
  'total', 'pending', 'resolved', 'unattended',
  'late', 'averageAttendTime', 'averageResolveTime'
];


module.exports = exports = function performance(schema /*, options*/ ) {

  //prepare aggregation facets

  const TOTAL_FACET = [{ //count all
    $count: 'total'
  }];


  const PENDING_FACET = [{ //count pending
    $match: {
      resolvedAt: { $eq: null }
    }
  }, {
    $count: 'pending'
  }];


  const RESOLVED_FACET = [{ //count resolved
    $match: {
      resolvedAt: { $ne: null }
    }
  }, {
    $count: 'resolved'
  }];


  const UNATTENDED_FACET = [{ //count that has been reported but not verified
    $match: {
      operator: { $eq: null }
    }
  }, {
    $count: 'unattended'
  }];


  const LATE_FACET = [{ //count that are past expected resolving date
      $match: {
        resolvedAt: { $ne: null },
        expectedAt: { $ne: null }
      }
    }, {
      $addFields: { // calculate late time
        late: { $subtract: ['$resolvedAt', '$expectedAt'] }
      }
    },
    {
      $project: {
        _id: 1,
        late: { $ifNull: ['$late', 0] }
      }
    }, {
      $match: {
        late: { $gt: 0 }
      }
    }, {
      $count: 'late'
    }
  ];


  const AVERAGE_ATTEND_TIME_FACET = [{ // calculate average attend time
    $group: {
      _id: null,
      averageAttendTime: { $avg: '$call.duration.milliseconds' }
    }
  }, {
    $project: {
      _id: 0,
      averageAttendTime: 1
    }
  }];


  const AVERAGE_RESOLVE_TIME_FACET = [{ // calculate average time to resolve(ttr)
    $group: {
      _id: null,
      averageResolveTime: { $avg: '$ttr.milliseconds' }
    }
  }, {
    $project: {
      _id: 0,
      averageResolveTime: 1
    }
  }];


  //TODO add escallated facet


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


  const JURISDICTION_FACET = [{ //count and group by jurisdiction
    $group: {
      _id: '$jurisdiction.name', //group and count by jurisdiction name
      color: { $first: '$jurisdiction.color' },
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      color: '$color',
      count: '$count'
    }
  }, { // re-shape to obtain jurisdiction, color & count
    $project: {
      _id: 0,
      name: 1,
      color: 1,
      count: 1
    }
  }, { //sort by count descending
    $sort: { count: -1 }
  }];


  const SERVICE_GROUP_FACET = [{ // count and group by service group
    $group: {
      _id: '$group.name', //group and count by service group name
      color: { $first: '$group.color' },
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      color: '$color',
      count: '$count'
    }
  }, { // re-shape to obtain group, color & count
    $project: {
      _id: 0,
      name: 1,
      color: 1,
      count: 1
    }
  }, { //sort by count ascending
    $sort: { name: 1 }
  }];


  const SERVICE_FACET = [{ //count and group by service
    $group: {
      _id: '$service.name', //group and count by service name
      color: { $first: '$service.color' },
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      color: '$color',
      count: '$count'
    }
  }, { // re-shape to obtain service, color & count
    $project: {
      _id: 0,
      name: 1,
      color: 1,
      count: 1
    }
  }, { //sort by count ascending
    $sort: { count: 1 }
  }];


  const STATUS_FACET = [{ //count and group by status
    $group: {
      _id: '$status.name', //group and count by status name
      weight: { $first: '$status.weight' },
      color: { $first: '$status.color' },
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      weight: '$weight',
      color: '$color',
      count: '$count'
    }
  }, { // re-shape to obtain status, color & count
    $project: {
      _id: 0,
      name: 1,
      color: 1,
      weight: 1,
      count: 1
    }
  }, { //sort by weight ascending
    $sort: { weight: 1 }
  }];


  const PRIORITY_FACET = [{ //count and group by priority
    $group: {
      _id: '$priority.name', //group and count by priority name
      weight: { $first: '$priority.weight' },
      color: { $first: '$priority.color' },
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      weight: '$weight',
      color: '$color',
      count: '$count'
    }
  }, { // re-shape to obtain priority, color & count
    $project: {
      _id: 0,
      name: 1,
      color: 1,
      weight: 1,
      count: 1
    }
  }, { //sort by weight ascending
    $sort: { weight: 1 }
  }];


  const OPERATOR_FACET = [{ //ensure attended(has operator)
    $match: {
      operator: { $ne: null }
    }
  }, { //count and group by operator
    $group: {
      _id: '$operator.name', //group and count by operator name
      relation: { $first: '$operator.relation' },
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      name: '$_id',
      relation: '$relation',
      count: '$count'
    }
  }, { // re-shape to obtain operator, color & count
    $project: {
      _id: 0,
      name: 1,
      relation: 1,
      count: 1
    }
  }, { //sort by count descending
    $sort: { count: -1 }
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
      .facet({
        total: TOTAL_FACET,
        pending: PENDING_FACET,
        resolved: RESOLVED_FACET,
        unattended: UNATTENDED_FACET,
        late: LATE_FACET,
        averageAttendTime: AVERAGE_ATTEND_TIME_FACET,
        averageResolveTime: AVERAGE_RESOLVE_TIME_FACET,
        workspaces: WORKSPACE_FACET,
        methods: METHOD_FACET,
        jurisdictions: JURISDICTION_FACET,
        groups: SERVICE_GROUP_FACET,
        services: SERVICE_FACET,
        statuses: STATUS_FACET,
        priorities: PRIORITY_FACET,
        operators: OPERATOR_FACET
      })
      .exec(function (error, performances) {

        //normalize results
        performances = [].concat(performances);
        performances = _.first(performances);


        //normalize
        _.forEach(performances, function (value, key) {

          if (_.indexOf(SUMMARIES, key) >= 0) {
            performances[key] = (_.first(value) || {})[key] || 0;
          }

        });

        //parse average resolve time
        performances.averageResolveTime =
          (performances.averageResolveTime > 0 ? performances.averageResolveTime :
            -performances.averageResolveTime);

        //parse to time units
        performances.averageResolveTime =
          parseMs(performances.averageResolveTime);

        //parse average attend time
        performances.averageAttendTime =
          (performances.averageAttendTime > 0 ? performances.averageAttendTime :
            -performances.averageAttendTime);

        //parse to time units
        performances.averageAttendTime =
          parseMs(performances.averageAttendTime);


        done(error, performances);

      });

  };

};
