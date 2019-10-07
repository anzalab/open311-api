// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// obtain servicerequests
db.servicerequests.find().forEach(sr => {
  // fix changelog common fields
  db.changelogs.update({ request: sr._id }, {
    $set: {
      jurisdiction: sr.jurisdiction,
      zone: sr.zone,
      group: sr.group,
      type: sr.type,
      service: sr.service
    }
  }, { multi: true });
});
