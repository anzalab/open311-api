'use strict';

/**
 * Setting model specification
 *
 * @description :: Server-side model specification for Setting
 */

//dependencies
var mongoose = require('mongoose');
var faker = require('faker');
var expect = require('chai').expect;
var Setting = mongoose.model('Setting');
var settings = [{
  key: faker.finance.account(),
  value: faker.lorem.sentence()
}, {
  key: faker.finance.account(),
  value: faker.lorem.sentence()
}, {
  key: faker.finance.account(),
  value: faker.lorem.sentence()
}, {
  key: faker.finance.account(),
  value: faker.random.number()
}, {
  key: faker.finance.account(),
  value: faker.random.number()
}];


describe('Setting', function () {
  before(function (done) {
    Setting
      .create([
        settings[2],
        settings[3],
        settings[4]
      ], function (error, _settings) {
        //reset settings
        settings.splice(2, _settings.length);

        settings = settings.concat(_settings);

        done(error, _settings);
      });
  });

  it('should be able to set string value and parse them into number',
    function (done) {
      var setting = new Setting({
        key: 'ok',
        value: '200'
      });

      setting.validate(function (error) {

        expect(error).to.not.exist;
        expect(setting.value).to.be.a('Number');

        done();
      });


    });


  it('should be able to create new setting', function (done) {
    Setting.create(settings[0], function (error, setting) {

      expect(error).to.not.exist;
      expect(setting).to.exist;

      expect(setting.key).to.equal(settings[0].key);
      expect(setting.value).to.equal(settings[0].value);

      settings[0] = setting;

      done(error, setting);
    });
  });


  it('should be able to find existing setting', function (done) {
    Setting.findById(settings[0]._id, function (error, setting) {

      expect(error).to.not.exist;
      expect(setting).to.exist;

      expect(setting.key).to.equal(settings[0].key);
      expect(setting.value).to.equal(settings[0].value);

      done(error, setting);
    });

  });


  it('should be able to update existing setting', function (done) {
    Setting.findByIdAndUpdate(settings[0]._id, settings[1], {
      upsert: true,
      new: true
    }, function (error, setting) {
      //update setting references

      expect(error).to.not.exist;
      expect(setting).to.exist;

      expect(setting.key).to.equal(settings[1].key);
      expect(setting.value).to.equal(settings[1].value);

      settings[0] = setting;

      done(error, setting);
    });
  });


  it('should be able to delete existing setting', function (done) {
    Setting.findByIdAndRemove(settings[0]._id, function (error, setting) {

      expect(error).to.not.exist;
      expect(setting).to.exist;

      expect(setting.key).to.equal(settings[0].key);
      expect(setting.value).to.equal(settings[0].value);

      done(error, setting);
    });
  });


  it('should be able to list existing settings', function (done) {
    Setting.paginate({
      page: 1,
      limit: 10
    }, function (error, settings, pages, total) {

      expect(error).to.not.exist;
      expect(pages).to.exist;
      expect(settings).to.exist;
      expect(total).to.exist;

      expect(total).to.be.at.least(1);

      done(error, settings);
    });
  });

  after(function (done) {
    Setting.remove(done);
  });

});
