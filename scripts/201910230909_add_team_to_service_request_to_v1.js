// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// update team for all existing service requests
db.servicerequests.find({
  $or: [{ operator: { $ne: null } }, { assignee: { $ne: null } }]
}).forEach(sr => {

  // obtain members
  var members = [];
  if (sr.operator) {
    members = members.concat([sr.operator]);
  }
  if (sr.assignee) {
    members = members.concat([sr.assignee]);
  }

  // update team member if not exists
  if (members) {
    db.servicerequests.update({ _id: sr._id }, {
      $addToSet: { team: { $each: members } }
    });
  }
});
