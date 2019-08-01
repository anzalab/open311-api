//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var types = { 'Request': '#884bea', 'Complaint': '#954fc1', 'Enquiry': '#cd92f4', 'Maintainance': '#e8c9ff' };
types = Object.keys(types).map(function (type) {
  var code = type.charAt(0).toUpperCase();
  return {
    weight: 0,
    default: type === 'Request' ? true : false,
    preset: false,
    namespace: 'ServiceType',
    bucket: 'servicetypes',
    code: code,
    name: { en: type, sw: type },
    description: { en: type, sw: type },
    color: types[type],
    tags: ['servicetypes', 'servicetype', code.toLowerCase(), type.toLowerCase()],
    abbreviation: { en: code, sw: code },
    updatedAt: ISODate('2019-07-27T13:51:03.432Z'),
    createdAt: ISODate('2019-07-27T13:51:03.432Z')
  };
});

//upsert types
types.forEach(function (type) {
  var query = { code: type.code, 'name.en': type.name.en };
  db.predefines.update(query, type, { upsert: true });
});
