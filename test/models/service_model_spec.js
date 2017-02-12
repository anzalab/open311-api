'use strict';

/**
 * Service model specification
 *
 * @description :: Server-side model specification for Service
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Jurisdiction = mongoose.model('Jurisdiction');
const ServiceGroup = mongoose.model('ServiceGroup');
const Service = mongoose.model('Service');
let jurisdiction;
let serviceGroup;
let service;

describe('Service', function () {

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

  before(function (done) {
    serviceGroup = {
      jurisdiction: jurisdiction,
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };

    ServiceGroup.create(serviceGroup, function (error, created) {
      serviceGroup = created;
      done(error, created);
    });
  });

  it('should be able to create new service', function (done) {

    service = {
      jurisdiction: jurisdiction,
      group: serviceGroup,
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };

    Service
      .create(service, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;
        expect(created.jurisdiction).to.exist;
        expect(created.group).to.exist;
        expect(created.code).to.exist;
        expect(created.name).to.exist;
        expect(created.description).to.exist;
        expect(created.priority).to.exist;
        expect(created.color).to.exist;

        expect(created.jurisdiction).to.be.eql(service.jurisdiction);
        expect(created.group).to.be.eql(service.group);
        expect(created.name).to.be.equal(service.name);
        expect(created.description).to.be.equal(service.description);

        //update service reference
        service = created;

        done(error, created);

      });

  });


  it('should be able to find existing service', function (done) {

    Service
      .findById(service._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        //assert found
        expect(found._id).to.exist;
        expect(found.jurisdiction).to.exist;
        expect(found.group).to.exist;
        expect(found.code).to.exist;
        expect(found.name).to.exist;
        expect(found.description).to.exist;
        expect(found.priority).to.exist;
        expect(found.color).to.exist;

        expect(found.code).to.be.equal(service.code);
        expect(found.name).to.be.equal(service.name);
        expect(found.color).to.be.equal(service.color);
        expect(found.description).to.be.equal(service.description);

        //assert jurisdiction
        expect(found.jurisdiction._id).to.exist;
        expect(found.jurisdiction.code).to.exist;
        expect(found.jurisdiction.name).to.exist;
        expect(found.jurisdiction.domain).to.exist;
        expect(found.jurisdiction.about).to.not.exist;
        expect(found.jurisdiction.jurisdiction).to.not.exist;

        //assert group
        expect(found.group._id).to.exist;
        expect(found.group.code).to.exist;
        expect(found.group.name).to.exist;
        expect(found.group.color).to.exist;
        expect(found.group.description).to.not.exist;
        expect(found.group.jurisdiction).to.not.exist;

        done(error, found);

      });

  });


  it('should be able to update existing service', function (done) {

    const updates = {
      description: faker.company.catchPhrase()
    };

    Service
      .findByIdAndUpdate(service._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated.jurisdiction).to.exist;
        expect(updated.group).to.exist;
        expect(updated.code).to.exist;
        expect(updated.name).to.exist;
        expect(updated.description).to.exist;
        expect(updated.priority).to.exist;
        expect(updated.color).to.exist;

        expect(updated.code).to.be.equal(service.code);
        expect(updated.name).to.be.equal(service.name);
        expect(updated.color).to.be.equal(service.color);
        expect(updated.description).to.be.equal(updates.description);

        //update service references
        service = updated;

        done(error, updated);

      });

  });


  it('should be able to list existing services', function (done) {

    Service
      .paginate({
        page: 1,
        limit: 10
      }, function (error, services, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(services).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, services);
      });

  });


  it('should be able to delete existing service', function (done) {

    Service
      .findByIdAndRemove(service._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed.jurisdiction).to.exist;
        expect(removed.group).to.exist;
        expect(removed.code).to.exist;
        expect(removed.name).to.exist;
        expect(removed.description).to.exist;
        expect(removed.priority).to.exist;
        expect(removed.color).to.exist;

        expect(removed.code).to.be.equal(service.code);
        expect(removed.name).to.be.equal(service.name);
        expect(removed.color).to.be.equal(service.color);
        expect(removed.description).to.be.equal(service.description);

        done(error, removed);

      });

  });

  it('should be able to soft delete a service');

  describe('Search', function () {

    let serviceGroup = {
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };

    let service = {
      group: serviceGroup,
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };


    before(function (done) {
      Service.remove(done);
    });

    before(function (done) {
      ServiceGroup.create(serviceGroup, function (error, created) {
        serviceGroup = created;
        done(error, created);
      });
    });

    before(function (done) {
      service.group = serviceGroup;
      Service.create(service, function (error, created) {
        service = created;
        done(error, created);
      });
    });

    it('should be able to search service group by its fields',
      function (done) {

        Service
          .search(service.name, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found.code).to.exist;
            expect(found.name).to.exist;
            expect(found.description).to.exist;
            expect(found.color).to.exist;

            expect(found.code).to.be.equal(service.code);
            expect(found.name).to.be.equal(service.name);
            expect(found.color).to.be.equal(service.color);
            expect(found.description).to.be.equal(service.description);

            done(error, results);

          });
      });

  });


  after(function (done) {
    Service.remove(done);
  });

  after(function (done) {
    ServiceGroup.remove(done);
  });

  after(function (done) {
    Jurisdiction.remove(done);
  });

});
