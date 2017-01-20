'use strict';

//dependencies
const async = require('async');
const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const Party = mongoose.model('Party');
// const permissions = require(path.join(__dirname, 'development', 'role_seed'));

//after data seeding logics
module.exports = function (done) {

  async.waterfall([
    function createRoles(next) {
      Role.findOneAndUpdate({
        name: 'Administrator'
      }, {
        name: 'Administrator',
        description: 'Administrator permissions',
        // permissions: permissions
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
        phone: '255714095061',
        roles: [role]
      }, next);
    }
  ], done);

};
