'use strict';

/**
 * @module Setting
 * @name Setting
 * @description manage setting(s)
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * @description enforce setting value as a string
 * @param {String} value 
 */
function set(value) {
  //chech if value is number
  const isNumber = !!value && !isNaN(value);

  //convert value to string
  if (isNumber) {
    return String(value);
  }

  //return un parsed value
  else {
    return value;
  }
}

//Setting Schema
const SettingSchema = new Schema({
  /**
   * @name key
   * @description name of the setting 
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  key: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    set: set,
    searchable: true
  },


  /**
   * @name value
   * @description  value of the setting
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  value: {
    type: String,
    trim: true,
    required: true,
    set: set,
    get: function (value) {
      //chech if value is number
      var isNumber = !!value && !isNaN(value);

      //convert value to number
      if (isNumber) {
        return Number(value);
      }

      //return un parsed value
      else {
        return value;
      }
    },
    searchable: true
  }

}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// SettingSchema Static Methods and Properties
//-----------------------------------------------------------------------------


/**
 * @name getAllAsMap
 * @description fetch all settings and return them as a map
 * @param  {Function} done [description]
 * @return {Object}        [description]
 */
SettingSchema.statics.getAllAsMap = function (done) {

  this.find(function (error, _settings) {
    let settings = {};

    if (_settings) {
      _.forEach(_settings, function (setting) {
        settings[setting.key] = setting.value;
      });
    }

    done(null, settings);

  });
};


/**
 * @name bulkUpdate
 * @description update settings in map format
 * @param  {Object}   settings a map of settings
 * @param  {Function} done    [description]
 * @return {[type]}           [description]
 */
SettingSchema.statics.bulkUpdate = function (settings, done) {
  //references
  const Setting = this;

  //prepare parallel update work
  settings = _.map(settings, function (value, key) {

    return function updateSetting(next) {
      Setting.findOneAndUpdate({
        key: key
      }, {
        value: value
      }, {
        upsert: true,
        new: true
      }, next);
    };

  });

  //bulk update settings
  async.parallel(_.compact(settings), function (error /*,response*/ ) {
    if (error) {
      done(error);
    } else {
      Setting.getAllAsMap(done);
    }
  });
};


//exports Setting model
module.exports = mongoose.model('Setting', SettingSchema);
