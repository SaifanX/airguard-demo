import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, useMapEvents, ScaleControl, Tooltip, useMap } from 'react-leaflet';
import { divIcon, LatLngExpression, LatLng } from 'leaflet';
import * as turf from '@turf/turf';
import { useStore } from '../store';
import { RESTRICTED_ZONES } from '../data/zones';
import { ZoneType, SimulationScenario } from '../types';
import { Crosshair, Navigation, Undo2, Play, Pause, FastForward, Hand, MousePointer2, Search, Move, Activity, Timer, Router, Mountain, Plane, StopCircle, Gauge, Loader2, AlertTriangle, Wind } from 'lucide-react';

// --- UTILS ---
// Component to fix map loading issues by resizing
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
};

// --- ELEVATION PROFILE COMPONENT ---
const ElevationProfile = () => {
  // Use specific selectors to avoid re-rendering on every playback frame
  const flightPath = useStore((state) => state.flightPath);
  const droneSettings = useStore((state) => state.droneSettings);
  const uiVisible = useStore((state) => state.uiVisible);
  
  // FIXED: Hook is now called unconditionally at the top level
  // Mock elevation data generation
  const profileData = useMemo(() => {
    if (flightPath.length < 2) return null;

    let dist = 0;
    const points = [];
    const line = turf.lineString(flightPath.map(p => [p.lng, p.lat]));
    const totalDist = turf.length(line, { units: 'kilometers' });
    
    // Sample 20 points along the path
    for (let i = 0; i <= 20; i++) {
        const stepDist = (totalDist / 20) * i;
        // Mock terrain: sine wave based on distance + base noise
        const terrainHeight = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 5; 
        points.push({
            dist: stepDist.toFixed(1),
            terrain: terrainHeight,
            drone: terrainHeight + droneSettings.altitude
        });
    }
    return points;
  }, [flightPath, droneSettings.altitude]);

  // Conditional Rendering happens AFTER hooks
  if (flightPath.length < 2 || !uiVisible || !profileData) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] h-32 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-2xl z-[800] animate-in slide-in-from-bottom-10 pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
            <Mountain size={12} /> Terrain Profile (Estimated)
        </h4>
        <span className="text-[10px] text-aviation-orange font-mono">AGL: {droneSettings.altitude}m</span>
      </div>
      
      <div className="relative w-full h-20 flex items-end gap-1">
        {profileData.map((pt, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                 {/* Drone Height Bar */}
                 <div 
                    className="w-full bg-aviation-orange/50 border-t border-aviation-orange relative"
                    style={{ height: `${(pt.drone / 200) * 100}%` }}
                 >
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                        Alt: {pt.drone.toFixed(0)}m
                    </div>
                 </div>
                 {/* Terrain Height Bar */}
                 <div 
                    className="w-full bg-slate-700 absolute bottom-0 left-0"
                    style={{ height: `${(pt.terrain / 200) * 100}%` }}
                 ></div>
            </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
        <span>START</span>
        <span>{profileData[profileData.length-1].dist} KM</span>
      </div>
    </div>
  );
};

// --- SEARCH OVERLAY ---
const SearchOverlay = () => {
  const map = useMap();
  const mapMode = useStore((state) => state.mapMode);
  const setMapMode = useStore((state) => state.setMapMode);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // 1. Navigation using OSM (for precise coordinates to move map)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        
        // Move Map
        map.flyTo([latNum, lonNum], 14, { duration: 1.5 });
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (mapMode !== 'SEARCH') return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[800] w-72 md:w-96 animate-in slide-in-from-bottom-5 pointer-events-auto">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          placeholder="Search location (e.g. 'Cubbon Park')" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-900/90 backdrop-blur border border-slate-600 rounded-full py-3 px-5 pr-12 text-sm text-white focus:border-aviation-orange outline-none shadow-xl"
          autoFocus
        />
        <button 
          type="submit" 
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-800 hover:bg-aviation-orange rounded-full text-white transition-colors disabled:opacity-50"
        >
          {isSearching ? <span className="block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span> : <Search size={16} />}
        </button>
      </form>
      <div className="mt-2 text-center">
        <button 
            onClick={() => setMapMode('DRAW')}
            className="text-[10px] text-slate-400 hover:text-white underline decoration-dashed"
        >
            Cancel Search
        </button>
      </div>
    </div>
  );
};

// --- MAP INTERACTIONS & FOLLOW MODE ---
const MapInteractions = () => {
  const { addPoint, playback, mapMode, flightPath } = useStore((state) => state);
  const [isDragging, setIsDragging] = useState(false);
  const map = useMap();

  useMapEvents({
    click(e) {
      if (!playback.isPlaying && mapMode === 'DRAW') {
        addPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
    dragstart() { setIsDragging(true); },
    dragend() { setIsDragging(false); }
  });

  // Calculate current drone position for follow mode
  useEffect(() => {
    if (playback.isPlaying && playback.followDrone && flightPath.length > 1) {
        // Calculate position based on progress
        const line = turf.lineString(flightPath.map(p => [p.lng, p.lat]));
        const totalDistance = turf.length(line, { units: 'kilometers' });
        const traveledDistance = totalDistance * playback.progress;
        
        const point = turf.along(line, traveledDistance, { units: 'kilometers' });
        const [lng, lat] = point.geometry.coordinates;

        // Use a shorter animation duration for smoother following
        map.panTo([lat, lng], { animate: true, duration: 0.1 }); // Fast smooth pan
    }
  }, [playback.progress, playback.isPlaying, playback.followDrone, flightPath, map]);
  
  // Custom cursor
  React.useEffect(() => {
    const container = map.getContainer();
    if (isDragging) container.style.cursor = 'grabbing';
    else if (playback.isPlaying) container.style.cursor = 'default';
    else if (mapMode === 'DRAW') container.style.cursor = 'crosshair';
    else if (mapMode === 'PAN') container.style.cursor = 'grab';
    else container.style.cursor = 'default';
  }, [playback.isPlaying, mapMode, isDragging, map]);

  return isDragging ? (
    <div className="absolute inset-0 z-[1000] pointer-events-none flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2 text-aviation-orange shadow-2xl animate-in fade-in zoom-in duration-200">
            <Move size={16} className="animate-pulse" />
            <span className="text-xs font-bold tracking-widest">PANNING</span>
        </div>
    </div>
  ) : null;
};

// --- ICONS ---
const droneIcon = divIcon({
  className: 'custom-icon',
  html: `<div class="relative flex items-center justify-center w-8 h-8 -ml-1 -mt-1">
    <div class="absolute w-full h-full bg-aviation-orange rounded-full opacity-30 animate-ping"></div>
    <div class="relative w-4 h-4 bg-aviation-orange border-2 border-white rounded-full shadow-lg"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Dynamic icon generator for simulation states
const getSimulationIcon = (scenario: SimulationScenario, isEmergency: boolean) => {
    let classes = 'relative flex items-center justify-center w-10 h-10 -ml-2 -mt-2 ';
    let color = 'bg-blue-500';
    let border = 'border-blue-400';
    
    if (scenario === 'high_wind') {
        classes += 'animate-bounce-fast '; 
    }
    
    if (isEmergency) {
        color = 'bg-red-500';
        border = 'border-red-500';
        classes += 'animate-pulse ';
    }

    return divIcon({
        className: 'ghost-icon',
        html: `<div class="${classes}">
            <div class="absolute w-full h-full ${color} rounded-full opacity-20"></div>
            <div class="relative w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] ${border} transform rotate-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

const waypointIcon = (index: number) => divIcon({
  className: 'waypoint-icon',
  html: `<div class="w-6 h-6 bg-slate-900/80 border border-aviation-orange text-aviation-orange text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform">
    ${index + 1}
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const startPointIcon = divIcon({
    className: 'start-icon',
    html: `<div class="w-8 h-8 bg-aviation-orange text-white flex items-center justify-center rounded-full shadow-xl border-2 border-white cursor-move hover:scale-110 transition-transform">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const MapEngine: React.FC = () => {
  const { flightPath, removeLastPoint, playback, setPlaybackPlaying, setPlaybackProgress, stopPlayback, setPlaybackSpeed, setFollowDrone, setSimulationScenario, mapMode, setMapMode, updatePoint } = useStore((state) => state);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.1986, 77.7066]);
  
  // Calculate path positions and derived data
  const pathPositions: LatLngExpression[] = useMemo(() => flightPath.map(p => [p.lat, p.lng]), [flightPath]);
  
  // Drone Position Calculation based on 'progress' 0-1 and Scenario
  const dronePosition: LatLngExpression | null = useMemo(() => {
    if (flightPath.length < 2) return null;
    const line = turf.lineString(flightPath.map(p => [p.lng, p.lat]));
    const totalDistance = turf.length(line); // km
    const traveled = totalDistance * playback.progress;
    const point = turf.along(line, traveled);
    
    let [lng, lat] = point.geometry.coordinates;

    // SCENARIO LOGIC
    if (playback.isPlaying) {
        if (playback.scenario === 'high_wind') {
             // Add random jitter to simulate wind buffering
             lat += (Math.random() - 0.5) * 0.0003;
             lng += (Math.random() - 0.5) * 0.0003;
        } else if (playback.scenario === 'emergency_landing' && playback.progress > 0.4) {
             // Drift off course after 40% progress
             const driftFactor = (playback.progress - 0.4) * 0.002;
             lat -= driftFactor; 
             lng += driftFactor;
        }
    }

    return [lat, lng] as LatLngExpression;
  }, [flightPath, playback.progress, playback.scenario, playback.isPlaying]);

  const isEmergencyState = playback.scenario === 'emergency_landing' && playback.progress > 0.4;

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch(e.key.toLowerCase()) {
        case 'h': setMapMode('PAN'); break;
        case 'd': setMapMode('DRAW'); break;
        case 's': setMapMode('SEARCH'); break;
        case ' ': 
            e.preventDefault();
            if(flightPath.length > 1) setPlaybackPlaying(!playback.isPlaying); 
            break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMapMode, flightPath, playback.isPlaying, setPlaybackPlaying]);

  // Smooth Playback Loop using requestAnimationFrame
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // FIX for Animation Loop Stale State:
  const playbackRef = useRef(playback);
  playbackRef.current = playback; // Keep ref updated

  useEffect(() => {
    if (!playback.isPlaying || flightPath.length <= 1) {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
    }

    const loop = (time: number) => {
        if (lastTimeRef.current === null || lastTimeRef.current === undefined) lastTimeRef.current = time;
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        const currentSpeed = playbackRef.current.speed;
        const currentProgress = playbackRef.current.progress;

        // Determine Duration: e.g., 10 seconds for full path at 1x
        // So distance per second = 1/10 = 0.1
        const progressPerSecond = 0.05 * currentSpeed; // 20 seconds base time
        
        let newProgress = currentProgress + (progressPerSecond * (deltaTime / 1000));

        // Stop simulation earlier for Emergency Landing (simulating crash/landing)
        if (playbackRef.current.scenario === 'emergency_landing' && newProgress > 0.8) {
            setPlaybackPlaying(false);
            alert("SIMULATION ENDED: Emergency Landing Executed.");
            setPlaybackProgress(0.8);
        } else if (newProgress >= 1) {
            setPlaybackPlaying(false);
            setPlaybackProgress(0); // Loop or Stop? Let's reset to start
        } else {
            setPlaybackProgress(newProgress);
            requestRef.current = requestAnimationFrame(loop);
        }
    };

    lastTimeRef.current = null;
    requestRef.current = requestAnimationFrame(loop);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [playback.isPlaying, flightPath.length]); // Minimize dependencies


  const flightStats = useMemo(() => {
    if (flightPath.length < 2) return { distance: 0, time: 0 };
    try {
        const line = turf.lineString(flightPath.map(p => [p.lng, p.lat]));
        const distanceKm = turf.length(line, { units: 'kilometers' });
        const timeMin = (distanceKm / 30) * 60;
        return { distance: distanceKm.toFixed(2), time: Math.ceil(timeMin) };
    } catch (e) { return { distance: 0, time: 0 }; }
  }, [flightPath]);

  const PatternDefs = () => (
    <svg width="0" height="0">
      <defs>
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <path d="M -1,4 l 18,-18 M 0,8 l 8,-8 M 6,12 l 8,-8" strokeWidth="2" stroke="currentColor" strokeOpacity="0.3" />
        </pattern>
      </defs>
    </svg>
  );

  const getZoneColor = (type: ZoneType) => {
    switch (type) {
      case ZoneType.CRITICAL: return '#ef4444'; 
      case ZoneType.RESTRICTED: return '#eab308'; 
      case ZoneType.CONTROLLED: return '#6366f1'; 
      default: return '#94a3b8';
    }
  };

  const handleStartDrag = (e: any) => {
      const latLng = e.target.getLatLng();
      updatePoint(0, { lat: latLng.lat, lng: latLng.lng });
  };

  return (
    <div className="relative w-full h-full">
      <PatternDefs />
      
      <div className="absolute inset-0 pointer-events-none z-[400] flex items-center justify-center opacity-30">
        <Crosshair className="text-aviation-orange" size={24} />
      </div>

      {/* Flight Telemetry & Stats */}
      {flightPath.length >= 2 && (
        <div className="absolute top-6 left-6 z-[900] bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-xl flex flex-col gap-2 min-w-[160px] pointer-events-none">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-1 mb-1">
                <span className="flex items-center gap-1"><Activity size={10} /> Analysis</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-200">
                    <Router size={14} className="text-aviation-orange" />
                    <span className="font-mono font-bold text-sm">{flightStats.distance} km</span>
                </div>
                <span className="text-[10px] text-slate-500">DIST</span>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-200">
                    <Timer size={14} className="text-blue-400" />
                    <span className="font-mono font-bold text-sm">~{flightStats.time} min</span>
                </div>
                <span className="text-[10px] text-slate-500">EST</span>
            </div>
        </div>
      )}

      {/* Mode Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[900] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-full p-1.5 flex items-center gap-1 shadow-2xl scale-90 md:scale-100 pointer-events-auto">
        <button
          onClick={() => setMapMode('PAN')}
          className={`relative p-3 rounded-full transition-all group ${
            mapMode === 'PAN' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Pan Mode (H)"
        >
          <Hand size={20} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">H key</span>
        </button>
        <button
          onClick={() => setMapMode('DRAW')}
          className={`relative p-3 rounded-full transition-all group ${
            mapMode === 'DRAW' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Draw Flight Path (D)"
        >
          <MousePointer2 size={20} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">D key</span>
        </button>
        <button
          onClick={() => setMapMode('SEARCH')}
          className={`relative p-3 rounded-full transition-all group ${
            mapMode === 'SEARCH' ? 'bg-aviation-orange text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Search Places (S)"
        >
          <Search size={20} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">S key</span>
        </button>
      </div>

      {/* Playback Controls - Enhanced */}
      {flightPath.length > 1 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2">
            
            {/* Scenario Indicator */}
            {playback.scenario !== 'standard' && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 animate-in fade-in slide-in-from-top-2
                    ${playback.scenario === 'high_wind' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                    {playback.scenario === 'high_wind' ? <Wind size={12} /> : <AlertTriangle size={12} />}
                    {playback.scenario.replace('_', ' ')}
                </div>
            )}

            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-2 flex items-center gap-2 shadow-xl pointer-events-auto animate-in slide-in-from-top-5">
            {/* Stop Button */}
            <button 
                onClick={stopPlayback}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Stop Simulation"
            >
                <StopCircle size={18} />
            </button>

            {/* Play/Pause Button */}
            <button 
                onClick={() => setPlaybackPlaying(!playback.isPlaying)}
                className="w-8 h-8 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-aviation-orange border border-slate-700 shadow-lg"
                title={playback.isPlaying ? "Pause" : "Start Simulation"}
            >
                {playback.isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            {/* Follow Cam Toggle */}
            <button
                onClick={() => setFollowDrone(!playback.followDrone)}
                className={`w-8 h-8 rounded flex items-center justify-center hover:bg-slate-700 transition-colors ${playback.followDrone ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'}`}
                title="Follow Drone Camera"
            >
                <Crosshair size={16} className={playback.followDrone ? 'animate-spin-slow' : ''} />
            </button>

            <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

            {/* Scenario Selector */}
            <select 
                value={playback.scenario}
                onChange={(e) => setSimulationScenario(e.target.value as SimulationScenario)}
                className="bg-slate-800 text-xs text-slate-300 border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-aviation-orange cursor-pointer"
            >
                <option value="standard">Standard</option>
                <option value="high_wind">High Wind</option>
                <option value="emergency_landing">Emergency</option>
            </select>

            <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

            {/* Speed Slider Group */}
            <div className="flex items-center gap-2 px-1 group">
                <Gauge size={14} className="text-slate-500 group-hover:text-aviation-orange transition-colors" />
                <div className="flex flex-col w-20">
                    <input 
                        type="range" 
                        min="0.5" 
                        max="5" 
                        step="0.5" 
                        value={playback.speed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-aviation-orange"
                    />
                </div>
                <span className="text-[10px] font-bold text-slate-300 w-6">{playback.speed}x</span>
            </div>
            </div>
        </div>
      )}

      {/* Side Map Controls */}
      <div className="absolute bottom-8 right-8 z-[500] flex flex-col gap-2 pointer-events-auto">
         {flightPath.length > 0 && !playback.isPlaying && (
          <button 
            onClick={removeLastPoint}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg shadow-xl border border-slate-600 flex items-center justify-center transition-colors"
            title="Undo last point"
          >
            <Undo2 size={18} />
          </button>
        )}
        <button 
          onClick={() => setMapCenter([13.1986, 77.7066])} 
          className="w-10 h-10 bg-aviation-orange hover:bg-orange-600 text-white rounded-lg shadow-xl flex items-center justify-center transition-colors"
          title="Recenter Map"
        >
          <Navigation size={18} />
        </button>
      </div>
      
      {/* Elevation Profile (Conditional) */}
      <ElevationProfile />

      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        className="w-full h-full z-0 bg-slate-950"
        zoomControl={false}
        doubleClickZoom={true} 
        scrollWheelZoom={true}
        preferCanvas={true} // Performance boost
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        <ScaleControl position="bottomleft" />
        <MapInteractions />
        <SearchOverlay />

        {/* Zones */}
        {RESTRICTED_ZONES.map(zone => {
            const color = getZoneColor(zone.type);
            return (
                <Polygon
                    key={zone.id}
                    positions={zone.coordinates.map(c => [c.lat, c.lng])}
                    pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.15,
                        weight: 2,
                        dashArray: zone.type === ZoneType.CRITICAL ? '5, 10' : undefined,
                        className: "animate-pulse-slow" 
                    }}
                >
                    <Tooltip sticky className="bg-slate-900 text-slate-200 border border-slate-700 px-2 py-1 rounded shadow-lg text-xs font-mono">
                    <div className="flex flex-col">
                        <span className="font-bold text-[10px] text-slate-400 uppercase">{zone.type} AIRSPACE</span>
                        <span className="font-bold">{zone.name}</span>
                    </div>
                    </Tooltip>
                </Polygon>
            );
        })}

        {/* Flight Path & Markers */}
        {pathPositions.length > 0 && (
          <>
            <Polyline 
              positions={pathPositions}
              pathOptions={{ 
                color: '#f97316', 
                weight: 4, 
                opacity: 0.8,
                dashArray: '10, 10',
                lineCap: 'round'
              }} 
            />
            
            {/* Draggable Start Point */}
            <Marker 
                position={pathPositions[0]} 
                icon={startPointIcon} 
                draggable={!playback.isPlaying}
                eventHandlers={{ dragend: handleStartDrag }}
                zIndexOffset={100}
            />

            {/* Other Waypoints */}
            {pathPositions.slice(1).map((pos, idx) => (
              <Marker key={idx + 1} position={pos} icon={waypointIcon(idx + 1)} />
            ))}

            {/* Simulated Live Drone (Interpolated) */}
            {playback.isPlaying && dronePosition && (
                 <Marker 
                    position={dronePosition} 
                    icon={getSimulationIcon(playback.scenario, isEmergencyState)} 
                    zIndexOffset={1000}
                 />
            )}

            {/* Static End Drone (Only if not fully playing) */}
            {!playback.isPlaying && (
                <Marker position={pathPositions[pathPositions.length - 1] as LatLngExpression} icon={droneIcon} />
            )}
          </>
        )}
      </MapContainer>
      
      <div className="absolute inset-0 pointer-events-none z-[400] bg-[linear-gradient(rgba(15,23,42,0)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
    </div>
  );
};

export default MapEngine;