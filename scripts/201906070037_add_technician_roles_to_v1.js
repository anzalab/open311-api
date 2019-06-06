//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var roles = [{
  "updatedAt": ISODate("2019-06-06T23:53:03.432Z"),
  "createdAt": ISODate("2019-06-06T23:53:03.432Z"),
  "name": "Artisan",
  "description": "Zonal Artisan"
}];

//upsert roles
roles.forEach(function (role) {
  const query = { name: role.name };
  db.roles.update(query, role, { upsert: true });
});
