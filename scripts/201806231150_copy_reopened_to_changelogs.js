//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//convert service request changelogs to changelogs
db.servicerequests
  .find({}, { _id: 1, operator: 1, reopenedAt: 1 })
  .forEach(function (request) {

    //ensure valid changelog
    if (request._id && request.operator && request.reopenedAt) {

      //prepare changelog
      var changelog = {
        request: request._id,
        changer: request.operator,
        reopenedAt: request.reopenedAt,
        visibility: 'Private',
        createdAt: request.reopenedAt,
        updatedAt: request.reopenedAt
      };

      //persist
      db.changelogs.insert(changelog);

    }

  });
