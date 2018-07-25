'use strict';


/**
 * @module Jurisdiction
 * @name Jurisdiction
 * @description An entity (e.g minicipal) responsible for addressing
 *              service request(issue).
 *
 *              It may be a self managed entity or division within another
 *              entity(jurisdiction) in case there is hierarchy.
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//Important!: ensure 2dsphere index before any geo queries

//TODO add service inverse relation mapping & use restrictive population
//TODO add service group inverse relation mapping & use restrictive population
//TODO add physical address
//TODO update jurisdiction ui to support color updates


//dependencies
const { Jurisdiction } = require('@codetanzania/majifix-jurisdiction');


/**
 * @name Jurisdiction
 * @description register JurisdictionSchema and initialize Jurisdiction
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = Jurisdiction;
