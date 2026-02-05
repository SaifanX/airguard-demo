import * as turf from '@turf/turf';
import { Coordinate, Zone, ZoneType, DroneSettings } from '../types';
import { RESTRICTED_ZONES } from '../data/zones';

export const calculatePathRisk = (
  path: Coordinate[],
  settings: DroneSettings
): { riskScore: number; violations: string[] } => {
  let riskScore = 0;
  const violations: string[] = [];

  if (path.length < 2) return { riskScore: 0, violations: [] };

  // 1. Create LineString from path
  const lineCoordinates = path.map(p => [p.lng, p.lat]);
  const line = turf.lineString(lineCoordinates);

  // 2. Check Altitude
  if (settings.altitude > 120) {
    riskScore += 50; // Immediate caution
    violations.push(`Altitude violation: ${settings.altitude}m > 120m limit`);
  }

  // 3. Check Distance (Visual Line of Sight)
  const lengthKm = turf.length(line, { units: 'kilometers' });
  if (lengthKm > 4) {
    riskScore = Math.max(riskScore, 50);
    violations.push(`BVLOS Risk: Path length ${lengthKm.toFixed(2)}km > 4km`);
  }

  // 4. Check Zones
  RESTRICTED_ZONES.forEach(zone => {
    // Create polygon from zone coords (ensure closed loop)
    const polyCoords = zone.coordinates.map(c => [c.lng, c.lat]);
    polyCoords.push(polyCoords[0]); // Close the ring
    const polygon = turf.polygon([polyCoords]);

    // Check intersection
    const intersects = turf.booleanIntersects(line, polygon);
    
    // Check if points are inside (for takeoff/landing)
    const startPt = turf.point(lineCoordinates[0]);
    const endPt = turf.point(lineCoordinates[lineCoordinates.length - 1]);
    const startsInside = turf.booleanPointInPolygon(startPt, polygon);
    const endsInside = turf.booleanPointInPolygon(endPt, polygon);

    if (intersects || startsInside || endsInside) {
      if (zone.type === ZoneType.CRITICAL) {
        riskScore = 100;
        violations.push(`CRITICAL: Enters No-Fly Zone (${zone.name})`);
      } else if (zone.type === ZoneType.RESTRICTED) {
        riskScore = Math.max(riskScore, 80);
        violations.push(`RESTRICTED: Enters Warning Zone (${zone.name})`);
      }
    }
  });

  return { riskScore: Math.min(riskScore, 100), violations };
};
