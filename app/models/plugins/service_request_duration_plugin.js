'use strict';


/**
 * @name duration
 * @description build individual(s) party work duration(call time or attending time)
 *              report
 *              i.e service request call duration over specified period of
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
const _ = require('lodash');
const parseMs = require('parse-ms');
const mongoose = require('mongoose');

module.exports = exports = function duration(schema /*, options*/ ) {

  schema.statics.duration = function (criteria, done) {

    //refs
    const ServiceRequest = mongoose.model('ServiceRequest');
    const OPERATOR_FIELDS =
      ({ _id: 1, name: 1, email: 1, phone: 1, relation: 1, avatar: 1 });

    //count issue per service
    ServiceRequest
      .lookup(criteria)
      .group({ //1. count and group by operator
        _id: {
          operator: '$operator._id',
        },

        //select operator
        _operator: { $first: '$operator' },

        //sum call duration ms
        duration: { $sum: '$call.duration.milliseconds' }
      })
      .project({ //2 stage: project only required fields
        _id: 1,
        duration: 1,
        _operator: OPERATOR_FIELDS,
      })
      .project({ //3 stage: project full required documents
        _id: '$_id',
        party: '$_operator',
        duration: '$duration'
      })
      .project({ _id: 0, party: 1, duration: 1 })
      .exec(function (error, durations) {

        //ensure positive durations
        durations = _.map(durations, function (duration) {
          duration.duration =
            (duration.duration >= 0 ? duration.duration : -duration.duration);
          return duration;
        });

        //parse duration(ms) to respective time units
        durations = _.map(durations, function (duration) {
          duration.duration = parseMs(duration.duration);
          return duration;
        });

        done(error, durations);

      });

  };

};
