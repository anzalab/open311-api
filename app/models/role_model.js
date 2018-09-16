'use strict';


/**
 * @module Role
 * @name Role
 * @description manage parties role(s).
 *
 *              It is a collection of permission(s) that are applicable to
 *              to a specific party(ies).
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const actions = require('mongoose-rest-actions');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


/**
 * @name RoleSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const RoleSchema = new Schema({

  /**
   * @name name
   * @description human readable name given to this role
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    searchable: true
  },


  /**
   * @name description
   * @description human readable additional explanation about this role
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  description: {
    type: String,
    trim: true,
    searchable: true
  },


  /**
   * @name permissions
   * @description permissions that constitute this role
   * @type {Object}
   * @private
   */
  permissions: [{
    type: ObjectId,
    ref: 'Permission',
    required: true,
    autopopulate: {
      select: 'resource wildcard description'
    }
  }]

}, {
  timestamps: true,
  emitIndexErrors: true
});


//-----------------------------------------------------------------------------
// RoleSchema Virtuals
//-----------------------------------------------------------------------------


/**
 * @name _assigned
 * @description obtain role permissions as a collection of role ids
 * @since 0.1.0
 * @version 0.1.0
 */
RoleSchema.virtual('_assigned').get(function () {

  //map permissions to collection of ids
  let permissions = _.chain(this.permissions).compact().uniq().map(function (
    permission) {
    return permission._id ? permission._id : permission;
  }).uniq().value();

  return permissions;

});


/**
 * @name _permissions
 * @description obtain role permissions as concatenated string
 * @since 0.1.0
 * @version 0.1.0
 */
RoleSchema.virtual('_permissions').get(function () {

  //map permissions object to strings
  let permissions = _.chain(this.permissions).compact().uniq().map(function (
    permission) {
    return permission.wildcard;
  }).uniq().value().join(', ');

  return permissions;

});


//-----------------------------------------------------------------------------
// RoleSchema Hooks
//-----------------------------------------------------------------------------


RoleSchema.pre('validate', function (next) {

  //ensure description
  if (!this.description) {
    this.description = [this.name, 'permissions'].join(' ');
  }

  next();

});


RoleSchema.plugin(actions);


/**
 * @name Role
 * @description register RoleSchema and initialize Role
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('Role', RoleSchema);
