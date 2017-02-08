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
    'should be able to create new jurisdiction when http post on /jurisdictions',
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

          jurisdiction = response.body;

          //TODO more jurisdiction response assertions

          done(error, response);
        });
    });


  it(
    'should be able to find jurisdiction when http get on /jurisdictions/:id',
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

          //TODO more jurisdiction response assertions

          done(error, response);
        });
    });


  it(
    'should be able to update existing jurisdiction when http put on /jurisdictions/:id',
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

          //TODO more jurisdiction response assertions

          done(error, response);
        });
    });


  it(
    'should be able to update existing jurisdiction when http patch on /jurisdictions/:id',
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

          //TODO more jurisdiction response assertions

          done(error, response);
        });
    });

  it('should be able to list jurisdictions when http get on /jurisdictions',
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

          //TODO more jurisdictions response assertions

          done(error, response);
        });
    });



  it(
    'should be able to delete existing jurisdiction when http delete on /jurisdictions/:id',
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

          //TODO more jurisdiction response assertions

          done(error, response);
        });
    });

  after(function (done) {
    //TODO write spec cleanup
    done();
  });

});
