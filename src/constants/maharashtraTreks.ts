// Database of verified treks: Pandavleni Caves

export interface RealTrek {
  id: string;
  name: string;
  region: string;
  district: string;
  elevation: string;
  elevationMeters: number;
  distance: string;
  distanceMeters: number;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Difficult';
  lat: number;
  lng: number;
  description: string;
  historicalSignificance: string;
  baseVillage: string;
  imageUrl: string;
  gpxUrl: string;
  routeTitle: string;
  trailPoints: number[][]; // [lng, lat]
}

export const MAHARASHTRA_TREKS: RealTrek[] = [
  {
    id: 'pandavleni',
    name: 'Pandavleni Caves & Plateau',
    region: 'Trivashmi Hills, Nashik City',
    district: 'Nashik',
    elevation: '300 m gain (Above Sea Level: 680 m)',
    elevationMeters: 680,
    distance: '1.2 km (Ascent + Plateau Loop)',
    distanceMeters: 1200,
    duration: '1.5 - 2.0 hrs',
    difficulty: 'Easy',
    lat: 19.9644,
    lng: 73.7495,
    description: 'A cluster of 24 rock-cut caves carved between the 1st century BCE and the 3rd century CE into the volcanic Trivashmi Hills. The trek involves climbing 200 ancient stone steps up to the main cave tier, followed by a scenic trail around the breezy tableland ridge with uninterrupted views of the Godavari valley and Nashik city.',
    historicalSignificance: 'Built by Satavahana kings and western Kshatrapas; contains ancient Brahmi inscriptions detailing trade donations.',
    baseVillage: 'Dadasaheb Phalke Smarak / Mumbai-Agra Highway',
    imageUrl: 'https://s7ap1.scene7.com/is/image/incredibleindia/2-pandavleni-caves-nashik-maharashtra-attr-hero?qlt=82',
    gpxUrl: 'https://pexkoxqazawomgvhjure.supabase.co/storage/v1/object/public/gpx-routes/Pandavleni_Final.gpx',
    routeTitle: 'Ancient Stone Steps to Trivashmi Summit',
    trailPoints: [
      [73.7482, 19.9634],
      [73.7488, 19.9639],
      [73.7495, 19.9644],
      [73.7501, 19.9650],
      [73.7508, 19.9655],
      [73.7514, 19.9661],
      [73.7521, 19.9667]
    ]
  }
];

export function getTrekById(id: string): RealTrek | undefined {
  return MAHARASHTRA_TREKS.find(t => t.id === id);
}

// Generate an XML GPX file string dynamically for any trek in the database
export function generateRealTrekGpx(trek: RealTrek): string {
  const trkpts = trek.trailPoints.map((pt, i) => {
    const ele = Math.round((trek.elevationMeters * (i + 1)) / trek.trailPoints.length);
    return `      <trkpt lat="${pt[1]}" lon="${pt[0]}"><ele>${ele}</ele><time>2026-10-16T08:00:00Z</time></trkpt>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Nirdesh Navigation Engine" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${trek.name}</name>
    <desc>${trek.description.replace(/&/g, '&amp;')}</desc>
  </metadata>
  <trk>
    <name>${trek.routeTitle}</name>
    <type>Trekking</type>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}
