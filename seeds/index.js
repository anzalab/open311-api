'use strict';

//dependencies
const async = require('async');
const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const Party = mongoose.model('Party');

//after data seeding logics
module.exports = function (results, done) {

  async.waterfall([
    function createRoles(next) {
      Role.findOneAndUpdate({
        name: 'Administrator'
      }, {
        name: 'Administrator',
        description: 'Administrator permissions',
        permissions: results.data
      }, {
        upsert: true,
        new: true
      }, next);
    },
    function createParty(role, next) {
      Party.register({
        email: 'lallyelias87@gmail.com',
        password: 'open311@qwerty',
        name: 'Lally Elias',
        phoneNumber: '255714095061',
        roles: [role]
      }, next);
    }
  ], done);

};
