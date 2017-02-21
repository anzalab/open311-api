'use strict';


//dependencies
const path = require('path');
const _ = require('lodash');
const jurisdictions = require(path.join(__dirname, 'jurisdiction_seed'));
const services = require(path.join(__dirname, 'service_seed'));
const parties = require(path.join(__dirname, 'party_seed'));


/**
 * @description export service seeds
 * @return {Array} collection of service to seed
 */
module.exports = [{
  jurisdiction: jurisdictions[0],
  service: _.omit(services[0], 'jurisdiction', 'group'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  code: '1111',
  description: 'For three days now we dont have water',
  address: 'Mikocheni'
}, {
  jurisdiction: jurisdictions[0],
  service: _.omit(services[1], 'jurisdiction', 'group'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  code: '2222',
  description: 'There have been a leakage at my area. Lots of water in the street',
  address: 'Kijitonyama'
}, {
  jurisdiction: jurisdictions[0],
  service: _.omit(services[2], 'jurisdiction', 'group'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  code: '3333',
  description: 'I have not received my last month bill',
  address: 'Temeke - Mikoroshini'
}, {
  jurisdiction: jurisdictions[0],
  service: _.omit(services[3], 'jurisdiction', 'group'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  code: '4444',
  description: 'Too much sewage in city center roads',
  address: 'Posta Mpya'
}];
