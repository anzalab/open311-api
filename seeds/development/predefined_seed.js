'use strict';

//dependencies


/**
 * @description export settings seeder
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
module.exports = [{
  name: 'name',
  value: 'Sample Company',
  default: true
}, {
  name: 'email',
  value: 'info@sample.com',
  default: true
}, {
  name: 'phoneNumber',
  value: '255714095061',
  default: true
}, {
  name: 'dateFormat',
  value: 'dd/MM/yyyy',
  default: true
}, {
  name: 'timeFormat',
  value: 'hh:mm:ss',
  default: true
}, {
  name: 'defaultPassword',
  value: 'guest',
  default: true
}];
