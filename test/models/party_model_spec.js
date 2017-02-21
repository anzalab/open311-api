'use strict';

/**
 * Party model specification
 *
 * @description :: Server-side model specification for Party
 */

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Party = mongoose.model('Party');
const Role = mongoose.model('Role');
const Permission = mongoose.model('Permission');
let roles;
let permissions;
let party;

describe('Party', function () {

  before(function (done) {

    permissions = [{
      action: faker.random.word(),
      resource: faker.random.word(),
    }, {
      action: faker.random.word(),
      resource: faker.random.word(),
    }];

    Permission.create(permissions, function (error, created) {
      permissions = created;
      done(error, created);
    });

  });


  before(function (done) {

    roles = [{
      name: faker.random.word(),
      description: faker.random.word(),
      permissions: permissions
    }, {
      name: faker.random.word(),
      description: faker.random.word(),
      permissions: permissions
    }];

    Role.create(roles, function (error, created) {
      roles = created;
      done(error, created);
    });

  });


  it('should be able to register a new party', function (done) {

    Party.register({
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(),
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
      roles: [].concat(roles)
    }, function (error, registered) {

      expect(error).to.not.exist;
      expect(registered).to.exist;
      expect(registered._id).to.exist;

      //assert
      expect(registered.email).to.exist;
      expect(registered.password).to.exist;
      expect(registered.phone).to.exist;
      expect(registered.roles).to.exist;
      expect(registered.relation).to.exist;
      expect(registered.relation.name)
        .to.be.equal(Party.RELATION_NAME_INTERNAL);
      expect(registered.relation.type)
        .to.be.equal(Party.RELATION_TYPE_WORKER);
      expect(registered.createdAt).to.exist;
      expect(registered.updatedAt).to.exist;

      party = registered;

      done(error, registered);
    });

  });

  it('should be able to populate party permissions', function (done) {

    Party
      .findById(party._id, function (error, found) {

        expect(found.permissions).to.exist;
        expect(found.permissions)
          .to.include.members(_.map(permissions, 'wildcard'));

        done(error, found);
      });

  });

  it('should be able to search party by its fields',
    function (done) {

      Party
        .search(party.email, function (error, results) {

          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results).to.have.length.above(0);

          //assert single result
          const found = results[0];
          expect(found.email).to.exist;
          expect(found.password).to.exist;
          expect(found.phone).to.exist;
          expect(found.roles).to.exist;
          expect(found.relation).to.exist;
          expect(found.relation.name)
            .to.be.equal(Party.RELATION_NAME_INTERNAL);
          expect(found.relation.type)
            .to.be.equal(Party.RELATION_TYPE_WORKER);
          expect(found.createdAt).to.exist;
          expect(found.updatedAt).to.exist;

          done(error, results);

        });
    });

  after(function (done) {
    Role.remove(done);
  });

  after(function (done) {
    Permission.remove(done);
  });

  after(function (done) {
    party.remove(done);
  });

});
