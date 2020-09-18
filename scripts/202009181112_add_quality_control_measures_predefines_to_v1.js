//establish connection
var conn = new Mongo();
var db = conn.getDB("open311");

var measures = [
  { name: "Installation of Pressure Regulators", code: "IPR" },
  { name: "Replace Pipe/Old Infrastructure", code: "RPOI" },
  { name: "Remove Intruders", code: "RI" },
  {
    name: "Enhance Communication and Information amoung the partners",
    code: "ECI",
  },
  { name: "Activate Validation Process", code: "AVP" },
  { name: "Bill Clarification", code: "BC" },
  { name: "Public Education to Customers", code: "PEC" },
  {
    name: "Sufficient and efficient power supply to the main plants",
    code: "SEP",
  },
  {
    name: "Good Communication and Information with other  partners",
    code: "GCI",
  },
  { name: "Water Ration", code: "WR" },
  { name: "System Upgraded and Updates", code: "SUU" },
  { name: "Meter Exchange/Replaced", code: "MER" },
];
const seeds = measures.map(function (seed) {
  return {
    weight: 1,
    default: false,
    preset: false,
    namespace: "QualityMeasure",
    bucket: "qualitymeasures",
    code: seed.code,
    name: { en: seed.name, sw: seed.name },
    description: { en: seed.name, sw: seed.name },
    color: "#ba4ec2",
    tags: ["qualitymeasures", "qualitymeasure", seed.code.toLowerCase()].concat(
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
