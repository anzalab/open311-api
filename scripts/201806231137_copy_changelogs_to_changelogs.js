//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

//convert service request changelogs to changelogs
db.servicerequests
  .find({}, { _id: 1, changelogs: 1 })
  .forEach(function (request) {

    //ensure valid changelog
    if (request._id && request.changelogs && request.changelogs.length > 0) {

      //iterate over service request changelogs
      request.changelogs.forEach(function (changelog) {

        //reshape changelog
        changelog.request = request._id;
        delete changelog._id;

        //persist
        db.changelogs.insert(changelog);

      });

    }

  });
