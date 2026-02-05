import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, WeatherData, ChecklistState } from './types';
import { calculatePathRisk } from './utils/flightLogic';

const generateWeather = (): WeatherData => {
  const windSpeed = Math.floor(Math.random() * 25); // 0-25 km/h
  const isStorm = Math.random() > 0.9;
  
  return {
    temp: 24 + Math.floor(Math.random() * 5),
    windSpeed: isStorm ? 45 : windSpeed,
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    visibility: isStorm ? 2 : 10,
    condition: isStorm ? 'Storm' : (windSpeed > 15 ? 'Cloudy' : 'Clear'),
    isFlyable: !isStorm && windSpeed < 20
  };
};

const initialChecklist: ChecklistState = {
  batteryCheck: false,
  gpsLock: false,
  propsSecured: false,
  areaClear: false,
  visualLineOfSight: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      flightPath: [],
      riskLevel: 0,
      violations: [],
      droneSettings: {
        altitude: 60,
        model: 'Nano (<250g)',
      },
      isSimulating: false,
      logs: [],
      weather: generateWeather(),
      savedMissions: [],
      checklist: initialChecklist,
      playback: {
        isPlaying: false,
        currentIndex: 0,
        progress: 0,
        speed: 1,
        followDrone: false,
        scenario: 'standard',
      },
      mapMode: 'DRAW',
      uiVisible: true,

      setPath: (path) => {
        set({ flightPath: path, playback: { ...get().playback, currentIndex: 0, progress: 0, isPlaying: false } });
        get().calculateRisk();
      },

      addPoint: (point) => {
        const newPath = [...get().flightPath, point];
        set({ flightPath: newPath });
        get().calculateRisk();
      },

      updatePoint: (index, point) => {
        const newPath = [...get().flightPath];
        if (index >= 0 && index < newPath.length) {
          newPath[index] = point;
          set({ flightPath: newPath });
          get().calculateRisk();
        }
      },

      removeLastPoint: () => {
        const newPath = get().flightPath.slice(0, -1);
        set({ flightPath: newPath });
        get().calculateRisk();
      },

      clearPath: () => set({ 
        flightPath: [], 
        riskLevel: 0, 
        violations: [],
        playback: { isPlaying: false, currentIndex: 0, progress: 0, speed: 1, followDrone: false, scenario: 'standard' }
      }),

      updateSettings: (newSettings) => {
        set((state) => ({
          droneSettings: { ...state.droneSettings, ...newSettings }
        }));
        get().calculateRisk();
      },

      calculateRisk: () => {
        const { flightPath, droneSettings, weather } = get();
        let { riskScore, violations } = calculatePathRisk(flightPath, droneSettings);
        
        // Add weather risks
        if (!weather.isFlyable) {
          riskScore = 100;
          violations = [...violations, `WEATHER: unsafe conditions (${weather.condition}, ${weather.windSpeed}km/h winds)`];
        } else if (weather.windSpeed > 15) {
          riskScore += 20;
          violations = [...violations, `WEATHER: High winds (${weather.windSpeed}km/h)`];
        }

        set({ riskLevel: Math.min(riskScore, 100), violations });
      },

      setSimulating: (val) => set({ isSimulating: val }),

      logFlight: () => {
        const { droneSettings, riskLevel, flightPath } = get();
        const newLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          droneModel: droneSettings.model,
          riskScore: riskLevel,
          status: riskLevel > 50 ? 'REJECTED' : 'APPROVED',
          coordinateCount: flightPath.length,
          // Mock flight time based on path length approx
          flightTimeSeconds: Math.floor(flightPath.length * 15 + Math.random() * 60) 
        } as const;
        
        set((state) => ({ logs: [newLog, ...state.logs].slice(0, 10) }));
      },

      refreshWeather: () => {
        set({ weather: generateWeather() });
        get().calculateRisk();
      },

      saveMission: (name) => {
        const { flightPath, droneSettings } = get();
        const newMission = {
          id: Math.random().toString(36).substr(2, 9),
          name: name || `Mission ${new Date().toLocaleTimeString()}`,
          path: flightPath,
          settings: droneSettings,
          date: Date.now()
        };
        set(state => ({ savedMissions: [newMission, ...state.savedMissions] }));
      },

      loadMission: (id) => {
        const mission = get().savedMissions.find(m => m.id === id);
        if (mission) {
          set({ 
            flightPath: mission.path, 
            droneSettings: mission.settings,
            playback: { isPlaying: false, currentIndex: 0, progress: 0, speed: 1, followDrone: false, scenario: 'standard' }
          });
          get().calculateRisk();
        }
      },

      deleteMission: (id) => {
        set(state => ({ 
          savedMissions: state.savedMissions.filter(m => m.id !== id) 
        }));
      },

      // Checklist Actions
      toggleChecklistItem: (key) => {
        set((state) => ({
          checklist: { ...state.checklist, [key]: !state.checklist[key] }
        }));
      },

      resetChecklist: () => set({ checklist: initialChecklist }),
      
      isChecklistComplete: () => {
        const { checklist } = get();
        return Object.values(checklist).every(val => val === true);
      },

      // Playback Actions
      setPlaybackPlaying: (isPlaying) => {
        set(state => ({ playback: { ...state.playback, isPlaying } }));
      },
      setPlaybackIndex: (index) => {
        set(state => ({ playback: { ...state.playback, currentIndex: index } }));
      },
      setPlaybackProgress: (progress) => {
        set(state => ({ playback: { ...state.playback, progress: Math.min(Math.max(progress, 0), 1) } }));
      },
      stopPlayback: () => {
        set(state => ({ playback: { ...state.playback, isPlaying: false, progress: 0, currentIndex: 0 } }));
      },
      setPlaybackSpeed: (speed) => {
        set(state => ({ playback: { ...state.playback, speed } }));
      },
      setFollowDrone: (follow) => {
        set(state => ({ playback: { ...state.playback, followDrone: follow } }));
      },
      setSimulationScenario: (scenario) => {
        set(state => ({ playback: { ...state.playback, scenario } }));
      },

      // Map Actions
      setMapMode: (mode) => set({ mapMode: mode }),
      toggleUi: () => set(state => ({ uiVisible: !state.uiVisible })),
    }),
    {
      name: 'airguard-storage',
      // Only persist these fields
      partialize: (state) => ({
        savedMissions: state.savedMissions,
        logs: state.logs,
        droneSettings: state.droneSettings
      }),
    }
  )
);