'use strict';


/* set environment to test */
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost/open311-test';


/* setup mongoose */
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/* sinon setup */
require('chai').use(require('sinon-chai'));
require('sinon');
require('sinon-mongoose');
