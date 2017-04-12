'use strict';

/**
 * Counter model specification
 *
 * @description :: Server-side model specification for Counter
 */

//dependencies
const parallel = require('mocha.parallel');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const Counter = mongoose.model('Counter');

//counter options
const jurisdiction = 'A';
const service = 'B';

describe('Counter', function () {

  before(function (done) {
    Counter.remove(done);
  });

  it('should be able to format ticket number to human readable format',
    function () {

      //format one's
      let counter = new Counter({
        jurisdiction: jurisdiction,
        service: service,
        year: 17,
        sequence: 1
      });

      let ticketNumber = counter.format();

      expect(ticketNumber).to.exist;
      expect(ticketNumber).to.be.a('string');
      expect(ticketNumber).to.be.equal('AB170001');

      //format ten's
      counter = new Counter({
        jurisdiction: jurisdiction,
        service: service,
        year: 17,
        sequence: 10
      });

      ticketNumber = counter.format();

      expect(ticketNumber).to.exist;
      expect(ticketNumber).to.be.a('string');
      expect(ticketNumber).to.be.equal('AB170010');

      //format hundred's
      counter = new Counter({
        jurisdiction: jurisdiction,
        service: service,
        year: 17,
        sequence: 100
      });

      ticketNumber = counter.format();

      expect(ticketNumber).to.exist;
      expect(ticketNumber).to.be.a('string');
      expect(ticketNumber).to.be.equal('AB170100');


      //format thousand's
      counter = new Counter({
        jurisdiction: jurisdiction,
        service: service,
        year: 17,
        sequence: 1000
      });

      ticketNumber = counter.format();

      expect(ticketNumber).to.exist;
      expect(ticketNumber).to.be.a('string');
      expect(ticketNumber).to.be.equal('AB171000');

    });

  describe('initialize', function () {

    before(function (done) {
      Counter.remove(done);
    });

    it(
      'should be able to generate first ticket number use default options',
      function (done) {
        Counter
          .generate({ jurisdiction: jurisdiction, service: service },
            function (error, ticketNumber, counter) {
              expect(error).to.not.exist;
              expect(counter).to.exist;

              expect(ticketNumber).to.exist;
              expect(ticketNumber).to.be.a('string');
              expect(ticketNumber).to.be.equal('AB170001');

              done(error, counter);
            });
      });

    after(function (done) {
      Counter.remove(done);
    });

  });


  describe('increment', function () {

    before(function (done) {
      Counter.remove(done);
    });

    before(function (done) {
      Counter
        .generate({ jurisdiction: jurisdiction, service: service },
          done);
    });

    it(
      'should be able to generate next ticket number',
      function (done) {
        Counter
          .generate({ jurisdiction: jurisdiction, service: service },
            function (error, ticketNumber, counter) {

              expect(error).to.not.exist;
              expect(counter).to.exist;

              expect(ticketNumber).to.exist;
              expect(ticketNumber).to.be.a('string');
              expect(ticketNumber).to.be.equal('AB170002');

              done(error, counter);
            });
      });

    after(function (done) {
      Counter.remove(done);
    });

  });


  //describe concurrent
  parallel('concurrent - 2 thread', function () {

    before(function (done) {
      Counter.remove(done);
    });

    it('should be able to generate first ticket number', function (done) {
      Counter
        .generate({ jurisdiction: jurisdiction, service: service },
          function (error, ticketNumber, counter) {
            expect(error).to.not.exist;
            expect(counter).to.exist;

            expect(ticketNumber).to.exist;
            expect(ticketNumber).to.be.a('string');
            // expect(ticketNumber).to.be.equal('AB170001');

            done(error, counter);
          });
    });

    it('should be able to generate second ticket number', function (
      done) {
      Counter
        .generate({ jurisdiction: jurisdiction, service: service },
          function (error, ticketNumber, counter) {
            expect(error).to.not.exist;
            expect(counter).to.exist;

            expect(ticketNumber).to.exist;
            expect(ticketNumber).to.be.a('string');
            // expect(ticketNumber).to.be.equal('AB170002');

            done(error, counter);
          });
    });

    after(function (done) {
      Counter.remove(done);
    });

  });


  //describe concurrent
  parallel('concurrent - 4 thread', function () {

    before(function (done) {
      Counter.remove(done);
    });

    it('should be able to generate first ticket number', function (done) {
      Counter
        .generate({ jurisdiction: jurisdiction, service: service },
          function (error, ticketNumber, counter) {
            expect(error).to.not.exist;
            expect(counter).to.exist;

            expect(ticketNumber).to.exist;
            expect(ticketNumber).to.be.a('string');
            // expect(ticketNumber).to.be.equal('AB170001');

            done(error, counter);
          });
    });

    it('should be able to generate second ticket number', function (
      done) {
      Counter
        .generate({ jurisdiction: jurisdiction, service: service },
          function (error, ticketNumber, counter) {
            expect(error).to.not.exist;
            expect(counter).to.exist;

            expect(ticketNumber).to.exist;
            expect(ticketNumber).to.be.a('string');
            // expect(ticketNumber).to.be.equal('AB170002');

            done(error, counter);
          });
    });

    it('should be able to generate third ticket number', function (
      done) {
      Counter
        .generate({ jurisdiction: jurisdiction, service: service },
          function (error, ticketNumber, counter) {
            expect(error).to.not.exist;
            expect(counter).to.exist;

            expect(ticketNumber).to.exist;
            expect(ticketNumber).to.be.a('string');
            // expect(ticketNumber).to.be.equal('AB170003');

            done(error, counter);
          });
    });

    it('should be able to generate fourth ticket number', function (
      done) {
      Counter
        .generate({ jurisdiction: jurisdiction, service: service },
          function (error, ticketNumber, counter) {
            expect(error).to.not.exist;
            expect(counter).to.exist;

            expect(ticketNumber).to.exist;
            expect(ticketNumber).to.be.a('string');
            // expect(ticketNumber).to.be.equal('AB170004');

            done(error, counter);
          });
    });

    after(function (done) {
      Counter.remove(done);
    });

  });


  after(function (done) {
    Counter.remove(done);
  });


});
