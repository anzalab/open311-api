// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// update tags for all existing service requests
db.servicerequests.find().forEach(sr => {
  // TODO aggregate refs to build tags
  // compute tags
  var tags = []
    .concat(String(sr.reporter.name).match(/\w+/g))
    .concat(String(sr.reporter.phone).match(/\w+/g))
    .concat(String(sr.reporter.account).match(/\w+/g))
    .concat(String(sr.address).match(/\w+/g))
    .concat(String(sr.code).match(/\w+/g));

  // cleanup tags
  tags = [].concat(tags.filter(
    tag => tag !== null && tag !== 'undefined' && tag !== 'null' && tag
    .length > 1
  ));
  tags = [].concat(tags.map(tag => tag.trim().toLowerCase()));

  // update tags
  db.servicerequests.update({ _id: sr._id }, {
    $addToSet: { tags: { $each: tags } }
  });
});
