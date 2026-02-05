import { Zone, ZoneType } from '../types';

// Helper to create a rough box polygon
const createBox = (centerLat: number, centerLng: number, sizeDeg: number): { lat: number, lng: number }[] => {
  const half = sizeDeg / 2;
  return [
    { lat: centerLat + half, lng: centerLng - half },
    { lat: centerLat + half, lng: centerLng + half },
    { lat: centerLat - half, lng: centerLng + half },
    { lat: centerLat - half, lng: centerLng - half },
  ];
};

export const RESTRICTED_ZONES: Zone[] = [
  {
    id: 'z1',
    name: 'Kempegowda Int. Airport (KIA)',
    type: ZoneType.CRITICAL,
    // Rough 5km box around [13.1986, 77.7066] (approx 0.05 deg)
    coordinates: createBox(13.1986, 77.7066, 0.05),
  },
  {
    id: 'z2',
    name: 'Yelahanka Air Force Station',
    type: ZoneType.RESTRICTED,
    // Box around [13.1350, 77.6100]
    coordinates: createBox(13.1350, 77.6100, 0.04),
  },
  {
    id: 'z3',
    name: 'Bangalore City Control Zone',
    type: ZoneType.CONTROLLED,
    // Larger box covering city center area
    coordinates: createBox(12.9716, 77.5946, 0.08),
  }
];