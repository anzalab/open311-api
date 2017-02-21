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
  name: 'Lack of Water',
  code: '1111',
  description: 'Lack of Water related service request(issue)',
  color: '#960F1E'
}, {
  jurisdiction: jurisdictions[0],
  group: _.omit(groups[1], 'jurisdiction'),
  name: 'Leakage',
  code: '2222',
  description: 'Water Leakage related service request(issue)',
  color: '#D31DBB'
}, {
  jurisdiction: jurisdictions[0],
  group: _.omit(groups[0], 'jurisdiction'),
  name: 'Billing Enquiry',
  code: '3333',
  description: 'Billing Enquiry related service request(issue)',
  color: '#4D57B7'
}, {
  jurisdiction: jurisdictions[0],
  group: _.omit(groups[2], 'jurisdiction'),
  name: 'Request Other',
  code: '4444',
  description: 'Other related service request(issue)',
  color: '#C9D13C'
}];
