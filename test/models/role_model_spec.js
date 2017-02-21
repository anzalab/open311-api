'use strict';

/**
 * Role model specification
 *
 * @description :: Server-side model specification for Role
 */

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Permission = mongoose.model('Permission');
const Role = mongoose.model('Role');
let role;
let permissions;

describe('Role', function () {

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

  it('should be able to create new role', function (done) {

    role = {
      name: faker.random.word(),
      description: faker.random.word(),
      permissions: permissions
    };

    Role
      .create(role, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;

        expect(created.name).to.be.equal(role.name);
        expect(created.description).to.exist;
        expect(created.permissions).to.have.length(2);

        role = created;

        done(error, created);
      });

  });


  it('should be able to find existing role', function (done) {

    Role
      .findById(role._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        expect(found._id).to.exist;
        expect(found._id).to.eql(role._id);

        expect(found.name).to.be.equal(role.name);
        expect(found.description).to.be.equal(role.description);
        expect(found.permissions).to.have.length(2);

        done(error, found);
      });

  });


  it('should be able to update existing role', function (done) {

    const updates = {
      description: faker.random.word()
    };

    Role
      .findByIdAndUpdate(role._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated._id).to.be.eql(role._id);

        expect(updated.name).to.be.equal(role.name);
        expect(updated.description).to.be.equal(updates.description);
        expect(updated.permissions).to.have.length(2);


        //update role references
        role = updated;

        done(error, updated);
      });
  });


  it('should be able to list existing roles', function (done) {

    Role
      .paginate({
        page: 1,
        limit: 10
      }, function (error, roles, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(roles).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, roles);
      });

  });


  it('should be able to delete existing role', function (done) {

    Role
      .findByIdAndRemove(role._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed._id).to.be.eql(role._id);

        expect(removed.name).to.be.equal(role.name);
        expect(removed.description).to.be.equal(role.description);
        expect(removed.permissions).to.have.length(2);


        done(error, removed);
      });

  });

  describe('Search', function () {
    let permissions = [{
      action: faker.random.word(),
      resource: faker.random.word(),
    }];

    let role = {
      name: faker.random.word(),
      description: faker.random.word()
    };

    before(function (done) {
      Permission.remove(done);
    });

    before(function (done) {
      Role.remove(done);
    });

    before(function (done) {
      Permission.create(permissions, function (error, created) {
        permissions = created;
        done(error, created);
      });
    });

    before(function (done) {
      role.permissions = permissions;
      Role.create(role, function (error, created) {
        role = created;
        done(error, created);
      });
    });

    it('should be able to search role by its fields',
      function (done) {

        Role
          .search(role.name, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found.name).to.exist;
            expect(found.description).to.exist;
            expect(found.permissions).to.exist;

            expect(found.name).to.be.equal(role.name);
            expect(found.description).to.be.equal(role.description);
            expect(_.map(found.permissions, 'wildcard')).to
              .include.members(_.map(found.permissions, 'wildcard'));

            done(error, results);

          });
      });

  });

  after(function (done) {
    Permission.remove(done);
  });

  after(function (done) {
    Role.remove(done);
  });

});
