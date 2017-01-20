'use strict';

/**
 * @name autoset
 * @description mongoose plugin to allow to set ref from model instance(s)
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 *
 * const drinks = Drink.find(<criteria>);
 * const waitress = User.findById(<id>);
 * 
 * const food = new Food({
 *   drinks: drinks,
 *   waitress: waitress
 * });
 */

//dependencies
const _ = require('lodash');

module.exports = exports = function (schema /*, options*/ ) {

  /**
   * @description extend mongoose ObjectId schema type with object setter
   */
  schema.eachPath(function (path, schemaType) {
    //check for autoset
    const allowAutoset = schemaType &&
      schemaType.instance === 'ObjectID' &&
      (schemaType.options && schemaType.options.autoset);

    //handle auto set schema options
    if (allowAutoset) {
      //prevent custom setter overrides
      if (!schemaType.options.set) {
        //add object setter
        schemaType.options.set = function (val) {
          //handle auto set for array values
          if (_.isArray(val)) {

            val = _.map(val, function (v) {
              return v._id ? v._id : v;
            });

            return _.compact(val);
          }

          //handle auto set for non array values
          else {
            return val._id ? val._id : val;
          }
        };
      }
    }

  });
};
