'use strict';

/**
 * Permission model specification
 *
 * @description :: Server-side model specification for Permission
 */

//dependencies
const mongoose = require('mongoose');
const inflection = require('inflection');
const faker = require('faker');
const expect = require('chai').expect;
const Permission = mongoose.model('Permission');
let permission;

describe('Permission', function () {

  it('should be able to create new permission', function (done) {

    permission = {
      action: faker.random.word(),
      resource: faker.random.word(),
    };

    Permission
      .create(permission, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;

        expect(created.action).to.be.equal(permission.action.toLowerCase());
        expect(created.resource)
          .to.be.equal(inflection.classify(permission.resource));
        expect(created.wildcard).to.exist;
        expect(created.description).to.exist;

        permission = created;

        done(error, created);
      });

  });


  it('should be able to find existing permission', function (done) {

    Permission
      .findById(permission._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        expect(found._id).to.exist;
        expect(found._id).to.eql(permission._id);

        expect(found.action).to.be.equal(permission.action.toLowerCase());
        expect(found.resource).to.be.equal(permission.resource);
        expect(found.wildcard).to.be.equal(permission.wildcard);
        expect(found.description).to.be.equal(permission.description);

        done(error, found);
      });

  });


  it('should be able to update existing permission', function (done) {

    const updates = {
      description: faker.random.word()
    };

    Permission
      .findByIdAndUpdate(permission._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated._id).to.be.eql(permission._id);

        expect(updated.action).to.be.equal(permission.action.toLowerCase());
        expect(updated.resource).to.be.equal(permission.resource);
        expect(updated.wildcard).to.be.equal(permission.wildcard);
        expect(updated.description).to.be.equal(updates.description);

        //update permission references
        permission = updated;

        done(error, updated);
      });
  });


  it('should be able to list existing permissions', function (done) {

    Permission
      .paginate({
        page: 1,
        limit: 10
      }, function (error, permissions, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(permissions).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, permissions);
      });

  });


  it('should be able to delete existing permission', function (done) {

    Permission
      .findByIdAndRemove(permission._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed._id).to.be.eql(permission._id);

        expect(removed.action).to.be.equal(permission.action.toLowerCase());
        expect(removed.resource).to.be.equal(permission.resource);
        expect(removed.wildcard).to.be.equal(permission.wildcard);
        expect(removed.description).to.be.equal(permission.description);

        done(error, removed);
      });

  });

  describe('Search', function () {
    let permission = {
      action: faker.random.word(),
      resource: faker.random.word(),
    };

    before(function (done) {
      Permission.remove(done);
    });

    before(function (done) {
      Permission.create(permission, function (error, created) {
        permission = created;
        done(error, created);
      });
    });

    it('should be able to search permission by its fields',
      function (done) {

        Permission
          .search(permission.wildcard, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found.action).to.exist;
            expect(found.resource).to.exist;
            expect(found.description).to.exist;
            expect(found.wildcard).to.exist;

            expect(found.action).to.be.equal(permission.action);
            expect(found.resource).to.be.equal(permission.resource);
            expect(found.description).to.be.equal(permission.description);
            expect(found.wildcard).to.be.equal(permission.wildcard);

            done(error, results);

          });
      });

  });

  after(function (done) {
    Permission.remove(done);
  });

});
