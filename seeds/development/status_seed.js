'use strict';


//dependencies


/**
 * @description seed statuses
 */
const statuses = [{
  name: 'Open',
  weight: -5,
  color: '#0D47A1' //material blue-900
}, {
  name: 'In Progress',
  weight: 0,
  color: '#F9A825' //material yellow-800
}, {
  name: 'Closed',
  weight: 5,
  color: '#1B5E20' //material green-900
}];


/**
 * @description export statuses seeder
 */
module.exports = statuses;
