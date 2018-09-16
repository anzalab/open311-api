'use strict';


/**
 * @module Service
 * @name Service
 * @description An acceptable service (request types)(e.g Water Leakage)
 *              offered(or handled) by a specific jurisdiction.
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const { Service } = require('@codetanzania/majifix-service');


//static utility to map service to legacy service structure
Service.mapToLegacy = function _mapToLegacy(service) {
  const _service = service.toObject();
  _service.name = service.name.en;
  _service.description = (service.description || {}).en;
  _service.isExternal = (service.flags || {}).external;
  if (service.group && service.group.name) {
    _service.group.name = service.group.name.en;
    _service.group.description = (service.group.description || {}).en;
  }
  if (service.priority && service.priority.name) {
    _service.priority.name = service.priority.name.en;
    _service.priority.description = (service.priority.description || {}).en;
  }
  return _service;
};


/**
 * @name Service
 * @description register ServiceSchema and initialize Service
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = Service;
