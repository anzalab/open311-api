'use strict';

//dependencies

/**
 * @description seed settings
 */
var settings = [{
    key: 'name',
    value: 'Sample Company'
}, {
    key: 'email',
    value: 'info@sample.com'
}, {
    key: 'phoneNumber',
    value: '255714095061'
}, {
    key: 'dateFormat',
    value: 'dd/MM/yyyy'
}, {
    key: 'timeFormat',
    value: 'hh:mm:ss'
}, {
    key: 'defaultPassword',
    value: 'guest'
}];


/**
 * @description export settings seeder
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
module.exports = settings;
