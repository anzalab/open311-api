'use strict';

/**
 * ServiceGroup model specification
 *
 * @description :: Server-side model specification for ServiceGroup
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Jurisdiction = mongoose.model('Jurisdiction');
const ServiceGroup = mongoose.model('ServiceGroup');
let jurisdiction;
let serviceGroup;

describe('ServiceGroup', function () {

  before(function (done) {

    jurisdiction = {
      name: faker.company.companyName(),
      domain: faker.internet.domainName(),
      about: faker.company.catchPhrase(),
      location: {
        coordinates: [-73.9737, 40.7648]
      },
      boundaries: {
        coordinates: [
          [
            [-73.9580, 40.8003],
            [-73.9498, 40.7968],
            [-73.9737, 40.7648],
            [-73.9814, 40.7681],
            [-73.9580, 40.8003]
          ]
        ]
      }
    };

    Jurisdiction.create(jurisdiction, function (error, created) {
      jurisdiction = created;
      done(error, created);
    });

  });

  it('should be able to create new service group', function (done) {

    serviceGroup = {
      jurisdiction: jurisdiction,
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };

    ServiceGroup
      .create(serviceGroup, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;
        expect(created.jurisdiction).to.exist;
        expect(created.code).to.exist;
        expect(created.name).to.exist;
        expect(created.description).to.exist;
        expect(created.color).to.exist;

        expect(created.jurisdiction).to.be.eql(serviceGroup.jurisdiction);
        expect(created.name).to.be.equal(serviceGroup.name);
        expect(created.description).to.be.equal(serviceGroup.description);

        serviceGroup = created;

        done(error, created);

      });

  });


  it('should be able to find existing service group', function (done) {

    ServiceGroup
      .findById(serviceGroup._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        expect(found._id).to.exist;
        expect(found._id).to.eql(serviceGroup._id);

        expect(found.code).to.be.equal(serviceGroup.code);
        expect(found.name).to.be.equal(serviceGroup.name);
        expect(found.color).to.be.equal(serviceGroup.color);
        expect(found.description).to.be.equal(serviceGroup.description);

        //assert jurisdiction
        expect(found.jurisdiction._id).to.exist;
        expect(found.jurisdiction.code).to.exist;
        expect(found.jurisdiction.name).to.exist;
        expect(found.jurisdiction.domain).to.exist;
        expect(found.jurisdiction.about).to.not.exist;
        expect(found.jurisdiction.jurisdiction).to.not.exist;

        done(error, found);

      });

  });


  it('should be able to update existing service group', function (done) {

    const updates = {
      description: faker.company.catchPhrase()
    };

    ServiceGroup
      .findByIdAndUpdate(serviceGroup._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated._id).to.be.eql(serviceGroup._id);

        expect(updated.code).to.be.equal(serviceGroup.code);
        expect(updated.name).to.be.equal(serviceGroup.name);
        expect(updated.color).to.be.equal(serviceGroup.color);
        expect(updated.description).to.be.equal(updates.description);

        //update serviceGroup references
        serviceGroup = updated;

        done(error, updated);

      });

  });


  it('should be able to list existing service groups', function (done) {

    ServiceGroup
      .paginate({
        page: 1,
        limit: 10
      }, function (error, serviceGroups, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(serviceGroups).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, serviceGroups);

      });

  });


  it('should be able to delete existing service group', function (done) {

    ServiceGroup
      .findByIdAndRemove(serviceGroup._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed._id).to.be.eql(serviceGroup._id);

        expect(removed.code).to.be.equal(serviceGroup.code);
        expect(removed.name).to.be.equal(serviceGroup.name);
        expect(removed.color).to.be.equal(serviceGroup.color);
        expect(removed.description).to.be.equal(serviceGroup.description);

        done(error, removed);

      });

  });

  it('should be able to soft delete a service group');

  describe('Search', function () {

    let serviceGroup = {
      jurisdiction: jurisdiction,
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };

    before(function (done) {
      ServiceGroup.remove(done);
    });

    before(function (done) {
      ServiceGroup.create(serviceGroup, function (error, created) {
        serviceGroup = created;
        done(error, created);
      });
    });

    it('should be able to search service group by its fields',
      function (done) {

        ServiceGroup
          .search(serviceGroup.name, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found.code).to.exist;
            expect(found.name).to.exist;
            expect(found.description).to.exist;
            expect(found.color).to.exist;

            expect(found.code).to.be.equal(serviceGroup.code);
            expect(found.name).to.be.equal(serviceGroup.name);
            expect(found.color).to.be.equal(serviceGroup.color);
            expect(found.description).to.be.equal(serviceGroup.description);

            done(error, results);

          });
      });

  });


  after(function (done) {
    ServiceGroup.remove(done);
  });

  after(function (done) {
    Jurisdiction.remove(done);
  });

});
