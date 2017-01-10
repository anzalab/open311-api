'use strict';

/**
 * Jurisdiction model specification
 *
 * @description :: Server-side model specification for Jurisdiction
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Jurisdiction = mongoose.model('Jurisdiction');
let jurisdiction;

describe('Jurisdiction', function () {

  it('should be able to create new jurisdiction', function (done) {

    jurisdiction = {
      code: faker.random.uuid(),
      name: faker.company.companyName(),
      domain: faker.internet.domainName(),
      about: faker.company.catchPhrase()
    };

    Jurisdiction
      .create(jurisdiction, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;

        expect(created.code).to.be.equal(jurisdiction.code);
        expect(created.name).to.be.equal(jurisdiction.name);
        expect(created.domain).to.be.equal(jurisdiction.domain);
        expect(created.about).to.be.equal(jurisdiction.about);

        jurisdiction = created;

        done(error, created);
      });

  });


  it('should be able to find existing jurisdiction', function (done) {

    Jurisdiction
      .findById(jurisdiction._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        expect(found._id).to.exist;
        expect(found._id).to.eql(jurisdiction._id);

        expect(found.code).to.be.equal(jurisdiction.code);
        expect(found.name).to.be.equal(jurisdiction.name);
        expect(found.domain).to.be.equal(jurisdiction.domain);
        expect(found.about).to.be.equal(jurisdiction.about);

        done(error, found);
      });

  });


  it('should be able to update existing jurisdiction', function (done) {

    const updates = {
      about: faker.company.catchPhrase()
    };

    Jurisdiction
      .findByIdAndUpdate(jurisdiction._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated._id).to.be.eql(jurisdiction._id);

        expect(updated.code).to.be.equal(jurisdiction.code);
        expect(updated.name).to.be.equal(jurisdiction.name);
        expect(updated.domain).to.be.equal(jurisdiction.domain);
        expect(updated.about).to.be.equal(updates.about);

        //update jurisdiction references
        jurisdiction = updated;

        done(error, updated);
      });
  });


  it('should be able to list existing jurisdictions', function (done) {

    Jurisdiction
      .paginate({
        page: 1,
        limit: 10
      }, function (error, jurisdictions, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(jurisdictions).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, jurisdictions);
      });

  });


  it('should be able to delete existing jurisdiction', function (done) {

    Jurisdiction
      .findByIdAndRemove(jurisdiction._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed._id).to.be.eql(jurisdiction._id);

        expect(removed.code).to.be.equal(jurisdiction.code);
        expect(removed.name).to.be.equal(jurisdiction.name);
        expect(removed.domain).to.be.equal(jurisdiction.domain);
        expect(removed.about).to.be.equal(jurisdiction.about);

        done(error, removed);
      });

  });

  describe('Jurisdiction Hierarchy', function () {
    let parent = {
      code: faker.random.uuid(),
      name: faker.company.companyName(),
      domain: faker.internet.domainName(),
      about: faker.company.catchPhrase()
    };

    let jurisdiction = {
      code: faker.random.uuid(),
      name: faker.company.companyName(),
      domain: faker.internet.domainName(),
      about: faker.company.catchPhrase()
    };

    before(function (done) {
      Jurisdiction.create(parent, function (error, created) {
        parent = created;
        jurisdiction.jurisdiction = created;
        done(error, created);
      });
    });

    it('should be able to create jurisdiction with a parent',
      function (done) {

        Jurisdiction.create(jurisdiction, function (error, created) {

          expect(error).to.not.exist;
          expect(created).to.exist;

          expect(created._id).to.exist;

          expect(created.code).to.be.equal(jurisdiction.code);
          expect(created.name).to.be.equal(jurisdiction.name);
          expect(created.domain).to.be.equal(jurisdiction.domain);
          expect(created.about).to.be.equal(jurisdiction.about);

          jurisdiction = created;

          done(error, created);
        });

      });


    it('should be able to populate parent details partially',
      function (done) {

        Jurisdiction
          .findById(jurisdiction._id, function (error, found) {

            expect(error).to.not.exist;
            expect(found).to.exist;

            expect(found._id).to.exist;
            expect(found._id).to.eql(jurisdiction._id);

            expect(found.code).to.be.equal(jurisdiction.code);
            expect(found.name).to.be.equal(jurisdiction.name);
            expect(found.domain).to.be.equal(jurisdiction.domain);
            expect(found.about).to.be.equal(jurisdiction.about);

            //assert parent
            expect(found.jurisdiction._id).to.exist;
            expect(found.jurisdiction.code).to.exist;
            expect(found.jurisdiction.name).to.exist;
            expect(found.jurisdiction.domain).to.exist;
            expect(found.jurisdiction.about).to.not.exist;
            expect(found.jurisdiction.jurisdiction).to.not.exist;

            done(error, found);
          });

      });

  });


  after(function (done) {
    Jurisdiction.remove(done);
  });

});
