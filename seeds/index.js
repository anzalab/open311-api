'use strict';

//dependencies
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const Party = mongoose.model('Party');


function registerParties(role, done) {
  //default parties
  let parties = [{
    email: 'lallyelias87@gmail.com',
    password: 'open311@qwerty',
    name: 'Lally Elias',
    sipNumber: '1000',
    phone: '255714095061',
    roles: [role]
  }, {
    email: 'kbng.moses@gmail.com',
    password: 'open311@qwerty',
    name: 'Moses Kabungo',
    phone: '255753111039',
    roles: [role]
  }, {
    email: 'nadhiru.saidi@gmail.com',
    password: 'open311@qwerty',
    name: 'Nadhiru Saidi',
    phone: '255713970405',
    roles: [role]
  }, {
    email: 'emilrke@gmail.com',
    password: 'open311@qwerty',
    name: 'Emily Kimario',
    phone: '255713251899',
    roles: [role]
  }, {
    email: 'joachimm3@gmail.com',
    password: 'open311@qwerty',
    name: 'Joachim Mangilima',
    phone: '255713111111',
    roles: [role]
  }, {
    email: 'jeanbarroca@gmail.com',
    password: 'open311@qwerty',
    name: 'Jean Barroca',
    phone: '255765111111',
    roles: [role]
  }];

  parties = _.map(parties, function (party) {
    return function (next) {
      Party.register(party, next);
    };
  });

  async.parallel(parties, done);
}

//after data seeding logics
module.exports = function (done) {

  async.waterfall([
    function createRoles(next) {
      Role.findOne({
        name: 'Administrator'
      }, next);
    },
    function createParty(role, next) {
      registerParties(role, next);
    }
  ], done);

};
