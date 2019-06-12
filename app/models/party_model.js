'use strict';

/**
 * @module Party
 * @name Party
 * @description manage entity interaction (i.e Internal Worker, Customer
 *              and Civilian) and their relationship
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */

//dependencies
const path = require('path');
const _ = require('lodash');
const async = require('async');
const config = require('config');
const moment = require('moment');
const mongoose = require('mongoose');
const actions = require('mongoose-rest-actions');
const { formatPhoneNumberToE164 } = require('../libs/send');
const irina = require('irina');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

//relation name
const RELATION_NAME_INTERNAL = 'Internal';
const RELATION_NAME_CUSTOMER = 'Customer';
const RELATION_NAME_CIVILIAN = 'Civilian';
const RELATION_NAME_AGENCY = 'Agency';
const RELATION_NAME_APP = 'App';

//relation types
const RELATION_TYPE_WORKER = 'Worker';
const RELATION_TYPE_INDIVIDUAL = 'Individual';
const RELATION_TYPE_ORGANIZATION = 'Organization';
const RELATION_TYPE_APP = 'App';

//relation workspace
const RELATION_WORKSPACE_CALL_CENTER = 'Call Center';
const RELATION_WORKSPACE_CUSTOMER_CARE = 'Customer Care';
const RELATION_WORKSPACE_TECHNICIAN = 'Technician';
const RELATION_WORKSPACE_OTHER = 'Other';

const BASIC_FIELDS = ['_id', 'name', 'email', 'phone', 'relation'];


