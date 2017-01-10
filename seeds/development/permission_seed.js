'use strict';

//dependencies
var mongoose = require('mongoose');
var _ = require('lodash');

/**
 * @description seed permissions and roles
 */
var permissions = [];

//grab all current models and build CRUD permissions
mongoose.modelNames().forEach(function(modelName) {

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
                wildcard: [modelName, 'create'].join(':')
            },

            //read/view permission
            {
                resource: modelName,
                action: 'view',
                description: 'View ' + simpleName,
                wildcard: [modelName, 'view'].join(':')
            },

            //update/edit permission
            {
                resource: modelName,
                action: 'edit',
                description: 'Edit ' + simpleName,
                wildcard: [modelName, 'edit'].join(':')
            },

            //delete permission
            {
                resource: modelName,
                action: 'delete',
                description: 'Delete ' + simpleName,
                wildcard: [modelName, 'delete'].join(':')
            });
    }
});


//prepare customer & User permissions
var additions = ['User', 'Customer'];
_.forEach(additions, function(modelName) {

    var simpleName = modelName.toLowerCase();

    //prepare addition model CRUD permissions
    permissions.push(
        //create permission
        {
            resource: modelName,
            action: 'create',
            description: 'Create ' + simpleName,
            wildcard: [modelName, 'create'].join(':')
        },

        //read/view permission
        {
            resource: modelName,
            action: 'view',
            description: 'View ' + simpleName,
            wildcard: [modelName, 'view'].join(':')
        },

        //update/edit permission
        {
            resource: modelName,
            action: 'edit',
            description: 'Edit ' + simpleName,
            wildcard: [modelName, 'edit'].join(':')
        },

        //delete permission
        {
            resource: modelName,
            action: 'delete',
            description: 'Delete ' + simpleName,
            wildcard: [modelName, 'delete'].join(':')
        });
});


/**
 * @description export permission seeder
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
module.exports = permissions;
