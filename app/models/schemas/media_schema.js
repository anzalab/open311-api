'use strict';


/**
 * @module MediaSchema
 * @name MediaSchema
 * @description An attachment or file associated with an entity 
 *              e.g service request
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//media storage
const STORAGE_LOCAL = 'Local';
const STORAGE_REMOTE = 'Remote';
const STORAGES = [
  STORAGE_LOCAL,
  STORAGE_REMOTE
];


//MediaSchema Schema
const MediaSchema = new Schema({
  /**
   * @name uploadedAt
   * @description A time when a media uploaded
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  uploadedAt: {
    type: Date,
    default: new Date(),
    index: true
  },


  /**
   * @name name
   * @description A human readable name of the media
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    required: true,
    index: true
  },


  /**
   * @name caption
   * @description A human readable caption for the media
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  caption: {
    type: String
  },


  /**
   * @name mime
   * @description A format of the media
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  mime: {
    type: String,
    default: 'image/png'
  },


  /**
   * @name url
   * @description A filepath or remote url where a media is stored
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  url: {
    type: String,
    required: true
  },


  /**
   * @name storage
   * @description A store where a media can be found 
   *              i.e Local, Remote, Google Drive, Dropbox etc
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  storage: {
    type: String,
    default: STORAGE_LOCAL,
    enum: STORAGES
  },

}, { timestamps: true });

//exports Status Schema
module.exports = exports = MediaSchema;
