//establish connection
var conn = new Mongo();
var db = conn.getDB("open311");

var causes = [
  { name: "High Pressure", code: "HP" },
  { name: "Old Infrastructure", code: "OI" },
  { name: "External Intruders", code: "EI" },
  { name: "Disruption of DAWASA Infrastructure/Miscommunication", code: "DIM" },
  { name: "Wrong Spot Bill", code: "WSB" },
  { name: "Lack of Education/Information concern DAWASA bill", code: "LEI" },
  { name: "Power Outbreak", code: "PO" },
  { name: "Road Construction", code: "RC" },
  { name: "Insufficiant Water Production from the plant", code: "IWP" },
  { name: "Unsupportive Billing System", code: "UBS" },
  { name: "Fault Meters", code: "FM" },
];
const seeds = causes.map(function (seed) {
  return {
    weight: 1,
    default: false,
    preset: false,
    namespace: "QualityCause",
    bucket: "qualitycauses",
    code: seed.code,
    name: { en: seed.name, sw: seed.name },
    description: { en: seed.name, sw: seed.name },
    color: "#ba4ec2",
    tags: ["qualitycauses", "qualitycause", seed.code.toLowerCase()].concat(
      seed.name.split(/ |\//).map(function (part) {
        return part.trim().toLowerCase();
      })
    ),
    abbreviation: { en: seed.code, sw: seed.code },
    updatedAt: ISODate("2020-09-18T18:24:03.432Z"),
    createdAt: ISODate("2020-09-18T18:24:03.432Z"),
  };
});

//upsert default quality control data
seeds.forEach(function (seed) {
  var query = {
    namespace: seed.namespace,
    code: seed.code,
    "name.en": seed.name.en,
  };
  db.predefines.update(query, seed, { upsert: true });
});
