'use strict';

//dependencies
const path = require('path');
const permissions = require(path.join(__dirname, 'permission_seed'));

/**
 * @description export roles seeder
 * @return {Array}     roles
 */
module.exports = [{
  name: 'Administrator',
  description: 'Administrator',
  permissions: permissions
}];
