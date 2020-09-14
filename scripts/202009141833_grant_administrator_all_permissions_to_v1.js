//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var administrator = db.roles.findOne({ name: 'Administrator' });

var permissions =
  db.permissions.find().map(function (permission) { return permission._id; });

//grant administrator all permissions
db.roles.update({ _id: administrator._id }, { $set: { permissions: permissions } });
