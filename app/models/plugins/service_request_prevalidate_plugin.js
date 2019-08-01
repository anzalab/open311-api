'use strict';


/**
 * @name preValidate
 * @function preValidate
 * @description service request pre validate logic
 * @see {@link ServiceRequest}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @return {Function} valid mongoose plugin
 * @public
 */

/* dependencies */
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const moment = require('moment');
const { Predefine } = require('@lykmapipo/predefine');
const {
  PREDEFINE_NAMESPACE_SERVICETYPE,
  PREDEFINE_BUCKET_SERVICETYPE,
} = require('@codetanzania/majifix-common');

/* @todo refactor */
/* @todo clear dead codes */

module.exports = exports = function preValidatePlugin(schema /*, options*/ ) {

  schema.methods.preValidate = function _preValidate(done) {

    //ref
    const Counter = mongoose.model('Counter');

    //compute expected time to resolve the issue
    //based on service level agreement
    if (!this.expectedAt && this.service) {
      //obtain sla expected time ttr
      const sla = _.get(this.service, 'sla.ttr');
      if (sla) {
        //compute time to when a service request(issue)
        //is expected to be resolve
        this.expectedAt =
          moment(this.createdAt).add(sla, 'hours').toDate(); //or h
      }
    }

    //compute time to resolve (ttr) in milliseconds
    if (this.resolvedAt) {

      //always ensure positive time diff
      let ttr = this.resolvedAt.getTime() - this.createdAt.getTime();

      //ensure resolve time is ahead of creation time
      this.resolvedAt =
        (ttr > 0 ? this.resolvedAt :
          this.resolvedAt = new Date((this.createdAt.getTime() + -(ttr)))
        );

      //ensure positive ttr
      ttr = ttr > 0 ? ttr : -(ttr);
      this.ttr = { milliseconds: ttr };

    }

    //ensure jurisdiction from service
    const jurisdiction = _.get(this.service, 'jurisdiction');
    if (!this.jurisdiction && jurisdiction) {
      this.jurisdiction = jurisdiction;
    }

    //ensure group from service
    const group = _.get(this.service, 'group');
    if (!this.group && group) {
      this.group = group;
    }

    //ensure type from service
    const type = _.get(this.service, 'type');
    if (!this.type && type) {
      this.type = type;
    }

    //ensure priority from service
    const priority = _.get(this.service, 'priority');
    if (!this.priority && priority) {
      this.priority = priority;
    }

    //set default status & priority if not set
    //TODO preload default status & priority
    //TODO find nearby jurisdiction using request geo data
    if (!this.status || !this.priority || !this.code || _.isEmpty(this.code)) {
      async.parallel({

        jurisdiction: function (next) {
          const Jurisdiction = mongoose.model('Jurisdiction');
          const id = _.get(this.jurisdiction, '_id', this.jurisdiction);
          Jurisdiction.findById(id, next);
        }.bind(this),

        group: function (next) {
          const ServiceGroup = mongoose.model('ServiceGroup');
          const id = _.get(this.group, '_id', this.group);
          ServiceGroup.findById(id, next);
        }.bind(this),

        type: function (next) {
          const id = _.get(this.type, '_id', this.type);
          const criteria = {
            _id: id,
            namespace: PREDEFINE_NAMESPACE_SERVICETYPE,
            bucket: PREDEFINE_BUCKET_SERVICETYPE,
          };
          Predefine.getOneOrDefault(criteria, next);
        }.bind(this),

        service: function (next) {
          const Service = mongoose.model('Service');
          const id = _.get(this.service, '_id', this.service);
          Service.findById(id, next);
        }.bind(this),

        status: function findDefaultStatus(next) {
          const Status = mongoose.model('Status');
          Status.findDefault(next);
        },

        priority: function findDefaultPriority(next) {
          const Priority = mongoose.model('Priority');
          Priority.findDefault(next);
        }
      }, function (error, result) {
        if (error) {
          return done(error);
        } else {

          //ensure jurisdiction & service
          if (!result.jurisdiction) {
            error = new Error('Jurisdiction Not Found');
            error.status = 400;
            return done(error);
          }

          //ensure service
          if (!result.service) {
            error = new Error('Service Not Found');
            error.status = 400;
            return done(error);
          }

          //set group, type, status and priority
          this.group =
            (result.group || this.group || undefined);
          this.type =
            (result.type || this.type || undefined);
          this.status =
            (this.status || result.status || undefined);
          this.priority =
            (this.priority || result.priority || undefined);

          //set service request code(ticket number)
          //in format (Area Code Service Code Year Sequence)
          //i.e ILLK170001
          if (_.isEmpty(this.code)) {
            Counter
              .generate({
                jurisdiction: result.jurisdiction.code,
                service: result.service.code,
              }, function (error, ticketNumber) {
                this.code = ticketNumber;
                return done(error, this);
              }.bind(this));

          }

          //continue
          else {
            return done(null, this);
          }

        }
      }.bind(this));

    }

    //continue
    else {
      return done(null, this);
    }

  };

};
