'use strict';

/**
 * ServiceRequest model specification
 *
 * @description :: Server-side model specification for ServiceRequest
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Jurisdiction = mongoose.model('Jurisdiction');
const Party = mongoose.model('Party');
const ServiceGroup = mongoose.model('ServiceGroup');
const Service = mongoose.model('Service');
const ServiceRequest = mongoose.model('ServiceRequest');
let jurisdiction;
let reporter;
let assignee;
let serviceGroup;
let service;
let serviceRequest;

describe('ServiceRequest', function () {

  before(function (done) {
    jurisdiction = {
      code: faker.random.uuid(),
      name: faker.company.companyName(),
      domain: faker.internet.domainName(),
      about: faker.company.catchPhrase()
    };

    Jurisdiction.create(jurisdiction, function (error, created) {
      jurisdiction = created;
      done(error, created);
    });

  });

  before(function (done) {
    reporter = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
    };

    Party.create(reporter, function (error, created) {
      reporter = created;
      done(error, created);
    });

  });

  before(function (done) {
    assignee = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
    };

    Party.create(assignee, function (error, created) {
      assignee = created;
      done(error, created);
    });

  });

  before(function (done) {
    serviceGroup = {
      jurisdiction: jurisdiction,
      code: faker.random.uuid(),
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };

    ServiceGroup.create(serviceGroup, function (error, created) {
      serviceGroup = created;
      done(error, created);
    });
  });

  before(function (done) {
    service = {
      jurisdiction: jurisdiction,
      group: serviceGroup,
      code: faker.random.uuid(),
      name: faker.company.companyName(),
      description: faker.company.catchPhrase()
    };

    Service.create(service, function (error, created) {
      service = created;
      done(error, created);
    });

  });

  it('should be able to create new service request(issue)',
    function (done) {

      serviceRequest = {
        jurisdiction: jurisdiction,
        service: service,
        reporter: reporter,
        assignee: assignee,
        description: faker.company.catchPhrase(),
        account: faker.random.uuid(),
        address: faker.address.streetAddress(),
        location: [faker.address.longitude(), faker.address.latitude()],
      };

      ServiceRequest
        .create(serviceRequest, function (error, created) {

          expect(error).to.not.exist;
          expect(created).to.exist;

          expect(created._id).to.exist;

          expect(created.jurisdiction).to.be.exist;
          expect(created.service).to.be.exist;
          expect(created.reporter).to.be.exist;
          expect(created.assignee).to.be.exist;
          expect(created.code).to.be.exist;
          expect(created.description).to.be.equal(serviceRequest.description);
          expect(created.account).to.be.equal(serviceRequest.account);
          expect(created.address).to.be.equal(serviceRequest.address);
          expect(created.location).to.exist;
          expect(created.longitude)
            .to.be.equal(Number(serviceRequest.location[0]));
          expect(created.latitude)
            .to.be.equal(Number(serviceRequest.location[1]));
          expect(created.status).to.be.exist;
          expect(created.priority).to.be.exist;

          //update serviceRequest reference
          serviceRequest = created;

          done(error, created);
        });

    });


  it('should be able to find existing service request(issue)',
    function (done) {

      ServiceRequest
        .findById(serviceRequest._id, function (error, found) {

          expect(error).to.not.exist;
          expect(found).to.exist;

          expect(found._id).to.exist;
          expect(found._id).to.eql(serviceRequest._id);

          expect(found.code).to.be.equal(serviceRequest.code);
          expect(found.description).to.be.equal(serviceRequest.description);

          //assert jurisdiction
          expect(found.jurisdiction._id).to.exist;
          expect(found.jurisdiction.code).to.exist;
          expect(found.jurisdiction.name).to.exist;
          expect(found.jurisdiction.domain).to.exist;
          expect(found.jurisdiction.about).to.not.exist;
          expect(found.jurisdiction.jurisdiction).to.not.exist;

          //assert service
          //assert reporter
          //assert assignee

          done(error, found);
        });

    });


  it('should be able to update existing service request(issue)',
    function (done) {

      const updates = {
        description: faker.company.catchPhrase()
      };

      ServiceRequest
        .findByIdAndUpdate(serviceRequest._id, updates, {
          upsert: true,
          new: true
        }, function (error, updated) {

          expect(error).to.not.exist;
          expect(updated).to.exist;

          expect(updated._id).to.exist;
          expect(updated._id).to.be.eql(serviceRequest._id);

          expect(updated.code).to.be.equal(serviceRequest.code);
          expect(updated.description).to.be.equal(updates.description);

          //update serviceRequest references
          serviceRequest = updated;

          done(error, updated);
        });
    });


  it('should be able to list existing service request(s)(issues)',
    function (done) {

      ServiceRequest
        .paginate({
          page: 1,
          limit: 10
        }, function (error, serviceRequests, pages, total) {

          expect(error).to.not.exist;
          expect(pages).to.exist;
          expect(serviceRequests).to.exist;
          expect(total).to.exist;

          //TODO application specific assertions

          done(error, serviceRequests);
        });

    });


  it('should be able to delete existing service request(issue)',
    function (done) {

      ServiceRequest
        .findByIdAndRemove(serviceRequest._id, function (error, removed) {

          expect(error).to.not.exist;
          expect(removed).to.exist;

          expect(removed._id).to.exist;
          expect(removed._id).to.be.eql(serviceRequest._id);

          expect(removed.code).to.be.equal(serviceRequest.code);
          expect(removed.description).to.be.equal(serviceRequest.description);

          done(error, removed);
        });

    });

  it('should be able to request a service');
  it('should be able to attach supported files');
  it('should be able to comment');
  it('should be able to log work performed so far');
  it('should be able to resolve');
  it('should be able to update it status');
  it('should be able to update its priority');


  after(function (done) {
    Service.remove(done);
  });

  after(function (done) {
    ServiceGroup.remove(done);
  });

  after(function (done) {
    Jurisdiction.remove(done);
  });

  after(function (done) {
    reporter.remove(done);
  });

  after(function (done) {
    assignee.remove(done);
  });

});