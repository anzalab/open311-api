'use strict';


/**
 * @name pipeline
 * @description build individual(s) party working pipeline report
 *              i.e service request count per status over specified period of
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
const mongoose = require('mongoose');

module.exports = exports = function pipeline(schema /*, options*/ ) {

  schema.statics.pipeline = function (criteria, done) {

    //refs
    const ServiceRequest = mongoose.model('ServiceRequest');
    const OPERATOR_FIELDS =
      ({ _id: 1, name: 1, email: 1, phone: 1, relation: 1, avatar: 1 });
    const STATUS_FIELDS = ({ _id: 1, name: 1, color: 1, weight: 1 });

    //count issue per service
    ServiceRequest
      .aggregated(criteria)
      .group({ //1. count and group by status and operator
        _id: {
          operator: '$operator._id',
          status: '$status.name.en',
        },

        //select status fields
        _status: { $first: '$status' },

        //select operator
        _operator: { $first: '$operator' },

        count: { $sum: 1 }
      })
      .project({ //2 stage: project only required fields
        _id: 1,
        count: 1,
        _operator: OPERATOR_FIELDS,
        _status: STATUS_FIELDS,
      })
      .project({ //3 stage: project full required documents
        _id: '$_id',
        party: '$_operator',
        status: '$_status',
        count: '$count'
      })
      .project({ _id: 0, party: 1, status: 1, count: 1 }) //TODO return expectedAt, resolvedAt to obtain lates
      .exec(function (error, pipelines) {

        //add label to pipelines
        pipelines = _.map(pipelines, function (pipeline) {
          const status = pipeline.status || {};

          pipeline.label = {
            name: (status.name || {}).en,
            color: status.color,
            weight: status.weight
          };

          return pipeline;

        });

        //min status weight
        let minStatusWeight =
          _.chain(pipelines).map('status.weight').min().value();
        minStatusWeight =
          (minStatusWeight > 0 ? -minStatusWeight : minStatusWeight);

        //calculate total reported per operator
        let operators = _.compact(_.map(pipelines, function (pipeline) {
          return pipeline.party ?
            pipeline.party._id.toString() : undefined;
        }));
        operators = _.uniq(operators);
        const totalReportedPerOperator = _.map(operators, function (_id) {
          //obtain operator object
          const operator = (_.find(pipelines, function (pipeline) {
            if (pipeline.party) {
              return (pipeline.party._id.toString() === _id);
            }
            return false;
          }) || {}).party || {};

          //filter pipelines per operator
          const pipelinesPerOperator =
            _.filter(pipelines, function (pipeline) {
              if (pipeline.party) {
                return (pipeline.party._id.toString() === _id);
              }
              return false;
            });

          //sum all pipelines to obtain total reported per operator
          const totalPerOperator =
            _.sumBy(pipelinesPerOperator, 'count');

          //return total reported
          return {
            party: operator,
            label: {
              name: 'Total',
              weight: minStatusWeight * 10000
            },
            count: totalPerOperator
          };

        });

        pipelines = [].concat(pipelines).concat(totalReportedPerOperator);

        done(error, pipelines);

      });

  };

};
