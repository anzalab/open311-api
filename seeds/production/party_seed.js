'use strict';

//please dont abuse below parties details

//dependencies
const path = require('path');
const jurisdictions = require(path.join(__dirname, 'jurisdiction_seed'));

//TODO seed more

/**
 * @description export jurisdictions seeds
 * @return {Array} collection of jurisdiction to seed
 */
module.exports = [{
  jurisdiction: jurisdictions[0],
  name: 'Juma John',
  email: 'scala.lally@gmail.com',
  phone: '255765952971'
}];
