'use strict';

/**
 * @description cross check if config can be loaded from heroku config file
 */

//set environment to heroku
process.env.NODE_ENV = 'heroku';

//dependencies
const config = require('config');


describe('heroku', function () {

  describe('config', function () {

    it('shoulde be able to load heroku config', function () {
      const baseUrl = config.get('baseUrl');
      console.log(baseUrl);
      console.log(process.env.NODE_ENV);
    });

  });

  after(function () {
    //re-set environment to test
    process.env.NODE_ENV = 'test';
  });
});
