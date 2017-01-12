'use strict';

//dependencies
const path = require('path');
const jurisdictions = require(path.join(__dirname, 'jurisdiction_seed'));


/**
 * @description export service group seeds
 * @return {Array} collection of service group to seed
 */
module.exports = [{
  jurisdiction: jurisdictions[0],
  code: '5829',
  name: 'Commercial',
  description: 'Commercial related service request(issue)',
  color: '#06c947'
}, {
  jurisdiction: jurisdictions[0],
  code: '3968',
  name: 'Non Commercial',
  description: 'Non commercial related service request(issue)',
  color: '#960f1e'
}, {
  jurisdiction: jurisdictions[0],
  code: '3968',
  name: 'Other',
  description: 'Other related service request(issue)',
  color: '#c8b1ef'
}];
