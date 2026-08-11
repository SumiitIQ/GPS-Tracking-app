import * as FileSystem from 'expo-file-system/legacy';

export type TrackPoint = {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp: Date | number | string;
};

export async function generateGPX(
  points: TrackPoint[],
  metadata: { name: string; desc: string }
): Promise<{ path: string; content: string; fileName: string }> {
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SummitIQ Mobile" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${metadata.name}</name>
    <desc>${metadata.desc}</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${metadata.name}</name>
    <trkseg>
`;

  for (const pt of points) {
    gpx += `      <trkpt lat="${pt.lat}" lon="${pt.lng}">\n`;
    if (pt.elevation !== undefined) {
      gpx += `        <ele>${pt.elevation}</ele>\n`;
    }
    const timeStr = pt.timestamp ? new Date(pt.timestamp).toISOString() : new Date().toISOString();
    gpx += `        <time>${timeStr}</time>\n`;
    gpx += `      </trkpt>\n`;
  }

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  const fileName = `summitiq_track_${Date.now()}.gpx`;
  const path = `${FileSystem.documentDirectory}${fileName}`;
  
  await FileSystem.writeAsStringAsync(path, gpx, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return { path, content: gpx, fileName };
}
