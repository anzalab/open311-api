'use strict';

/**
 * Priority model specification
 *
 * @description :: Server-side model specification for Priority
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const randomColor = require('randomcolor');
const Priority = mongoose.model('Priority');
let priority;

describe('Priority', function () {

  it('should be able to create new priority', function (done) {

    priority = {
      name: faker.company.companyName(),
      weight: faker.random.number({ min: -20, max: 20 }),
      color: randomColor().toUpperCase()
    };

    Priority
      .create(priority, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;
        expect(created.name).to.exist;
        expect(created.weight).to.exist;
        expect(created.color).to.exist;

        expect(created.name).to.be.equal(priority.name);
        expect(created.weight).to.be.equal(priority.weight);
        expect(created.color).to.be.equal(priority.color);

        //update priority reference
        priority = created;

        done(error, created);

      });

  });


  it('should be able to find existing priority', function (done) {

    Priority
      .findById(priority._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        //assert found
        expect(found._id).to.exist;
        expect(found.name).to.exist;
        expect(found.weight).to.exist;
        expect(found.color).to.exist;

        expect(found._id).to.be.eql(priority._id);
        expect(found.name).to.be.equal(priority.name);
        expect(found.weight).to.be.equal(priority.weight);
        expect(found.color).to.be.equal(priority.color);

        done(error, found);

      });

  });


  it('should be able to update existing priority', function (done) {

    const updates = {
      color: randomColor().toUpperCase()
    };

    Priority
      .findByIdAndUpdate(priority._id, updates, {
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

        expect(updated._id).to.be.eql(priority._id);
        expect(updated.name).to.be.equal(priority.name);
        expect(updated.weight).to.be.equal(priority.weight);
        expect(updated.color).to.be.equal(updates.color);

        //update priority references
        priority = updated;

        done(error, updated);

      });

  });


  it('should be able to list existing priorities', function (done) {

    Priority
      .paginate({
        page: 1,
        limit: 10
      }, function (error, priorities, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(priorities).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, priorities);
      });

  });


  it('should be able to find default priority', function (done) {

    Priority
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


  it('should be able to delete existing priority', function (done) {

    Priority
      .findByIdAndRemove(priority._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        //assert removed
        expect(removed._id).to.exist;
        expect(removed.name).to.exist;
        expect(removed.weight).to.exist;
        expect(removed.color).to.exist;

        expect(removed._id).to.be.eql(priority._id);
        expect(removed.name).to.be.equal(priority.name);
        expect(removed.weight).to.be.equal(priority.weight);
        expect(removed.color).to.be.equal(priority.color);

        done(error, removed);

      });

  });

  it('should be able to soft delete a priority');

  describe('Search', function () {


    let priority = {
      name: faker.company.companyName(),
      weight: faker.random.number({ min: -20, max: 20 }),
      color: randomColor()
    };


    before(function (done) {
      Priority.remove(done);
    });

    before(function (done) {
      Priority.create(priority, function (error, created) {
        priority = created;
        done(error, created);
      });
    });

    it('should be able to search priority group by its fields',
      function (done) {

        Priority
          .search(priority.name, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found._id).to.exist;
            expect(found.name).to.exist;
            expect(found.weight).to.exist;
            expect(found.color).to.exist;

            expect(found.name).to.be.equal(priority.name);
            expect(found.weight).to.be.equal(priority.weight);
            expect(found.color).to.be.equal(priority.color);

            done(error, results);

          });
      });

  });


  after(function (done) {
    Priority.remove(done);
  });

});
