'use strict';


//dependencies


/**
 * @description seed statuses
 */
const statuses = [{
  name: 'Dropped',
  weight: -20,
  color: '#1A237E' //material indigo-900
}, {
  name: 'Open',
  weight: -5,
  color: '#0D47A1' //material blue-900
}, {
  name: 'Escalated',
  weight: 0,
  color: '#EF6C00' //material orange-800
}, {
  name: 'In Progress',
  weight: 5,
  color: '#F9A825' //material yellow-800
}, {
  name: 'Closed',
  weight: 10,
  color: '#1B5E20' //material green-900
}];


/**
 * @description export statuses seeder
 */
module.exports = statuses;
