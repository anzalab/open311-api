//TODO check if has no location
db.servicerequests.find().forEach(function (servicerequest) {

  if (servicerequest.reporter) {

    if (servicerequest.reporter.account) {

      var account = servicerequest.reporter.account;
      var phone = servicerequest.reporter.phone;
      var phones = [phone, Number(phone), '255' + Number(phone)];

      var isValidAccount =
        isNaN(servicerequest.reporter.account);

      if (isValidAccount) {

        //1. common cleanup regex
        var cleanedAccount =
          account.replace(/\ \//g, '/').replace(/\/\ /g, '/');
        cleanedAccount =
          cleanedAccount.replace(/\ \,/g, '/').replace(/\,\ /g, '/');
        cleanedAccount = cleanedAccount.replace(/ and /g, '/');
        cleanedAccount = cleanedAccount.replace(/and/g, '/');
        cleanedAccount = cleanedAccount.replace(/Mteja/g, '');
        cleanedAccount = cleanedAccount.replace(/\ au /g, '/');
        cleanedAccount = cleanedAccount.replace(/\ & /g, '/');
        cleanedAccount = cleanedAccount.replace(/\+/g, '');
        cleanedAccount =
          cleanedAccount.replace(/\,/g, '/').replace(/\-/g, '/');
        cleanedAccount = cleanedAccount.split(']').join('/');
        cleanedAccount = cleanedAccount.split(/\s+/).join('/');
        cleanedAccount = cleanedAccount.replace(/\)/g, '/');
        cleanedAccount = cleanedAccount.replace(/\(/g, '/');
        cleanedAccount =
          cleanedAccount.replace(/\[/g, '').replace(/\]/g, '');
        cleanedAccount = cleanedAccount.split('/').join('/');

        //2. normalize account to uppercase
        cleanedAccount = cleanedAccount.toUpperCase();

        //find accounts
        var customerAccount = db.accounts.findOne({
          $or: [{
            number: { $in: cleanedAccount.split('/') }
          }, {
            phone: {
              $in: phones
            }
          }]
        });
        if (customerAccount) {
          //prepare service request location
          var updates = {
            'reporter.account': customerAccount.number,
            'location.type': 'Point',
            'location.coordinates': [
              customerAccount.longitude,
              customerAccount.latitude
            ]
          };

          //update service request location
          db.servicerequests.update({ _id: servicerequest._id }, { $set: updates });

          var hit =
            'Hit:: account: ' + account + ' , phones: ' + phones;
          print(hit);

        } else {
          var miss =
            'Miss:: account: ' + account + ' , phones: ' + phones;
          print(miss);
        }
      }

    }

  }

});
