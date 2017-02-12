'use strict';


//dependencies


/**
 * @description seed priorities
 */
const priorities = [{
  name: 'Low',
  weight: 5,
  color: '#1B5E20' //material green-900
}, {
  name: 'Normal',
  weight: 0,
  color: '#4CAF50' //material green-500
}, {
  name: 'Medium',
  weight: -5,
  color: '#FFC107' //material amber-500
}, {
  name: 'High',
  weight: -10,
  color: '#FF9800' //material orange-500
}, {
  name: 'Critical',
  weight: -15,
  color: '#F44336' //material red-500
}];


/**
 * @description export priorities seeder
 */
module.exports = priorities;
