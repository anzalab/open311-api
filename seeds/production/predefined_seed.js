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
  },


  //statuses
  {
    group: 'Status',
    name: 'Open',
    value: {
      weight: -5,
      color: '#0D47A1' //material blue-900
    },
    default: true
  }, {
    group: 'Status',
    name: 'In Progress',
    value: {
      weight: 0,
      color: '#F9A825' //material yellow-800
    }
  }, {
    group: 'Status',
    name: 'Closed',
    value: {
      weight: 5,
      color: '#1B5E20' //material green-900
    }
  }

];
