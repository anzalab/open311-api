// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// obtain un comfirmed service requests
db.servicerequests.find({
  "method.name": { $in: ["USSD", "Mobile"] },
  "operator": { "$eq": null }
}).limit(1).forEach(sr => {
  if (sr.jurisdiction && sr.address) {
    // obtain its current jurisdiction
    var jurisdiction = db.jurisdictions.findOne({ _id: sr.jurisdiction });

    // deduce its jurisdiction from address
    var address = sr.address.split(',').pop().trim();
    jurisdiction =
      db.jurisdictions.findOne({ name: address }) || jurisdiction;

    // fix jurisdiction if not same
    if (jurisdiction) {
      db.servicerequests.update({ _id: sr._id }, {
        $set: { jurisdiction: jurisdiction._id }
      });
    }
  }
});
