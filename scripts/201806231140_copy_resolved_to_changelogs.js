//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//convert service request changelogs to changelogs
db.servicerequests
  .find({}, { _id: 1, operator: 1, resolvedAt: 1 })
  .forEach(function (request) {

    //ensure valid changelog
    if (request._id && request.operator && request.resolvedAt) {

      //prepare changelog
      var changelog = {
        request: request._id,
        changer: request.operator,
        resolvedAt: request.resolvedAt,
        visibility: 'Private',
        createdAt: request.resolvedAt,
        updatedAt: request.resolvedAt
      };

      //persist
      db.changelogs.insert(changelog);

    }

  });
