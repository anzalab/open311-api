'use strict';


/**
 * @name work
 * @description build individual(s) party work report
 *              i.e service request counts over specified period of
 *              time.
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

module.exports = exports = function work(schema /*, options*/ ) {

  schema.statics.work = function (criteria, done) {

    //refs
    const ServiceRequest = mongoose.model('ServiceRequest');
    const OPERATOR_FIELDS =
      ({ _id: 1, name: 1, email: 1, phone: 1, relation: 1, avatar: 1 });

    //count issue per service
    ServiceRequest
      .aggregated(criteria)
      .group({ //1. count and group by operator
        _id: {
          operator: '$operator._id',
        },

        //select operator
        _operator: { $first: '$operator' },

        count: { $sum: 1 }
      })
      .project({ //2 stage: project only required fields
        _id: 1,
        count: 1,
        _operator: OPERATOR_FIELDS,
      })
      .project({ //3 stage: project full required documents
        _id: '$_id',
        party: '$_operator',
        count: '$count'
      })
      .project({ _id: 0, party: 1, status: 1, count: 1 })
      .exec(function (error, works) {

        //TODO merge date periods if available

        done(error, works);

      });

  };

};
