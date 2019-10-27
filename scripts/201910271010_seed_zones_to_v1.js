// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// extract to zones.json
var seeds = {
  'Ilala': ['Upanga', 'Kariakoo', 'Mchikichini', 'Buguruni'],
  'Magomeni': ['Mabibo', 'Sinza', 'Kimambu', 'Matama'],
  'Kinondoni': [
    'Kinondoni', 'Mwananyamala', 'Oysterbay', 'Masaki',
    'Makumbusho', 'Mikocheni', 'Msasani'
  ],
  'Kawe': [
    'Goba', 'Mikocheni', 'Kijitonyama', 'Makongo Juu', 'Mbezi Juu',
    'Mbezi Beach', 'Matosa'
  ],
  'Tabata': ['Kinyerezi', 'Segerea', 'Tabata', 'Buguruni'],
  'Temeke': [
    'Tandika', 'Keko', 'Mtoni', 'Kilungule', 'Kibonde Maji',
    'Kiwalani'
  ],
  'Tegeta': [
    'Mbweni', 'Bunju', 'Mabwepande', 'Salasala Chini',
    'Salasala Juu', 'Boko', 'Tegeta', 'Kunduchi',
    'Wazo', 'Boko NHC'
  ],
  'Bagamoyo': [
    'Kiembeni', 'Kerege', 'Zinga', 'Bagamoyo Mjini', 'Sunguvuni',
    'Mapinga'
  ],
  'Ubungo': ['Ubungo', 'Kibamba', 'Mbezi', 'Temboni', 'Stopover'],
  'Kibaha': [
    'Mlandizi', 'Janga', 'Kongowe', 'Maili Moja', 'Mkoani', 'Mkuza',
    'Miembe Saba'
  ]
};

Object.keys(seeds).forEach(jurisdiction => {
  jurisdiction = db.jurisdictions.findOne({ name: jurisdiction });
  if (jurisdiction && jurisdiction._id) {
    var zones = seeds[jurisdiction.name];
    zones = zones.forEach(zone => {
      var tags = zone.split(' ');
      var code = [].concat(tags)
        .map(z => z.charAt(0).toUpperCase()).join('');
      tags = ['zone', 'zones', jurisdiction.name]
        .concat(tags).map(t => t.toLowerCase());
      var query = {
        namespace: 'Zone',
        bucket: 'zones',
        // code: code,
        'name.en': zone,
        'name.sw': zone,
        'relations.jurisdiction': jurisdiction._id
      };
      zone = {
        namespace: 'Zone',
        bucket: 'zones',
        code: code,
        color: '#F38CC8',
        weight: 0,
        default: false,
        preset: false,
        name: { en: zone, sw: zone },
        description: { en: zone, sw: zone },
        tags: tags,
        abbreviation: { en: code, sw: code },
        updatedAt: ISODate('2019-10-27T11:03:03.432Z'),
        createdAt: ISODate('2019-10-27T11:03:03.432Z'),
        relations: { jurisdiction: jurisdiction._id }
      };
      zone = db.predefines.update(query, zone, { upsert: true });
    });
  }
});
