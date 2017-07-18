'use strict';


//dependencies
const path = require('path');
const expect = require('chai').expect;
const Send = require(path.join(__dirname, '..', '..', 'app', 'libs', 'send'));

describe('Send', function () {

  it(
    'should be able to format phone number to e.164 format',
    function (done) {

      expect(Send).to.exist;
      expect(Send).to.be.an('object');

      expect(Send.formatPhoneNumberToE164).to.exist;
      expect(Send.formatPhoneNumberToE164).to.be.a('function');

      //07xx
      expect(Send.formatPhoneNumberToE164('0714011011'))
        .to.be.equal('255714011011');

      //06xx
      expect(Send.formatPhoneNumberToE164('0655011011'))
        .to.be.equal('255655011011');

      //255xx
      expect(Send.formatPhoneNumberToE164('255655011011'))
        .to.be.equal('255655011011');

      done();

    });

});
