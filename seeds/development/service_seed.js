'use strict';

//dependencies
const path = require('path');
const _ = require('lodash');
const jurisdictions = require(path.join(__dirname, 'jurisdiction_seed'));
const groups = require(path.join(__dirname, 'service_group_seed'));

/**
 * @description export service seeds
 * @return {Array} collection of service to seed
 */
module.exports = [{
  jurisdiction: jurisdictions[0],
  group: _.omit(groups[1], 'jurisdiction'),
  code: '5729',
  name: 'Lack of Water',
  description: 'Lack of Water related service request(issue)',
  color: '#960f1e'
}, {
  jurisdiction: jurisdictions[0],
  group: _.omit(groups[1], 'jurisdiction'),
  code: '6829',
  name: 'Leakage',
  description: 'Water Leakage related service request(issue)',
  color: '#d31dbb'
}, {
  jurisdiction: jurisdictions[0],
  group: _.omit(groups[0], 'jurisdiction'),
  code: '3168',
  name: 'Billing Enquiry',
  description: 'Billing Enquiry related service request(issue)',
  color: '#4d57b7'
}, {
  jurisdiction: jurisdictions[0],
  group: _.omit(groups[2], 'jurisdiction'),
  code: '5449',
  name: 'Request Other',
  description: 'Other related service request(issue)',
  color: '#c9d13c'
}];
