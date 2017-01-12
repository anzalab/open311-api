'use strict';

/**
 * Predefined model specification
 *
 * @description :: Server-side model specification for Predefined
 */

//dependencies
const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;
const Predefined = mongoose.model('Predefined');
let predefined;

describe('Predefined', function () {

  it('should be able to create new predefined', function (done) {

    predefined = {
      name: faker.random.word(),
      value: faker.random.word(),
    };

    Predefined
      .create(predefined, function (error, created) {

        expect(error).to.not.exist;
        expect(created).to.exist;

        expect(created._id).to.exist;

        expect(created.name).to.be.equal(predefined.name);
        expect(created.value).to.be.equal(predefined.value);
        expect(created.group).to.exist;
        expect(created.default).to.exist;

        predefined = created;

        done(error, created);
      });

  });


  it('should be able to find existing predefined', function (done) {

    Predefined
      .findById(predefined._id, function (error, found) {

        expect(error).to.not.exist;
        expect(found).to.exist;

        expect(found._id).to.exist;
        expect(found._id).to.eql(predefined._id);

        expect(found.name).to.be.equal(predefined.name);
        expect(found.value).to.be.equal(predefined.value);
        expect(found.group).to.be.equal('Setting');
        expect(found.default).to.be.equal(false);

        done(error, found);
      });

  });


  it('should be able to update existing predefined', function (done) {

    const updates = {
      value: faker.random.word(),
      default: true
    };

    Predefined
      .findByIdAndUpdate(predefined._id, updates, {
        upsert: true,
        new: true
      }, function (error, updated) {

        expect(error).to.not.exist;
        expect(updated).to.exist;

        expect(updated._id).to.exist;
        expect(updated._id).to.be.eql(predefined._id);

        expect(updated.name).to.be.equal(predefined.name);
        expect(updated.value).to.be.equal(updates.value);
        expect(updated.group).to.be.equal('Setting');
        expect(updated.default).to.be.equal(updates.default);

        //update predefined references
        predefined = updated;

        done(error, updated);
      });
  });


  it('should be able to list existing predefineds', function (done) {

    Predefined
      .paginate({
        page: 1,
        limit: 10
      }, function (error, predefineds, pages, total) {

        expect(error).to.not.exist;
        expect(pages).to.exist;
        expect(predefineds).to.exist;
        expect(total).to.exist;

        //TODO application specific assertions

        done(error, predefineds);
      });

  });


  it('should be able to delete existing predefined', function (done) {

    Predefined
      .findByIdAndRemove(predefined._id, function (error, removed) {

        expect(error).to.not.exist;
        expect(removed).to.exist;

        expect(removed._id).to.exist;
        expect(removed._id).to.be.eql(predefined._id);

        expect(removed.name).to.be.equal(predefined.name);
        expect(removed.value).to.be.equal(predefined.value);
        expect(removed.group).to.be.equal(predefined.group);
        expect(removed.default).to.be.equal(predefined.default);

        done(error, removed);
      });

  });

  after(function (done) {
    Predefined.remove(done);
  });

});
