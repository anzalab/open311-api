// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// obtain servicerequests
db.servicerequests.find().forEach(sr => {
  // fix confirmed timestamp same as created timestamp
  db.servicerequests.update({ _id: sr._id }, {
    $set: {
      confirmedAt: sr.createdAt
    }
  });
});
