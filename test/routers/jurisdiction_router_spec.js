'use strict';

/**
 * Jurisdiction router specification
 *
 * @description :: Server-side router specification for Jurisdiction
 */

//dependencies
const path = require('path');
const expect = require('chai').expect;
const faker = require('faker');
const request = require('supertest');
const app = require(path.join(__dirname, '..', '..', 'app', 'application'));
let jurisdiction;

describe('Jurisdiction Router', function () {

  it(
    'should handle HTTP POST on /jurisdictions',
    function (done) {

      jurisdiction = {
        name: faker.company.companyName(),
        domain: faker.internet.domainName(),
        about: faker.company.catchPhrase(),
        location: {
          coordinates: [
            Number(faker.address.longitude()),
            Number(faker.address.latitude())
          ]
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

      request(app)
        .post('/jurisdictions')
        .send(jurisdiction)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function (error, response) {

          expect(error).to.not.exist;
          expect(response).to.exist;

          const created = response.body;

          expect(created).to.exist;

          expect(created._id).to.exist;

          expect(created.code).to.exist;
          expect(created.name).to.be.equal(jurisdiction.name);
          expect(created.domain).to.be.equal(jurisdiction.domain);
          expect(created.about).to.be.equal(jurisdiction.about);
          expect(created.location).to.exist;
          expect(created.boundaries).to.exist;


          jurisdiction = created;

          done(error, response);

        });

    });


  it(
    'should handle HTTP GET on /jurisdictions/:id',
    function (done) {

      request(app)
        .get('/jurisdictions/' + jurisdiction._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error, response) {

          expect(error).to.not.exist;
          expect(response).to.exist;

          const found = response.body;

          expect(found).to.exist;

          expect(found._id).to.exist;
          expect(found._id).to.eql(jurisdiction._id);

          expect(found.code).to.be.equal(jurisdiction.code);
          expect(found.name).to.be.equal(jurisdiction.name);
          expect(found.domain).to.be.equal(jurisdiction.domain);
          expect(found.about).to.be.equal(jurisdiction.about);
          expect(found.location).to.exist;
          expect(found.boundaries).to.exist;

          done(error, response);

        });

    });


  it(
    'should handle HTTP PUT on /jurisdictions/:id',
    function (done) {

      const updates = {
        about: faker.company.catchPhrase()
      };

      request(app)
        .put('/jurisdictions/' + jurisdiction._id)
        .send(updates)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error, response) {

          expect(error).to.not.exist;
          expect(response).to.exist;

          const updated = response.body;
          expect(updated).to.exist;

          expect(updated._id).to.exist;
          expect(updated._id).to.be.eql(jurisdiction._id);

          expect(updated.code).to.be.equal(jurisdiction.code);
          expect(updated.name).to.be.equal(jurisdiction.name);
          expect(updated.domain).to.be.equal(jurisdiction.domain);
          expect(updated.about).to.be.equal(updates.about);
          expect(updated.location).to.exist;
          expect(updated.boundaries).to.exist;

          jurisdiction = updated;

          done(error, response);

        });

    });


  it(
    'should handle HTTP PATCH on /jurisdictions/:id',
    function (done) {

      const updates = {
        about: faker.company.catchPhrase()
      };

      request(app)
        .patch('/jurisdictions/' + jurisdiction._id)
        .send(updates)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error, response) {

          expect(error).to.not.exist;
          expect(response).to.exist;

          const updated = response.body;
          expect(updated).to.exist;

          expect(updated._id).to.exist;
          expect(updated._id).to.be.eql(jurisdiction._id);

          expect(updated.code).to.be.equal(jurisdiction.code);
          expect(updated.name).to.be.equal(jurisdiction.name);
          expect(updated.domain).to.be.equal(jurisdiction.domain);
          expect(updated.about).to.be.equal(updates.about);
          expect(updated.location).to.exist;
          expect(updated.boundaries).to.exist;

          jurisdiction = updated;

          done(error, response);

        });

    });

  it('should handle HTTP GET on /jurisdictions',
    function (
      done) {

      request(app)
        .get('/jurisdictions')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error, response) {

          expect(error).to.not.exist;
          expect(response).to.exist;

          const { jurisdictions, pages, count } = response.body;
          expect(pages).to.exist;
          expect(jurisdictions).to.exist;
          expect(count).to.exist;

          //TODO more jurisdictions response assertions

          done(error, response);

        });

    });



  it(
    'should handle HTTP DELETE on /jurisdictions/:id',
    function (done) {

      request(app)
        .delete('/jurisdictions/' + jurisdiction._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error, response) {

          expect(error).to.not.exist;
          expect(response).to.exist;

          const removed = response.body;
          expect(removed).to.exist;

          expect(removed._id).to.exist;
          expect(removed._id).to.be.eql(jurisdiction._id);

          expect(removed.code).to.be.equal(jurisdiction.code);
          expect(removed.name).to.be.equal(jurisdiction.name);
          expect(removed.domain).to.be.equal(jurisdiction.domain);
          expect(removed.about).to.be.equal(jurisdiction.about);
          expect(removed.location).to.exist;
          expect(removed.boundaries).to.exist;

          done(error, response);

        });

    });

  after(function (done) {
    //TODO write spec cleanup
    done();
  });

});
