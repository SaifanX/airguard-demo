
export interface Coordinate {
  lat: number;
  lng: number;
}

export enum ZoneType {
  CRITICAL = 'CRITICAL', // Red
  RESTRICTED = 'RESTRICTED', // Yellow
  CONTROLLED = 'CONTROLLED', // Blue
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  coordinates: Coordinate[]; // simplified polygon
}

export interface FlightLog {
  id: string;
  timestamp: number;
  droneModel: string;
  riskScore: number;
  status: 'APPROVED' | 'REJECTED';
  coordinateCount: number;
  flightTimeSeconds?: number;
}

export interface DroneSettings {
  altitude: number; // in meters
  model: 'Nano (<250g)' | 'Micro (>2kg)';
}

export interface WeatherData {
  temp: number;
  windSpeed: number; // km/h
  windDirection: string;
  visibility: number; // km
  condition: 'Clear' | 'Cloudy' | 'Rain' | 'Storm';
  isFlyable: boolean;
}

export interface SavedMission {
  id: string;
  name: string;
  path: Coordinate[];
  settings: DroneSettings;
  date: number;
}

export interface ChecklistState {
  batteryCheck: boolean;
  gpsLock: boolean;
  propsSecured: boolean;
  areaClear: boolean;
  visualLineOfSight: false;
}

export type SimulationScenario = 'standard' | 'emergency_landing' | 'high_wind';

export interface PlaybackState {
  isPlaying: boolean;
  progress: number; // 0 to 1 (percentage of path)
  currentIndex: number; // Keep for backward compatibility/waypoint highlighting
  speed: number; // multiplier 1x, 2x, 4x
  followDrone: boolean;
  scenario: SimulationScenario;
}

export type MapMode = 'PAN' | 'DRAW' | 'SEARCH';

export interface AppState {
  flightPath: Coordinate[];
  riskLevel: number;
  violations: string[];
  droneSettings: DroneSettings;
  isSimulating: boolean;
  logs: FlightLog[];
  weather: WeatherData;
  savedMissions: SavedMission[];
  checklist: ChecklistState;
  playback: PlaybackState;
  mapMode: MapMode;
  uiVisible: boolean;
  
  // Actions
  setPath: (path: Coordinate[]) => void;
  addPoint: (point: Coordinate) => void;
  updatePoint: (index: number, point: Coordinate) => void;
  removeLastPoint: () => void;
  clearPath: () => void;
  updateSettings: (settings: Partial<DroneSettings>) => void;
  calculateRisk: () => void;
  logFlight: () => void;
  setSimulating: (isSimulating: boolean) => void;
  refreshWeather: () => void;
  saveMission: (name: string) => void;
  loadMission: (id: string) => void;
  deleteMission: (id: string) => void;
  
  // Checklist Actions
  toggleChecklistItem: (key: keyof ChecklistState) => void;
  resetChecklist: () => void;
  isChecklistComplete: () => boolean;

  // Playback Actions
  setPlaybackPlaying: (isPlaying: boolean) => void;
  setPlaybackIndex: (index: number) => void;
  setPlaybackProgress: (progress: number) => void;
  stopPlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setFollowDrone: (follow: boolean) => void;
  setSimulationScenario: (scenario: SimulationScenario) => void;

  // Map Actions
  setMapMode: (mode: MapMode) => void;
  toggleUi: () => void;
}
