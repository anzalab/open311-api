'use strict';

//dependencies


//parent jurisdiction
const jurisdiction = {
  code: '9545',
  name: 'DAWASCO HQ',
  domain: 'dawasco.org',
  about: 'Main office for Dar es salaam Water Supply Company(DAWASCO)'
};


/**
 * @description export jurisdictions seeds
 * @return {Array} collection of jurisdiction to seed
 */
module.exports = [jurisdiction, {
  jurisdiction: jurisdiction,
  code: '7729',
  name: 'DAWASCO Ilala',
  domain: 'ilala.dawasco.org',
  about: 'Ilala Area Office for Dar es salaam Water Supply Company(DAWASCO)'
}, {
  jurisdiction: jurisdiction,
  code: '3955',
  name: 'DAWASCO - Temeke',
  domain: 'temeke.dawasco.org',
  about: 'Ilala Area Office for Dar es salaam Water Supply Company(DAWASCO)'
}];
