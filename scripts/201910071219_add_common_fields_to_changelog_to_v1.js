// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// obtain servicerequests
db.servicerequests.find().forEach(sr => {
  // prepare changes
  var $set = { confirmedAt: sr.confirmedAt || sr.createdAt };
  var $unset = {};

  // jurisdiction
  if (sr.jurisdiction) {
    $set.jurisdiction = sr.jurisdiction;
  } else { $unset.jurisdiction = ''; }
  if (sr.zone) { $set.zone = sr.zone; } else { $unset.zone = ''; }
  if (sr.group) { $set.group = sr.group; } else { $unset.group = ''; }
  if (sr.type) { $set.type = sr.type; } else { $unset.type = ''; }
  if (sr.service) { $set.service = sr.service; } else { $unset.service = ''; }

  // fix changelog common fields
  db.changelogs.update({ request: sr._id }, {
    $set: $set,
    $unset: $unset
  }, { multi: true });
});
