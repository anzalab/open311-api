// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// obtain servicerequests
db.servicerequests.find().forEach(sr => {
  // find latest changelog
  var changelogs = db.changelogs.find().sort({ createdAt: -1 }).limit(1);
  // set common timestamps
  if (changelogs && changelogs.length >= 1) {
    var changelog = changelogs[0];
    if (changelog) {
      var changedAt = changelog.resolvedAt || changelog.createdAt;
      var changedBy = changelog.changer
      var updates = {
        assignedAt: sr.assignedAt || changedAt,
        attendedAt: sr.attendendAt || changedAt,
        completedAt: sr.completedAt || changedAt,
        verifiedAt: sr.verifiedAt || changedAt,
        approvedAt: sr.approvedAt || changedAt,
        assignee: sr.assignee || changedBy,
      };
      db.servicerequests.update({ _id: sr._id }, { $set: updates });
    }
  }
});
