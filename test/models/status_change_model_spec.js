'use strict';

/**
 * StatusChange model specification
 *
 * @description :: Server-side model specification for StatusChange
 */

//dependencies
const async = require('async');
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const randomColor = require('randomcolor');
const Party = mongoose.model('Party');
const StatusChange = mongoose.model('StatusChange');
const Jurisdiction = mongoose.model('Jurisdiction');
const ServiceGroup = mongoose.model('ServiceGroup');
const Service = mongoose.model('Service');
const Status = mongoose.model('Status');
const ServiceRequest = mongoose.model('ServiceRequest');
let serviceRequest;
let reporter;
let changer;
let status;
let statusChange;

describe('StatusChange', function () {

  function preTest(done) {
    async.waterfall([
      function createStatus(next) {
        Status.create({
          name: faker.company.companyName(),
          weight: faker.random.number({ min: -20, max: 20 }),
          color: randomColor().toUpperCase()
        }, function (error, created) {
          status = created;
          next(error, created);
        });
      },
      function createJurisdiction(status, next) {
        Jurisdiction.create({
          name: faker.company.companyName(),
          domain: faker.internet.domainName(),
          about: faker.company.catchPhrase(),
          location: {
            coordinates: [
              Number(faker.address.longitude()),
              Number(faker.address.latitude())
            ]
          }
        }, next);
      },
      function createServiceGroup(jurisdiction, next) {
        ServiceGroup.create({
          jurisdiction: jurisdiction,
          name: faker.company.companyName(),
          description: faker.company.catchPhrase()
        }, next);
      },
      function createService(serviceGroup, next) {
        Service.create({
          group: serviceGroup,
          name: faker.company.companyName(),
          description: faker.company.catchPhrase()
        }, next);
      },
      function createServiceRequest(service, next) {
        ServiceRequest.create({
          jurisdiction: service.jurisdiction,
          service: service,
          reporter: reporter,
          description: faker.lorem.sentence(),
          account: faker.random.uuid(),
          address: faker.address.streetAddress(),
          location: [faker.address.longitude(), faker.address.latitude()],
        }, function (error, created) {
          serviceRequest = created;
          next(error, created);
        });
      }
    ], done);
  }

  before(function (done) {
    Party.create({
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(),
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber()
    }, function (error, created) {
      reporter = changer = created;
      done(error, created);
    });
  });


  before(function (done) {

    preTest(done);

  });

  it('should be able to create new status change', function (done) {

    statusChange = {
      request: serviceRequest,
      status: status,
      changer: changer,
      remarks: faker.lorem.paragraph()
    };

    StatusChange
      .create(statusChange, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        //assert created
        expect(created._id).to.exist;
        expect(created.request).to.exist;
        expect(created.changer).to.exist;
        expect(created.remarks).to.exist;

        expect(created.request).to.be.eql(serviceRequest);
        expect(created.changer).to.be.eql(changer);
        expect(created.remarks).to.be.equal(statusChange.remarks);

        //assert status change on service request
        expect(created.request.status._id).to.be.eql(created.status._id);

        //update statusChange reference
        statusChange = created;

        done(error, created);

      });

  });

  it('should not be able to update service request status if are same',
    function (done) {

      const _statusChange = {
        request: serviceRequest,
        status: status,
        changer: changer,
        remarks: faker.lorem.paragraph()
      };

      StatusChange
        .create(_statusChange, function (error, created) {

          expect(error).to.not.exist;
          expect(created).to.exist;

          //assert created
          expect(created._id).to.exist;
          expect(created.request).to.exist;
          expect(created.changer).to.exist;
          expect(created.remarks).to.exist;

          expect(created.request).to.be.eql(serviceRequest);
          expect(created.changer).to.be.eql(changer);
          expect(created.remarks).to.be.equal(_statusChange.remarks);

          //assert status change on service request
          expect(created.request.status._id).to.be.eql(created.status._id);

          done(error, created);

        });

    });


  it('should be able to find existing status change', function (done) {

    StatusChange
      .findById(statusChange._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        //assert found
        expect(found._id).to.exist;
        expect(found.request).to.exist;
        expect(found.changer).to.exist;
        expect(found.remarks).to.exist;

        expect(found.changer.name).to.be.equal(changer.name);
        expect(found.remarks).to.be.equal(statusChange.remarks);

        done(error, found);

      });

  });


  it('should be able to update existing status change', function (done) {

    const updates = {
      remarks: faker.lorem.paragraph()
    };

    StatusChange
      .findByIdAndUpdate(statusChange._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated.request).to.exist;
        expect(updated.changer).to.exist;
        expect(updated.remarks).to.exist;

        expect(updated.remarks).to.be.equal(updates.remarks);

        //update statusChange references
        statusChange = updated;

        done(error, updated);

      });

  });


  it('should be able to list existing status changes', function (done) {

    StatusChange
      .paginate({
        page: 1,
        limit: 10
      }, function (error, statusChanges, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(statusChanges).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, statusChanges);

      });

  });


  it('should be able to delete existing status change', function (done) {

    StatusChange
      .findByIdAndRemove(statusChange._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed.request).to.exist;
        expect(removed.changer).to.exist;
        expect(removed.remarks).to.exist;

        done(error, removed);

      });

  });

  it('should be able to soft delete a status change');

  describe('Search', function () {

    before(function (done) {
      statusChange = {
        request: serviceRequest,
        status: status,
        changer: changer,
        remarks: faker.lorem.paragraph()
      };

      StatusChange.create(statusChange, function (error, created) {
        statusChange = created;
        done(error, created);
      });

    });

    it('should be able to search status change by its fields',
      function (done) {

        StatusChange
          .search(statusChange.remarks, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found.request).to.exist;
            expect(found.changer).to.exist;
            expect(found.remarks).to.exist;

            done(error, results);

          });
      });

  });


  after(function (done) {
    StatusChange.remove(done);
  });

  after(function (done) {
    ServiceRequest.remove(done);
  });

  after(function (done) {
    Service.remove(done);
  });

  after(function (done) {
    ServiceGroup.remove(done);
  });

  after(function (done) {
    changer.remove(done);
  });

  after(function (done) {
    Jurisdiction.remove(done);
  });

  after(function (done) {
    StatusChange.remove(done);
  });

  after(function (done) {
    Status.remove(done);
  });

});
