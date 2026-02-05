import React, { useEffect } from 'react';
import { useStore } from '../store';
import { CloudRain, Wind, Thermometer, Eye, RefreshCw, AlertTriangle } from 'lucide-react';

const WeatherWidget: React.FC = () => {
  const { weather, refreshWeather } = useStore();

  // Auto-refresh weather every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshWeather, 300000);
    return () => clearInterval(interval);
  }, [refreshWeather]);

  return (
    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2 w-64">
      {/* Weather Alert Banner */}
      {(!weather.isFlyable || weather.condition === 'Storm' || weather.windSpeed > 30) && (
        <div className="bg-red-500/90 backdrop-blur-md border border-red-400 rounded-lg shadow-xl p-3 animate-pulse">
            <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-white" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">Hazard Alert</span>
            </div>
            <p className="text-xs text-white/90 leading-tight">
                Critical conditions detected. {weather.condition === 'Storm' ? 'Storm active.' : `High winds (${weather.windSpeed} km/h).`}
            </p>
        </div>
      )}

      {/* Main Widget */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-4 text-slate-200">
        <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Metar</h3>
            <button onClick={refreshWeather} className="text-slate-500 hover:text-aviation-orange transition-colors">
            <RefreshCw size={14} />
            </button>
        </div>

        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
            {weather.condition === 'Storm' ? <CloudRain className="text-red-500" /> : <Wind className="text-blue-400" />}
            <div>
                <div className="text-2xl font-bold">{weather.temp}°C</div>
                <div className="text-xs text-slate-400">{weather.condition}</div>
            </div>
            </div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold border ${
            weather.isFlyable 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
            {weather.isFlyable ? 'FLYABLE' : 'NO GO'}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2 rounded flex items-center gap-2">
            <Wind size={14} className="text-slate-400" />
            <span>{weather.windSpeed} km/h {weather.windDirection}</span>
            </div>
            <div className="bg-slate-800 p-2 rounded flex items-center gap-2">
            <Eye size={14} className="text-slate-400" />
            <span>{weather.visibility} km</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;