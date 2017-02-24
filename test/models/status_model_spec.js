'use strict';

/**
 * Status model specification
 *
 * @description :: Server-side model specification for Status
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const randomColor = require('randomcolor');
const Status = mongoose.model('Status');
let status;

describe('Status', function () {

  it('should be able to create new status', function (done) {

    status = {
      name: faker.company.companyName(),
      weight: faker.random.number({ min: -20, max: 20 }),
      color: randomColor().toUpperCase()
    };

    Status
      .create(status, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;
        expect(created.name).to.exist;
        expect(created.weight).to.exist;
        expect(created.color).to.exist;

        expect(created.name).to.be.equal(status.name);
        expect(created.weight).to.be.equal(status.weight);
        expect(created.color).to.be.equal(status.color);

        //update status reference
        status = created;

        done(error, created);

      });

  });


  it('should be able to find existing status', function (done) {

    Status
      .findById(status._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        //assert found
        expect(found._id).to.exist;
        expect(found.name).to.exist;
        expect(found.weight).to.exist;
        expect(found.color).to.exist;

        expect(found._id).to.be.eql(status._id);
        expect(found.name).to.be.equal(status.name);
        expect(found.weight).to.be.equal(status.weight);
        expect(found.color).to.be.equal(status.color);

        done(error, found);

      });

  });


  it('should be able to update existing status', function (done) {

    const updates = {
      color: randomColor().toUpperCase()
    };

    Status
      .findByIdAndUpdate(status._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        //assert updates
        expect(updated._id).to.exist;
        expect(updated.name).to.exist;
        expect(updated.weight).to.exist;
        expect(updated.color).to.exist;

        expect(updated._id).to.be.eql(status._id);
        expect(updated.name).to.be.equal(status.name);
        expect(updated.weight).to.be.equal(status.weight);
        expect(updated.color).to.be.equal(updates.color);

        //update status references
        status = updated;

        done(error, updated);

      });

  });


  it('should be able to list existing statuses', function (done) {

    Status
      .paginate({
        page: 1,
        limit: 10
      }, function (error, statuses, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(statuses).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, statuses);
      });

  });


  it('should be able to find default status', function (done) {

    Status
      .findDefault(function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        //assert found
        expect(found._id).to.exist;
        expect(found.name).to.exist;
        expect(found.weight).to.exist;
        expect(found.color).to.exist;

        done(error, found);

      });

  });


  it('should be able to delete existing status', function (done) {

    Status
      .findByIdAndRemove(status._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        //assert removed
        expect(removed._id).to.exist;
        expect(removed.name).to.exist;
        expect(removed.weight).to.exist;
        expect(removed.color).to.exist;

        expect(removed._id).to.be.eql(status._id);
        expect(removed.name).to.be.equal(status.name);
        expect(removed.weight).to.be.equal(status.weight);
        expect(removed.color).to.be.equal(status.color);

        done(error, removed);

      });

  });

  it('should be able to soft delete a status');

  describe('Search', function () {


    let status = {
      name: faker.company.companyName(),
      weight: faker.random.number({ min: -20, max: 20 }),
      color: randomColor()
    };


    before(function (done) {
      Status.remove(done);
    });

    before(function (done) {
      Status.create(status, function (error, created) {
        status = created;
        done(error, created);
      });
    });

    it('should be able to search status by its fields',
      function (done) {

        Status
          .search(status.name, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found._id).to.exist;
            expect(found.name).to.exist;
            expect(found.weight).to.exist;
            expect(found.color).to.exist;

            expect(found.name).to.be.equal(status.name);
            expect(found.weight).to.be.equal(status.weight);
            expect(found.color).to.be.equal(status.color);

            done(error, results);

          });
      });

  });


  after(function (done) {
    Status.remove(done);
  });

});
