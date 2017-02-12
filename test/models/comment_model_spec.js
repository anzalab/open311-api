'use strict';

/**
 * Comment model specification
 *
 * @description :: Server-side model specification for Comment
 */

//dependencies
const async = require('async');
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Party = mongoose.model('Party');
const Comment = mongoose.model('Comment');
const Jurisdiction = mongoose.model('Jurisdiction');
const ServiceGroup = mongoose.model('ServiceGroup');
const Service = mongoose.model('Service');
const ServiceRequest = mongoose.model('ServiceRequest');
let serviceRequest;
let reporter;
let commentator;
let comment;

describe('Comment', function () {

  function preTest(done) {
    async.waterfall([
      function createJurisdiction(next) {
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
      reporter = commentator = created;
      done(error, created);
    });
  });


  before(function (done) {

    preTest(done);

  });

  it('should be able to create new comment', function (done) {

    comment = {
      request: serviceRequest,
      commentator: commentator,
      content: faker.lorem.paragraph()
    };

    Comment
      .create(comment, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        //assert created
        expect(created._id).to.exist;
        expect(created.request).to.exist;
        expect(created.commentator).to.exist;
        expect(created.content).to.exist;

        expect(created.request).to.be.eql(serviceRequest);
        expect(created.commentator).to.be.eql(commentator);
        expect(created.content).to.be.equal(comment.content);

        //update comment reference
        comment = created;

        done(error, created);

      });

  });


  it('should be able to find existing comment', function (done) {

    Comment
      .findById(comment._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        //assert found
        expect(found._id).to.exist;
        expect(found.request).to.exist;
        expect(found.commentator).to.exist;
        expect(found.content).to.exist;

        expect(found.commentator.name).to.be.equal(commentator.name);
        expect(found.content).to.be.equal(comment.content);

        done(error, found);

      });

  });


  it('should be able to update existing comment', function (done) {

    const updates = {
      content: faker.lorem.paragraph()
    };

    Comment
      .findByIdAndUpdate(comment._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated.request).to.exist;
        expect(updated.commentator).to.exist;
        expect(updated.content).to.exist;

        expect(updated.content).to.be.equal(updates.content);

        //update comment references
        comment = updated;

        done(error, updated);

      });

  });


  it('should be able to list existing comments', function (done) {

    Comment
      .paginate({
        page: 1,
        limit: 10
      }, function (error, comments, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(comments).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, comments);

      });

  });


  it('should be able to delete existing comment', function (done) {

    Comment
      .findByIdAndRemove(comment._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed.request).to.exist;
        expect(removed.commentator).to.exist;
        expect(removed.content).to.exist;

        done(error, removed);

      });

  });

  it('should be able to soft delete a comment');

  describe('Search', function () {

    before(function (done) {
      comment = {
        request: serviceRequest,
        commentator: commentator,
        content: faker.lorem.paragraph()
      };

      Comment.create(comment, function (error, created) {
        comment = created;
        done(error, created);
      });

    });

    it('should be able to search comment group by its fields',
      function (done) {

        Comment
          .search(comment.content, function (error, results) {

            expect(error).to.not.exist;
            expect(results).to.exist;
            expect(results).to.have.length.above(0);

            //assert single result
            const found = results[0];
            expect(found.request).to.exist;
            expect(found.commentator).to.exist;
            expect(found.content).to.exist;

            done(error, results);

          });
      });

  });


  after(function (done) {
    Comment.remove(done);
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
    commentator.remove(done);
  });

  after(function (done) {
    Jurisdiction.remove(done);
  });

});
