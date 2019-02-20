//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//get close status
var status = db.status.findOne({ "name.en": "Closed" });


//count resolved not closed
// db.servicerequests.count({resolvedAt:{$ne:null}, status:{$ne: status._id}})


//set status to closed to all resolved service requests
if (status && status._id) {
  db.servicerequests.updateMany({
    resolvedAt: { $ne: null },
    status: { $ne: status._id }
  }, {
    $set: {
      status: status._id
    }
  });
}
