'use strict';

/**
 * @description cross check if config can be loaded from heroku config file
 */

//set environment to heroku
process.env.NODE_ENV = 'heroku';

//set mongodb uri
process.env.MONGODB_URI =
  'mongodb://heroku_opqr:1234@ds75767.mlab.com:27017/heroku_opqr';

//dependencies
const config = require('config');
const expect = require('chai').expect;


describe('heroku', function () {

  describe('process.env', function () {

    it('NODE_ENV should be `heroku`', function () {
      expect(process.env.NODE_ENV).to.exist;
      expect(process.env.NODE_ENV).to.be.equal('heroku');
    });

  });

  describe('config', function () {

    it('shoulde be able to load heroku config', function () {
      const baseUrl = config.get('baseUrl');
      expect(baseUrl).to.exist;
    });

    it('should be able to parse `MONGODB_URI`', function () {
      const mongoose = config.get('mongoose');
      expect(mongoose).to.exist;
      expect(mongoose.database).to.be.equal('heroku_opqr');
      expect(mongoose.user).to.be.equal('heroku_opqr');
      expect(mongoose.password).to.be.equal('1234');
      expect(mongoose.host).to.be.equal('ds75767.mlab.com');
      expect(mongoose.port).to.be.equal(27017);
    });

  });

  after(function () {
    //re-set environment to test
    process.env.NODE_ENV = 'test';
  });

});
