//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//get close status
var status = db.status.findOne({ "name.en": "Closed" });


//count closed not resolved
// db.servicerequests.count({resolvedAt:{$eq:null}, status:{$eq: ObjectId("5968b63948dfc224bb47743c")}});

//set status to closed to all resolved service requests
if (status && status._id) {
  db.servicerequests.find({
    resolvedAt: { $eq: null },
    status: { $eq: status._id }
  }).forEach(function (request) {
    var updates = {
      $set: { wasResolveTicketSent: true },
      $set: { resolvedAt: request.updatedAt }
    };
    db.servicerequests.updateMany({
      _id: request._id
    }, updates);
  });
}

//get supervisor
var supervisor = db.parties.findOne({ "email": "viviansilayo@dawasco.com" });

// set changelog for resolve
// db.servicerequests.count({ $expr : {$eq: ["$resolvedAt","$updatedAt"]}})
// db.servicerequests.find({ $expr: { $eq: ["$resolvedAt", "$updatedAt"] } })
db.servicerequests.find({resolvedAt: { $ne: null }}).forEach(function (request) {

    //ensure valid changelog
    if (request._id && request.operator && request.resolvedAt) {

      if(request.resolvedAt === request.updatedAt){

        //prepare changelog
        var changelog = {
          request: request._id,
          changer: supervisor._id,
          resolvedAt: request.resolvedAt,
          visibility: 'Private',
          createdAt: request.resolvedAt,
          updatedAt: request.resolvedAt
        };

        //persist
        db.changelogs.insert(changelog);

      }

    }

  });
