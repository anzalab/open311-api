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
const mongoose = require('mongoose');


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


  const SERVICE_GROUP_FACET = [{ // dount and group by service group
    $group: {
      _id: '$group.name', //group and count by service group name
      color: { $first: '$group.color' },
      count: { $sum: 1 }
    }
  }, { // project name, color & count
    $project: {
      group: '$_id',
      color: '$color',
      count: '$count'
    }
  }, { // re-shape to obtain group, color & count
    $project: {
      _id: 0,
      group: 1,
      color: 1,
      count: 1
    }
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
      status: '$_id',
      weight: '$weight',
      color: '$color',
      count: '$count'
    }
  }, { // re-shape to obtain status, color & count
    $project: {
      _id: 0,
      status: 1,
      color: 1,
      weight: 1,
      count: 1
    }
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
        groups: SERVICE_GROUP_FACET,
        statuses: STATUS_FACET
      })
      .exec(function (error, performances) {

        done(error, performances);

      });

  };

};
