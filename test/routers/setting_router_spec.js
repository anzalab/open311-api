'use strict';

/**
 * Setting router specification
 *
 * @description :: Server-side router specification for Setting
 */

//dependencies
const path = require('path');
const expect = require('chai').expect;
const faker = require('faker');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require(path.join(__dirname, '..', '..', 'app', 'application'));
const Setting = mongoose.model('Setting');
let setting;

describe('HTTP /settings', function () {

  it('POST /settings', function (done) {

    setting = {
      key: faker.lorem.word(),
      value: faker.lorem.word(),
    };

    request(app)
      .post('/settings')
      .send(setting)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (error, response) {

        expect(error).to.not.exist;
        expect(response).to.exist;

        const body = response.body;

        expect(body).to.exist;
        expect(body._id).to.exist;
        expect(body.key).to.be.equal(setting.key);
        expect(body.value).to.be.equal(setting.value);

        setting = body;

        done(error, response);

      });

  });


  it('GET /settings/:id', function (done) {

    request(app)
      .get('/settings/' + setting._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (error, response) {

        expect(error).to.not.exist;
        expect(response).to.exist;

        const body = response.body;

        expect(body).to.exist;
        expect(body._id).to.exist;
        expect(body.key).to.be.equal(setting.key);
        expect(body.value).to.be.equal(setting.value);

        done(error, response);

      });

  });


  it('PUT /settings/:id', function (done) {

    const updates = {
      value: faker.lorem.word(),
    };

    request(app)
      .put('/settings/' + setting._id)
      .send(updates)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (error, response) {

        expect(error).to.not.exist;
        expect(response).to.exist;

        const body = response.body;

        expect(body).to.exist;
        expect(body._id).to.exist;
        expect(body.key).to.be.equal(setting.key);
        expect(body.value).to.be.equal(updates.value);

        setting = body;

        done(error, response);

      });

  });

  it('PATCH /settings/:id', function (done) {

    const updates = {
      value: faker.lorem.word(),
    };

    request(app)
      .patch('/settings/' + setting._id)
      .send(updates)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (error, response) {

        expect(error).to.not.exist;
        expect(response).to.exist;

        const body = response.body;

        expect(body).to.exist;
        expect(body._id).to.exist;
        expect(body.key).to.be.equal(setting.key);
        expect(body.value).to.be.equal(updates.value);

        setting = body;

        done(error, response);

      });

  });


  it('GET /settings', function (done) {

    request(app)
      .get('/settings')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (error, response) {

        expect(error).to.not.exist;
        expect(response).to.exist;

        const body = response.body;

        expect(body.pages).to.exist;
        expect(body.count).to.exist;
        expect(body.settings).to.exist;

        done(error, response);

      });

  });


  it('DELETE /settings/:id', function (done) {

    request(app)
      .delete('/settings/' + setting._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (error, response) {

        expect(error).to.not.exist;
        expect(response).to.exist;

        const body = response.body;

        expect(body).to.exist;
        expect(body._id).to.exist;
        expect(body.key).to.be.equal(setting.key);
        expect(body.value).to.be.equal(setting.value);

        done(error, response);

      });

  });


  after(function (done) {
    Setting.remove({
      _id: {
        $in: [setting._id]
      }
    }, done);
  });

});
