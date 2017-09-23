'use strict';

//dependencies
var mongoose = require('mongoose');
var _ = require('lodash');

/**
 * @description seed permissions and roles
 */
var permissions = [];

//grab all current models and build CRUD permissions
mongoose.modelNames().forEach(function (modelName) {

  var simpleName = modelName.toLowerCase();

  var isAllowed = (
    modelName !== 'Permisssion' &&
    modelName !== 'Party' &&
    modelName !== 'Log' &&
    modelName !== 'Email'
  );

  if (isAllowed) {
    //prepare model CRUD permissions
    permissions.push(
      //create permission
      {
        resource: modelName,
        action: 'create',
        description: 'Create ' + simpleName,
        wildcard: [simpleName, 'create'].join(':')
      },

      //read/view permission
      {
        resource: modelName,
        action: 'view',
        description: 'View ' + simpleName,
        wildcard: [simpleName, 'view'].join(':')
      },

      //update/edit permission
      {
        resource: modelName,
        action: 'edit',
        description: 'Edit ' + simpleName,
        wildcard: [simpleName, 'edit'].join(':')
      },

      //delete permission
      {
        resource: modelName,
        action: 'delete',
        description: 'Delete ' + simpleName,
        wildcard: [simpleName, 'delete'].join(':')
      });
  }
});


//prepare customer & User permissions
var additions = ['User'];
_.forEach(additions, function (modelName) {

  var simpleName = modelName.toLowerCase();

  //prepare addition model CRUD permissions
  permissions.push(
    //create permission
    {
      resource: modelName,
      action: 'create',
      description: 'Create ' + simpleName,
      wildcard: [simpleName, 'create'].join(':')
    },

    //read/view permission
    {
      resource: modelName,
      action: 'view',
      description: 'View ' + simpleName,
      wildcard: [simpleName, 'view'].join(':')
    },

    //update/edit permission
    {
      resource: modelName,
      action: 'edit',
      description: 'Edit ' + simpleName,
      wildcard: [simpleName, 'edit'].join(':')
    },

    //delete permission
    {
      resource: modelName,
      action: 'delete',
      description: 'Delete ' + simpleName,
      wildcard: [simpleName, 'delete'].join(':')
    });
});


//additions
permissions.push({
  resource: 'ServiceRequest',
  action: 'resolve',
  description: 'Resolve servicerequest',
  wildcard: ['servicerequest', 'resolve'].join(':')
});


/**
 * @description export permission seeder
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
module.exports = permissions;
