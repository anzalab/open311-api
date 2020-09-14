//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var name = 'Unknown';
var code = 'UNK';
const seeds = [{
    weight: 0,
    default: true,
    preset: false,
    namespace: 'QualityCause',
    bucket: 'qualitycauses',
    code: code,
    name: { en: name, sw: name },
    description: { en: name, sw: name },
    color: '#ba4ec2',
    tags: ['qualitycauses', 'qualitycause', code.toLowerCase(), name.toLowerCase()],
    abbreviation: { en: code, sw: code },
    updatedAt: ISODate('2020-09-14T18:24:03.432Z'),
    createdAt: ISODate('2020-09-14T18:24:03.432Z')
  },
  {
    weight: 0,
    default: true,
    preset: false,
    namespace: 'QualityMeasure',
    bucket: 'qualitymeasures',
    code: code,
    name: { en: name, sw: name },
    description: { en: name, sw: name },
    color: '#884bea',
    tags: ['qualitymeasures', 'qualitymeasure', code.toLowerCase(), name.toLowerCase()],
    abbreviation: { en: code, sw: code },
    updatedAt: ISODate('2020-09-14T18:24:03.432Z'),
    createdAt: ISODate('2020-09-14T18:24:03.432Z')
  }, {
    weight: 0,
    default: true,
    preset: false,
    namespace: 'QualityAdvisory',
    bucket: 'qualityadvisories',
    code: code,
    name: { en: name, sw: name },
    description: { en: name, sw: name },
    color: '#954fc1',
    tags: ['qualityadvisories', 'qualityadvisory', code.toLowerCase(), name.toLowerCase()],
    abbreviation: { en: code, sw: code },
    updatedAt: ISODate('2020-09-14T18:24:03.432Z'),
    createdAt: ISODate('2020-09-14T18:24:03.432Z')
  }
];

//upsert default quality control data
seeds.forEach(function (seed) {
  var query = {
    namespace: seed.namespace,
    code: seed.code,
    'name.en': seed.name.en
  };
  db.predefines.update(query, seed, { upsert: true });
});
