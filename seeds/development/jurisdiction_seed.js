'use strict';

//dependencies


//parent jurisdiction
const jurisdiction = {
  code: 'H',
  name: 'HQ',
  domain: 'dawasco.org',
  about: 'Main office for Dar es salaam Water Supply Company(DAWASCO)'
};


/**
 * @description export jurisdictions seeds
 * @return {Array} collection of jurisdiction to seed
 */
module.exports = [jurisdiction, {
  jurisdiction: jurisdiction,
  code: 'I',
  name: 'Ilala',
  domain: 'ilala.dawasco.org',
  about: 'Ilala Area Office for Dar es salaam Water Supply Company(DAWASCO)'
}, {
  jurisdiction: jurisdiction,
  code: 'T',
  name: 'Temeke',
  domain: 'temeke.dawasco.org',
  about: 'Temeke Area Office for Dar es salaam Water Supply Company(DAWASCO)'
}];
