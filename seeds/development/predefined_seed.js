'use strict';

//dependencies


/**
 * @description export settings seeder
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
module.exports = [
  //settings
  {
    name: 'dateFormat',
    value: 'dd/MM/yyyy',
    default: true
  }, {
    name: 'timeFormat',
    value: 'hh:mm:ss',
    default: true
  }, {
    name: 'password',
    value: 'guest',
    default: true
  }

  //statuses
  //priorities
];
