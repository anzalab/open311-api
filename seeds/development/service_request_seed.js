'use strict';


//dependencies
const path = require('path');
const _ = require('lodash');
const faker = require('faker');
const moment = require('moment');
const jurisdictions = require(path.join(__dirname, 'jurisdiction_seed'));
const services = require(path.join(__dirname, 'service_seed'));
const parties = require(path.join(__dirname, 'party_seed'));

/**
 * @description export service seeds
 * @return {Array} collection of service to seed
 */
module.exports = [{
  jurisdiction: jurisdictions[0],
  group: services[0].group,
  service: _.omit(services[0], 'jurisdiction'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  description: 'For three days now we dont have water',
  address: 'Mikocheni',
  createdAt: moment(new Date()).add(-1, 'd').toDate(),
  resolvedAt: new Date(),
  location: {
    coordinates: [
      Number(faker.address.longitude()),
      Number(faker.address.latitude())
    ]
  },
  call: {
    startedAt: moment(new Date()).add(-1, 'm').toDate(),
    endedAt: new Date()
  }
}, {
  jurisdiction: jurisdictions[1],
  group: services[1].group,
  service: _.omit(services[1], 'jurisdiction'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  description: 'There have been a leakage at my area. Lots of water in the street',
  address: 'Kijitonyama',
  createdAt: moment(new Date()).add(-2, 'd').toDate(),
  resolvedAt: new Date(),
  location: {
    coordinates: [
      Number(faker.address.longitude()),
      Number(faker.address.latitude())
    ]
  },
  call: {
    startedAt: moment(new Date()).add(-2, 'm').toDate(),
    endedAt: new Date()
  }
}, {
  jurisdiction: jurisdictions[2],
  group: services[2].group,
  service: _.omit(services[2], 'jurisdiction'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  description: 'I have not received my last month bill',
  address: 'Temeke - Mikoroshini',
  createdAt: moment(new Date()).add(-3, 'd').toDate(),
  location: {
    coordinates: [
      Number(faker.address.longitude()),
      Number(faker.address.latitude())
    ]
  },
  call: {
    startedAt: moment(new Date()).add(-3, 'm').toDate(),
    endedAt: new Date()
  }
}, {
  jurisdiction: jurisdictions[0],
  group: services[3].group,
  service: _.omit(services[3], 'jurisdiction', 'group'),
  reporter: _.omit(parties[0], 'jurisdiction'),
  operator: _.omit(parties[0], 'jurisdiction'),
  assignee: _.omit(parties[0], 'jurisdiction'),
  description: 'Too much sewage in city center roads',
  address: 'Posta Mpya',
  createdAt: moment(new Date()).add(-4, 'd').toDate(),
  location: {
    coordinates: [
      Number(faker.address.longitude()),
      Number(faker.address.latitude())
    ]
  },
  call: {
    startedAt: moment(new Date()).add(-4, 'm').toDate(),
    endedAt: new Date()
  }
}];
