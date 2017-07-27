'use strict';


/**
 * @name aggregated
 * @description initialize service request aggregation pipeline with lookups.
 *              
 *              it aid in performing statistical operations on service request(s)
 *              as flat document.
 *              
 * @see {@link ServiceRequest}
 * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate}
 * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @return {Aggregate} instance of aggregate query builder
 */

//TODO make use of https://docs.mongodb.com/v3.4/reference/operator/aggregation/facet/

module.exports = exports = function aggregated(schema /*, options*/ ) {

  schema.statics.aggregated = function aggregated() {
    //this refer to service request static context


    //initialize service request aggregate query
    let aggregate = this.aggregate();


    /**
     * @description join jurisdiction
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
     */
    aggregate.lookup({
      from: 'jurisdictions',
      localField: 'jurisdiction',
      foreignField: '_id',
      as: 'jurisdiction'
    });
    aggregate.unwind('$jurisdiction');


    /**
     * @description join service group
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
     */
    aggregate.lookup({
      from: 'servicegroups',
      localField: 'group',
      foreignField: '_id',
      as: 'group'
    });
    aggregate.unwind('$group');


    /**
     * @description join service
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
     */
    aggregate.lookup({
      from: 'services',
      localField: 'service',
      foreignField: '_id',
      as: 'service'
    });
    aggregate.unwind('$service');


    /**
     * @description join operator
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
     */
    aggregate.lookup({
      from: 'parties',
      localField: 'operator',
      foreignField: '_id',
      as: 'operator'
    });
    aggregate.unwind({ //to allow no-operator service requests
      path: '$operator',
      preserveNullAndEmptyArrays: true
    });


    /**
     * @description join assignee
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
     */
    aggregate.lookup({
      from: 'parties',
      localField: 'assignee',
      foreignField: '_id',
      as: 'assignee'
    });
    aggregate.unwind({ //to allow no-assignee service requests
      path: '$assignee',
      preserveNullAndEmptyArrays: true
    });


    /**
     * @description join status
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
     */
    aggregate.lookup({
      from: 'status',
      localField: 'status',
      foreignField: '_id',
      as: 'status'
    });
    aggregate.unwind('$status');


    /**
     * @description join priority
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
     */
    aggregate.lookup({
      from: 'priorities',
      localField: 'priority',
      foreignField: '_id',
      as: 'priority'
    });
    aggregate.unwind('$priority');


    /**
     * @description allow disk usage for aggregation
     * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-allowDiskUse}
     */
    aggregate.allowDiskUse(true);


    //return aggregate query
    return aggregate;

  };

};
