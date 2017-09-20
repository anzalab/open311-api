'use strict';

/**
 * ServiceRequest model specification
 *
 * @description :: Server-side model specification for ServiceRequest
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const randomColor = require('randomcolor');
const expect = require('chai').expect;
const Jurisdiction = mongoose.model('Jurisdiction');
const Party = mongoose.model('Party');
const ServiceGroup = mongoose.model('ServiceGroup');
const Service = mongoose.model('Service');
const Status = mongoose.model('Status');
const Priority = mongoose.model('Priority');
const ServiceRequest = mongoose.model('ServiceRequest');
let jurisdiction;
let reporter;
let assignee;
let serviceGroup;
let service;
let status;
let priority;
let serviceRequest;

describe('ServiceRequest', function () {

  before(function (done) {
    Status.create({
      name: faker.company.companyName(),
      weight: faker.random.number({ min: -20, max: 20 }),
      color: randomColor().toUpperCase()
    }, function (error, created) {
      status = created;
      done(error, created);
    });
  });

  before(function (done) {
    Priority.create({
      name: faker.company.companyName(),
      weight: faker.random.number({ min: -20, max: 20 }),
      color: randomColor().toUpperCase()
    }, function (error, created) {
      priority = created;
      done(error, created);
    });
  });

  before(function (done) {
    jurisdiction = {
      name: faker.company.companyName(),
      domain: faker.internet.domainName(),
      about: faker.company.catchPhrase()
    };

    Jurisdiction.create(jurisdiction, function (error, created) {
      jurisdiction = created;
      done(error, created);
    });

  });

  before(function () {
    reporter = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      phone: faker.finance.account(), //faker.phone.phoneNumber(), TODO FIX ME
      account: faker.finance.account()
    };
  });

  before(function (done) {
    assignee = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
      account: faker.random.uuid()
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
        description: faker.lorem.paragraph(),
        address: faker.address.streetAddress(),
        createdAt: faker.date.past(),
        resolvedAt: faker.date.future(),
        location: {
          coordinates: [
            Number(faker.address.longitude()),
            Number(faker.address.latitude())
          ]
        },
        call: {
          startedAt: faker.date.past(),
          endedAt: faker.date.future()
        }
      };

      ServiceRequest
        .create(serviceRequest, function (error, created) {

          expect(error).to.not.exist;
          expect(created).to.exist;

          //reload to check ticket sending

          expect(created._id).to.exist;

          expect(created.jurisdiction).to.be.exist;
          expect(created.service).to.be.exist;
          expect(created.reporter).to.be.exist;
          expect(created.assignee).to.be.exist;
          expect(created.code).to.be.exist;
          expect(created.description).to.be.exist;
          expect(created.location).to.exist;
          expect(created.status).to.be.exist;
          expect(created.priority).to.be.exist;
          expect(created.description).to.be.equal(serviceRequest.description);

          expect(created.reporter.account)
            .to.be.equal(serviceRequest.reporter.account);

          expect(created.address).to.be.equal(serviceRequest.address);

          expect(created.longitude)
            .to.be.equal(serviceRequest.location.coordinates[0]);

          expect(created.latitude)
            .to.be.equal(serviceRequest.location.coordinates[1]);

          //assert ttr
          expect(created.ttr).to.exist;
          expect(created.ttr).to.be.an('object');
          expect(created.ttr.years).to.exist;
          expect(created.ttr.months).to.exist;
          expect(created.ttr.days).to.exist;
          expect(created.ttr.minutes).to.exist;
          expect(created.ttr.seconds).to.exist;
          expect(created.ttr.milliseconds).to.exist;
          expect(created.ttr.human).to.exist;

          //assert call
          expect(created.call).to.exist;
          expect(created.call).to.be.an('object');
          expect(created.call.duration).to.exist;
          expect(created.call.duration).to.be.an('object');
          expect(created.call.duration.years).to.exist;
          expect(created.call.duration.months).to.exist;
          expect(created.call.duration.days).to.exist;
          expect(created.call.duration.minutes).to.exist;
          expect(created.call.duration.seconds).to.exist;
          expect(created.call.duration.milliseconds).to.exist;
          expect(created.call.duration.human).to.exist;

          //assert ticket sending
          expect(created.wasOpenTicketSent).to.be.true;

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

          expect(found.jurisdiction).to.be.exist;
          expect(found.service).to.be.exist;
          expect(found.reporter).to.be.exist;
          expect(found.assignee).to.be.exist;
          expect(found.code).to.be.exist;
          expect(found.description).to.be.exist;
          expect(found.location).to.exist;
          expect(found.status).to.be.exist;
          expect(found.priority).to.be.exist;

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
          //assert priority
          //assert status

          done(error, found);

        });

    });


  it('should be able to update existing service request(issue)',
    function (done) {

      const updates = {
        description: faker.lorem.paragraph()
      };

      ServiceRequest
        .findByIdAndUpdate(serviceRequest._id, updates, {
          upsert: true,
          new: true
        }, function (error, updated) {

          expect(error).to.not.exist;
          expect(updated).to.exist;

          expect(updated._id).to.exist;
          expect(updated.jurisdiction).to.be.exist;
          expect(updated.service).to.be.exist;
          expect(updated.reporter).to.be.exist;
          expect(updated.assignee).to.be.exist;
          expect(updated.code).to.be.exist;
          expect(updated.description).to.be.exist;
          expect(updated.location).to.exist;
          expect(updated.status).to.be.exist;
          expect(updated.priority).to.be.exist;

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


  it('should be able to search service request by code',
    function (done) {

      ServiceRequest
        .search(serviceRequest.code, function (error, results) {

          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results).to.have.length.above(0);

          //assert single result
          const found = results[0];
          expect(found._id).to.exist;
          expect(found.jurisdiction).to.be.exist;
          expect(found.service).to.be.exist;
          expect(found.reporter).to.be.exist;
          expect(found.assignee).to.be.exist;
          expect(found.code).to.be.exist;
          expect(found.description).to.be.exist;
          expect(found.location).to.exist;
          expect(found.status).to.be.exist;
          expect(found.priority).to.be.exist;

          expect(found._id).to.eql(serviceRequest._id);
          expect(found.code).to.be.equal(serviceRequest.code);
          expect(found.description).to.be.equal(serviceRequest.description);


          done(error, results);

        });
    });

  it('should be able to search service request reporter phone number',
    function (done) {

      ServiceRequest
        .search(serviceRequest.reporter.phone, function (error, results) {

          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results).to.have.length.above(0);

          //assert single result
          const found = results[0];
          expect(found._id).to.exist;
          expect(found.jurisdiction).to.be.exist;
          expect(found.service).to.be.exist;
          expect(found.reporter).to.be.exist;
          expect(found.assignee).to.be.exist;
          expect(found.code).to.be.exist;
          expect(found.description).to.be.exist;
          expect(found.location).to.exist;
          expect(found.status).to.be.exist;
          expect(found.priority).to.be.exist;

          expect(found._id).to.eql(serviceRequest._id);
          expect(found.code).to.be.equal(serviceRequest.code);
          expect(found.description).to.be.equal(serviceRequest.description);


          done(error, results);

        });
    });

  it('should be able to search service request by reporter email',
    function (done) {

      ServiceRequest
        .search(serviceRequest.reporter.email, function (error, results) {

          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results).to.have.length.above(0);

          //assert single result
          const found = results[0];
          expect(found._id).to.exist;
          expect(found.jurisdiction).to.be.exist;
          expect(found.service).to.be.exist;
          expect(found.reporter).to.be.exist;
          expect(found.assignee).to.be.exist;
          expect(found.code).to.be.exist;
          expect(found.description).to.be.exist;
          expect(found.location).to.exist;
          expect(found.status).to.be.exist;
          expect(found.priority).to.be.exist;

          expect(found._id).to.eql(serviceRequest._id);
          expect(found.code).to.be.equal(serviceRequest.code);
          expect(found.description).to.be.equal(serviceRequest.description);


          done(error, results);

        });
    });

  it('should be able to delete existing service request(issue)',
    function (done) {

      ServiceRequest
        .findByIdAndRemove(serviceRequest._id, function (error, removed) {

          expect(error).to.not.exist;
          expect(removed).to.exist;

          expect(removed._id).to.exist;
          expect(removed.jurisdiction).to.be.exist;
          expect(removed.service).to.be.exist;
          expect(removed.reporter).to.be.exist;
          expect(removed.assignee).to.be.exist;
          expect(removed.code).to.be.exist;
          expect(removed.description).to.be.exist;
          expect(removed.location).to.exist;
          expect(removed.status).to.be.exist;
          expect(removed.priority).to.be.exist;

          expect(removed._id).to.be.eql(serviceRequest._id);
          expect(removed.code).to.be.equal(serviceRequest.code);
          expect(removed.description).to.be.equal(serviceRequest.description);

          done(error, removed);

        });

    });

  it('should be able to attach supported files');
  it('should be able to comment');
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
    assignee.remove(done);
  });

});