//PartyRelation Schema
const PartyRelation = new Schema({
  /**
   * @name name
   * @description name of relationship established
   *              e.g Customer, Employee, Civilian etc
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    index: true,
    default: RELATION_NAME_INTERNAL,
    enum: [
      RELATION_NAME_INTERNAL,
      RELATION_NAME_CUSTOMER,
      RELATION_NAME_CIVILIAN,
      RELATION_NAME_AGENCY,
      RELATION_NAME_APP
    ],
    searchable: true,
    taggable: true
  },


  /**
   * @name type
   * @description type of relation formed
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  type: {
    type: String,
    index: true,
    default: RELATION_TYPE_WORKER,
    enum: [
      RELATION_TYPE_WORKER,
      RELATION_TYPE_INDIVIDUAL,
      RELATION_TYPE_ORGANIZATION,
      RELATION_TYPE_APP
    ],
    searchable: true,
    taggable: true
  },

  /**
   * @name workspace
   * @description workspace of relation formed
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  workspace: {
    type: String,
    index: true,
    default: RELATION_WORKSPACE_OTHER,
    searchable: true,
    taggable: true
  }

}, { _id: false, id: false, timestamps: false, emitIndexErrors: true });


//Party Schema
const PartySchema = new Schema({

  /**
   * @name jurisdiction
   * @description A jurisdiction under which a party serving
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  jurisdiction: {
    type: ObjectId,
    ref: 'Jurisdiction',
    exists: true,
    autopopulate: {
      select: 'code name phone email domain'
    }
  },

  /**
   * @name zone
   * @description A zone(or branch, neighbourhood) which a party serving
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  zone: {
    type: ObjectId,
    ref: 'Predefine',
    exists: true,
    autopopulate: {
      select: 'code name'
    }
  },

  /**
   * @name name
   * @description human readable name used to identify a party
   *
   *              It may be a person full name, company name etc.
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    required: true,
    index: true,
    trim: true,
    searchable: true,
    taggable: true,
  },


  /**
   * @name avatar
   * @description A base64 encode party avatar content.
   *
   *              It may be a person photo, company logo etc.
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  avatar: { // TODO: migrate to image file
    type: String
  },


  /**
   * @name email
   * @description email address for this party
   *
   *              It is currently provided by irina module
   *              @see {@link https://github.com/lykmapipo/irina}
   *              //TODO handle alternate email
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  // email: String


  /**
   * @name phone
   * @description valid existing phone number that can be used to contact
   *              a party directly
   *              //TODO handle alternate phone
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    searchable: true,
    taggable: true
  },


  /**
   * @name sipNumber
   * @description valid soft phone number for the party. Mainly used for
   *              parties that operate a call center
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  sipNumber: {
    type: String,
    // required: true,
    // unique: true,
    trim: true,
    searchable: true,
    taggable: true
  },


  /**
   * @name pushToken
   * @description valid latest push registration tokn for the party. Mainly
   * used to send push notifications to mobile device.
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  pushToken: {
    type: String,
    // required: true,
    // unique: true,
    trim: true,
    searchable: true,
    taggable: true
  },


  /**
   * @name roles
   * @description roles that played by this party
   *
   *              Mainly used internal in an organization that use open311 to
   *              differentiate different roles played by employees and others
   *
   * @type {Array}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  roles: [{
    type: ObjectId,
    ref: 'Role'
  }],


  /**
   * @name relation
   * @description form of relationship a party established with open311
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  relation: {
    type: PartyRelation,
    index: true
  },

  /**
   * @name token
   * @description valid api token for the party.
   *
   *              Mainly used for parties that operate as client
   *              i.e mobile apps etc
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  token: {
    type: String,
    trim: true
  },

}, {
  timestamps: true,
  emitIndexErrors: true
});


//-----------------------------------------------------------------------------
// PartySchema Virtuals
//-----------------------------------------------------------------------------


/**
 * @name permissions
 * @description granted permissions of this party
 * @type {Array<String>}
 * @since 0.1.0
 * @version 0.1.0
 */
PartySchema.virtual('permissions').get(function () {

  let permissions = _.chain(this.roles).compact().map(function (role) {

    //map roles to permission wildcard
    if (role.permissions) {
      return _.chain(role.permissions).compact().map(function (
        permission) {
        return permission.wildcard ? permission.wildcard :
          undefined;
      }).compact().uniq().value();
    } else {
      return undefined;
    }

  }).compact().flatten().uniq().value();

  permissions = !_.isEmpty(permissions) ? permissions : undefined;

  return permissions;

});


/**
 * @name isApp
 * @description check if current party is an application
 * @type {Boolean}
 * @since 0.1.0
 * @version 0.1.0
 */
PartySchema.virtual('isApp').get(function () {

  //obtain party relation
  const relation = this.relation || {};

  //ensure RELATION_NAME_APP and RELATION_TYPE_APP
  const isApp = (relation && relation.name && relation.type) &&
    (relation.name === RELATION_NAME_APP) &&
    (relation.type === RELATION_TYPE_APP);

  return isApp;

});


//-----------------------------------------------------------------------------
// PartySchema Hooks
//-----------------------------------------------------------------------------


/**
 * @type {Function}
 * @description ensure default party details
 * @param  {Function} done a callback to invoke on success or error
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
PartySchema.pre('validate', function (next) {

  //default relation
  if (!this.relation) {
    this.relation = {};
  }

  if (!this.relation.name) {
    this.relation.name = RELATION_NAME_INTERNAL;
  }

  if (!this.relation.type) {
    this.relation.type = RELATION_TYPE_WORKER;
  }

  // format phone to E.164
  this.phone = formatPhoneNumberToE164(this.phone);

  next();

});


/**
 * @type {Function}
 * @description ensure API token for app parties
 * @param  {Function} done a callback to invoke on success or error
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
PartySchema.pre('save', function (next) {

  //import jwt helpers
  const JWT = require(path.join(__dirname, '..', 'libs', 'jwt'));

  //obtain api token options
  const options = config.get('token') || {};

  if (this.isApp) {
    JWT
      .encode(this, options, function (error, jwtToken) {
        if (error || !jwtToken) {
          error = error ? error : new Error('Fail To Generate API Token');
          error.status = 500;
          next(error);
        } else {
          this.token = jwtToken;
          next(null, this);
        }
      }.bind(this)); //ensure party instance context
  } else {
    next();
  }

});


//-----------------------------------------------------------------------------
// PartySchema Instance Methods
//-----------------------------------------------------------------------------

/**
 * @type {Function}
 * @description send party notifications
 * @param  {String}   type          a type of notification
 * @param  {Party}   authenticable   current party
 * @param  {Function} done          a callback to invoke on success or error
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
PartySchema.methods.send = function (type, authenticable, done) {

  let email;

  //if we send account confirmation
  if (type === 'Account confirmation') {
    email = {
      recipientName: authenticable.name,
      token: authenticable.confirmationToken,
      to: authenticable.email,
      subject: 'Account confirmation',
      type: 'confirm'
    };
  }

  //if we send account recovery
  if (type === 'Password recovery') {
    email = {
      recipientName: authenticable.name,
      token: authenticable.recoveryToken,
      to: authenticable.email,
      subject: 'Account Recovery',
      type: 'recover'
    };
  }

  //if we send account locked information
  if (type === 'Account recovery') {
    email = {
      recipientName: authenticable.name,
      token: authenticable.unlockToken,
      to: authenticable.email,
      subject: 'Account Locked',
      type: 'unlock'
    };
  }

  //queue email for later send
  // Mail.queue(email);

  //continue
  done();

};


/**
 * @name jurisdictions
 * @type {Function}
 * @description load party jurusdictions
 * @param  {Function} done a callback to invoke on success or error
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
PartySchema.methods.jurisdictions = function (done) {
  //refs
  const Jurisdiction = mongoose.model('Jurisdiction');

  //does party have jurisdiction
  const hasJurisdiction = (this.jurisdiction && this.jurisdiction._id);

  if (hasJurisdiction) {
    //fetch all party jurisdictions
    const criteria = {
      $or: [{ //fetch party assigned jurisdiction
        _id: this.jurisdiction._id
      }, { //fetch party assigned jurisdiction children
        jurisdiction: this.jurisdiction._id
      }]
    };

    //query party jurisdictions
    Jurisdiction
      .find(criteria, function (error, jurisdictions) {
        done(error, jurisdictions);
      });

  } else {
    done(null, []);
  }
};


//-----------------------------------------------------------------------------
// PartySchema Static Methods & Properties
//-----------------------------------------------------------------------------

PartySchema.statics.MODEL_NAME = 'Party';

//expose Party Relation Names
PartySchema.statics.RELATION_NAME_INTERNAL = RELATION_NAME_INTERNAL;
PartySchema.statics.RELATION_NAME_CUSTOMER = RELATION_NAME_CUSTOMER;
PartySchema.statics.RELATION_NAME_CIVILIAN = RELATION_NAME_CIVILIAN;
PartySchema.statics.RELATION_NAME_AGENCY = RELATION_NAME_AGENCY;
PartySchema.statics.RELATION_NAME_APP = RELATION_NAME_APP;
PartySchema.statics.RELATION_NAMES = [
  RELATION_NAME_INTERNAL,
  RELATION_NAME_CUSTOMER,
  RELATION_NAME_CIVILIAN,
  RELATION_NAME_AGENCY,
  RELATION_NAME_APP
];

//expose Party Relation Types
PartySchema.statics.RELATION_TYPE_WORKER = RELATION_TYPE_WORKER;
PartySchema.statics.RELATION_TYPE_INDIVIDUAL = RELATION_TYPE_INDIVIDUAL;
PartySchema.statics.RELATION_TYPE_ORGANIZATION = RELATION_TYPE_ORGANIZATION;
PartySchema.statics.RELATION_TYPE_APP = RELATION_TYPE_APP;
PartySchema.statics.RELATION_TYPES = [
  RELATION_TYPE_WORKER,
  RELATION_TYPE_INDIVIDUAL,
  RELATION_TYPE_ORGANIZATION,
  RELATION_TYPE_APP
];


//expose Party Relation Workspaces
PartySchema.statics.RELATION_WORKSPACE_CALL_CENTER =
  RELATION_WORKSPACE_CALL_CENTER;
PartySchema.statics.RELATION_WORKSPACE_CUSTOMER_CARE =
  RELATION_WORKSPACE_CUSTOMER_CARE;
PartySchema.statics.RELATION_WORKSPACE_TECHNICIAN =
  RELATION_WORKSPACE_TECHNICIAN;
PartySchema.statics.RELATION_WORKSPACE_OTHER =
  RELATION_WORKSPACE_OTHER;
PartySchema.statics.RELATION_WORKSPACES = [
  RELATION_WORKSPACE_CALL_CENTER,
  RELATION_WORKSPACE_CUSTOMER_CARE,
  RELATION_WORKSPACE_TECHNICIAN,
  RELATION_WORKSPACE_OTHER
];


//-----------------------------------------------------------------------------
// PartySchema Analytics
//-----------------------------------------------------------------------------

//TODO refactor to performannce plugin
PartySchema.statics.works = function (options, done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //normalize results
  const normalize = function (work, length) {
    //merge default
    work = _.merge({}, {
      startedAt: options[length].startedAt,
      endedAt: options[length].endedAt,
      party: options.party,
      count: 0
    }, _.first(work));

    return work;

  };

  async.parallel({
    //1. compute total day work(service requests count)
    day: function (next) {
      const startedAt = options.day.startedAt;
      const endedAt = options.day.endedAt;
      ServiceRequest
        .work({
          operator: options.party._id,
          createdAt: {
            $gt: startedAt,
            $lte: endedAt
          }
        }, function (error, work) {
          if (error) {
            next(error);
          } else {
            next(null, normalize(work, 'day'));
          }
        });
    },

    //2. compute total week work(service requests count)
    week: function (next) {
      const startedAt = options.week.startedAt;
      const endedAt = options.week.endedAt;
      ServiceRequest
        .work({
          operator: options.party._id,
          createdAt: {
            $gt: startedAt,
            $lte: endedAt
          }
        }, function (error, work) {
          if (error) {
            next(error);
          } else {
            next(null, normalize(work, 'week'));
          }
        });
    },

    //3. compute month work(service requests count)
    month: function (next) {
      const startedAt = options.month.startedAt;
      const endedAt = options.month.endedAt;
      ServiceRequest
        .work({
          operator: options.party._id,
          createdAt: {
            $gt: startedAt,
            $lte: endedAt
          }
        }, function (error, work) {
          if (error) {
            next(error);
          } else {
            next(null, normalize(work, 'month'));
          }
        });
    }
  }, done);

};


//TODO refactor
PartySchema.statics.durations = function (options, done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //normalize results
  const normalize = function (duration, length) {
    //merge default
    duration = _.merge({}, {
      startedAt: options[length].startedAt,
      endedAt: options[length].endedAt,
      party: options.party,
      duration: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      }
    }, _.first(duration));

    return duration;

  };

  async.parallel({
    //1. compute total day work duration
    day: function (next) {
      const startedAt = options.day.startedAt;
      const endedAt = options.day.endedAt;
      ServiceRequest
        .duration({
          operator: options.party._id,
          createdAt: {
            $gt: startedAt,
            $lte: endedAt
          }
        }, function (error, duration) {
          if (error) {
            next(error);
          } else {
            next(null, normalize(duration, 'day'));
          }
        });
    },

    //2. compute total week work duration
    week: function (next) {
      const startedAt = options.week.startedAt;
      const endedAt = options.week.endedAt;
      ServiceRequest
        .duration({
          operator: options.party._id,
          createdAt: {
            $gt: startedAt,
            $lte: endedAt
          }
        }, function (error, duration) {
          if (error) {
            next(error);
          } else {
            next(null, normalize(duration, 'week'));
          }
        });
    },

    //3. compute month work duration
    month: function (next) {
      const startedAt = options.month.startedAt;
      const endedAt = options.month.endedAt;
      ServiceRequest
        .duration({
          operator: options.party._id,
          createdAt: {
            $gt: startedAt,
            $lte: endedAt
          }
        }, function (error, duration) {
          if (error) {
            next(error);
          } else {
            next(null, normalize(duration, 'month'));
          }
        });
    }
  }, done);

};

PartySchema.statics.performances = function (options, done) {
  //TODO refactor using aggregations
  //TODO refactor to model plugin
  //@see https://docs.mongodb.com/manual/reference/operator/aggregation/facet/

  //refs
  const Party = mongoose.model('Party');
  const ServiceRequest = mongoose.model('ServiceRequest');

  //prepare date range filtes
  const filters = {
    day: {
      startedAt: moment().utc().startOf('date').toDate(),
      endedAt: moment().utc().endOf('date').toDate(),
    },
    week: {
      startedAt: moment().utc().startOf('week').toDate(),
      endedAt: moment().utc().endOf('week').toDate(),
    },
    month: {
      startedAt: moment().utc().startOf('month').toDate(),
      endedAt: moment().utc().endOf('month').toDate(),
    }
  };

  //compute performance reports
  const works = function (party, then) {

    async.parallel({

      //3.0 pick basic party details
      party: function (after) {
        const basic = _.pick(party, BASIC_FIELDS);
        after(null, basic);
      },

      //3.1 compute pipeline
      pipelines: function (after) {
        const criteria = { operator: party._id };
        ServiceRequest.pipeline(criteria, after);
      },

      //3.2 compute work durations
      durations: function (after) {
        //compute day, week, month durations
        const options =
          (_.merge({}, { party: _.pick(party, BASIC_FIELDS) },
            filters));
        Party.durations(options, after);
      },

      //3.3 compute service requests counts
      works: function (after) {
        //compute day, week, month service request counts
        //compute day, week, month durations
        const options =
          (_.merge({}, { party: _.pick(party, BASIC_FIELDS) },
            filters));
        Party.works(options, after);
      },

      //compute party workspace leaderboard
      leaderboard: function (after) {

        //TODO ensure are only of party workspace
        ServiceRequest.work({
          'method.workspace': party.relation.workspace
        }, function (error, leaderboards) {
          // order leader board desc
          leaderboards = _.orderBy(leaderboards, 'count', 'desc');
          after(error, leaderboards);
        });

      }
    }, then);

  };

  async.waterfall([

    //1. loading full party instance
    function preLoadParty(next) {
      //obtain party id
      const _id = _.get(options, 'party._id', options.party);
      Party.findById(_id, next);
    },

    //2. obtain performance reports in parallel
    works

  ], done);

};


/**
 * @name getPhones
 * @function getPhones
 * @description pull distinct party phones
 * @param {Object} [criteria] valid query criteria
 * @param {function} done a callback to invoke on success or error
 * @return {String[]|Error}
 * @since 0.1.0
 * @version 0.1.0
 * @static
 */
PartySchema.statics.getPhones = function getPhones(criteria, done) {

  //refs
  const Party = this;

  //normalize arguments
  const _criteria = _.isFunction(criteria) ? {} : _.merge({}, criteria);
  const _done = _.isFunction(criteria) ? criteria : done;

  Party
    .find(_criteria)
    .distinct('phone')
    .exec(function onGetPhones(error, phones) {
      if (!error) {
        phones = _.uniq(_.compact([].concat(phones)));
      }
      return _done(error, phones);
    });

};


//-----------------------------------------------------------------------------
// PartySchema Plugins
//-----------------------------------------------------------------------------

//plugin irina for authentication workflows
PartySchema.plugin(irina, {
  registerable: {
    autoConfirm: true
  }
});
PartySchema.plugin(actions);


//exports Party model
module.exports = mongoose.model('Party', PartySchema);
