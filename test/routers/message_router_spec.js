'use strict';

/**
 * Message router specification
 *
 * @description :: Server-side router specification for Message
 */

//dependencies
const path = require('path');
const expect = require('chai').expect;
const faker = require('faker');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require(path.join(__dirname, '..', '..', 'app', 'application'));
const Message = mongoose.model('Message');
let message;

describe('Message Router', function () {

  before(function (done) {
    Message.remove(done);
  });

  it.only(
    'should handle HTTP POST on /messages',
    function (done) {

      message = {
        type: Message.TYPE_SMS,
        to: '0714066066',
        body: faker.lorem.sentence()
      };

      request(app)
        .post('/messages')
        .send(message)
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

          expect(created.type).to.exist;
          expect(created.to).to.exist;
          expect(created.body).to.exist;

          message = created;

          done(error, response);

        });

    });


  it(
    'should handle HTTP GET on /messages/:id',
    function (done) {

      request(app)
        .get('/messages/' + message._id)
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
          expect(found._id).to.eql(message._id);

          expect(found.type).to.exist;
          expect(found.to).to.exist;
          expect(found.body).to.exist;

          done(error, response);

        });

    });


  it(
    'should handle HTTP GET on /messages',
    function (done) {

      request(app)
        .get('/messages')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error, response) {

          expect(error).to.not.exist;
          expect(response).to.exist;

          const { messages, pages, count } = response.body;
          expect(pages).to.exist;
          expect(messages).to.exist;
          expect(count).to.exist;

          //TODO more messages response assertions

          done(error, response);

        });

    });

  it(
    'should not handle HTTP PUT on /messages/:id',
    function (done) {

      const updates = { body: faker.lorem.sentence() };

      request(app)
        .put('/messages/' + new Message()._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .send(updates)
        .expect(405)
        .expect('Content-Type', /json/)
        .end(function (error, response) {
          expect(response.body.status).to.exist;
          expect(response.body.code).to.exist;
          done(null, response);
        });

    });


  it(
    'should not handle HTTP PATCH on /messages/:id',
    function (done) {

      const updates = { body: faker.lorem.sentence() };

      request(app)
        .patch('/messages/' + new Message()._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .send(updates)
        .expect(405)
        .expect('Content-Type', /json/)
        .end(function (error, response) {
          expect(response.body.status).to.exist;
          expect(response.body.code).to.exist;
          done(null, response);
        });

    });


  it(
    'should not handle HTTP DELETE on /messages/:id',
    function (done) {

      request(app)
        .delete('/messages/' + new Message()._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + this.token)
        .expect(405)
        .expect('Content-Type', /json/)
        .end(function (error, response) {
          expect(response.body.status).to.exist;
          expect(response.body.code).to.exist;
          done(null, response);
        });

    });

  after(function (done) {
    Message.remove(done);
  });

});
