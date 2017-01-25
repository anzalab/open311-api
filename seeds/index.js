'use strict';

//dependencies
const async = require('async');
const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const Party = mongoose.model('Party');

//after data seeding logics
module.exports = function (done) {

  async.waterfall([
    function createRoles(next) {
      Role.findOne({
        name: 'Administrator'
      }, next);
    },
    function createParty(role, next) {
      Party.register({
        email: 'lallyelias87@gmail.com',
        password: 'open311@qwerty',
        name: 'Lally Elias',
        phone: '255714095061',
        roles: [role]
      }, next);
    }
  ], done);

};
