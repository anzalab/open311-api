'use strict';

process.env.NODE_ENV = 'test';

const { connect, clear, drop } = require('@lykmapipo/mongoose-test-helpers');

/* setup mongo test database */
before(done => connect(done));

/* clear mongo test database */
before(done => clear(done));

/* drop mongo test database */
after(done => drop(done));
