'use strict';

/**
 * @module Party
 * @name Party
 * @description manage entity interaction (i.e Internal Worker, Customer 
 *              and Civilian) and their relaionship
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;
const irina = require('irina');
const Mail = require('byteskode-mailer');
const searchable = require('mongoose-fts');

//relation name
const RELATION_NAME_INTERNAL = 'Internal';
const RELATION_NAME_CUSTOMER = 'Customer';
const RELATION_NAME_CIVILIAN = 'Civilian';
const RELATION_NAME_AGENCY = 'Agency';

//relation types
const RELATION_TYPE_WORKER = 'Worker';
const RELATION_TYPE_INDIVIDUAL = 'Individual';
const RELATION_TYPE_ORGANIZATION = 'Organization';

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
      RELATION_NAME_AGENCY
    ]
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
      RELATION_TYPE_ORGANIZATION
    ]
  }

});


//Party Schema
const PartySchema = new Schema({

  //TODO add avatar

  /**
   * @name jurisdiction
   * @description A jurisdiction underwhich a party serving
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  jurisdiction: {
    type: ObjectId,
    ref: 'Jurisdiction',
    autoset: true,
    autopopulate: {
      select: 'code name domain'
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
    trim: true
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
    trim: true
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
    ref: 'Role',
    autoset: true,
    autopopulate: {
      select: 'name permissions'
    }
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
  }

}, {
  timestamps: true
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

  return permissions;

});


//-----------------------------------------------------------------------------
// PartySchema Plugins
//-----------------------------------------------------------------------------

//plugin irina for authentication workflows
PartySchema.plugin(irina, {
  registerable: {
    autoConfirm: true
  }
});

//plugin searchable to make party searchable
PartySchema.plugin(searchable, {
  fields: [
    'name', 'email', 'phone',
    'relation.name', 'relation.type'
  ],
  keywordsPath: 'keywords'
});


//-----------------------------------------------------------------------------
// PartySchema Hooks
//-----------------------------------------------------------------------------

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

  next();

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
  Mail.queue(email);

  //continue
  done();

};


//-----------------------------------------------------------------------------
// PartySchema Static Methods & Properties
//-----------------------------------------------------------------------------

//expose Party Relation Names
PartySchema.statics.RELATION_NAME_INTERNAL = RELATION_NAME_INTERNAL;
PartySchema.statics.RELATION_NAME_CUSTOMER = RELATION_NAME_CUSTOMER;
PartySchema.statics.RELATION_NAME_CIVILIAN = RELATION_NAME_CIVILIAN;
PartySchema.statics.RELATION_NAME_AGENCY = RELATION_NAME_AGENCY;
PartySchema.statics.RELATION_NAMES = [
  RELATION_NAME_INTERNAL,
  RELATION_NAME_CUSTOMER,
  RELATION_NAME_CIVILIAN,
  RELATION_NAME_AGENCY
];

//expose Party Relation Types
PartySchema.statics.RELATION_TYPE_WORKER = RELATION_TYPE_WORKER;
PartySchema.statics.RELATION_TYPE_INDIVIDUAL = RELATION_TYPE_INDIVIDUAL;
PartySchema.statics.RELATION_TYPE_ORGANIZATION = RELATION_TYPE_ORGANIZATION;
PartySchema.statics.RELATION_TYPES = [
  RELATION_TYPE_WORKER,
  RELATION_TYPE_INDIVIDUAL,
  RELATION_TYPE_ORGANIZATION
];


//-----------------------------------------------------------------------------
// PartySchema Analytics
//-----------------------------------------------------------------------------


//exports Party model
module.exports = mongoose.model('Party', PartySchema);
