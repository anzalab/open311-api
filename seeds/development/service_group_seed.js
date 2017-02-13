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
  name: 'Commercial',
  code: '1111',
  description: 'Commercial related service request(issue)',
  color: '#06c947'
}, {
  jurisdiction: jurisdictions[0],
  name: 'Non Commercial',
  code: '2222',
  description: 'Non commercial related service request(issue)',
  color: '#960f1e'
}, {
  jurisdiction: jurisdictions[0],
  name: 'Other',
  code: '3333',
  description: 'Other related service request(issue)',
  color: '#c8b1ef'
}];
