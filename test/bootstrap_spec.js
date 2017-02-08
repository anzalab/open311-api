'use strict';

//set environment to test
process.env.NODE_ENV = 'test';

//dependencies
const path = require('path');
const async = require('async');
const faker = require('faker');
const mongoose = require('mongoose');
require(path.join(__dirname, '..', 'app', 'application'));
const JWT = require(path.join(__dirname, '..', 'app', 'libs', 'jwt'));
const Party = mongoose.model('Party');

//enable mongoose query debug(log)
// mongoose.set('debug', true);


//setup party and jwt token
before(function (done) {

  async.waterfall([

    function registerParty(next) {

      Party
        .register({
          email: faker.internet.email(),
          password: faker.internet.password(),
          name: faker.internet.userName(),
          phone: faker.phone.phoneNumber()
        }, next);

    },

    function jwtEncodeParty(party, next) {

      JWT
        .encode(party, function (error, token) {
          next(error, {
            party: party,
            token: token
          });
        });

    }
  ], function (error, result) {

    this.token = result.token;
    this.party = result.party;

    done(error, result);

  }.bind(this));

});

// restore initial environment
after(function (done) {
  mongoose.connection.dropDatabase(done);
});
