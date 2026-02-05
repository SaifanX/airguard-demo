import React from 'react';
import MapEngine from './MapEngine';
import Sidebar from './Sidebar';
import RiskMeter from './RiskMeter';
import AiAssistant from './AiAssistant';
import WeatherWidget from './WeatherWidget';
import { useStore } from '../store';
import { Eye, EyeOff } from 'lucide-react';

const MissionControl: React.FC = () => {
  const { uiVisible, toggleUi } = useStore();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* Background Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapEngine />
      </div>

      {/* Zen Mode Toggle - Slides with Sidebar */}
      <button 
        onClick={toggleUi}
        className={`absolute top-4 z-[2000] p-3 bg-slate-900/90 backdrop-blur text-slate-400 hover:text-white rounded-lg border border-slate-700 shadow-xl transition-all duration-500 ease-in-out ${uiVisible ? 'left-[21rem]' : 'left-4'}`}
        title={uiVisible ? "Hide UI (Zen Mode)" : "Show UI"}
      >
        {uiVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      {/* Overlay Layers */}
      <div className={`transition-opacity duration-500 ${uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <Sidebar />
        <RiskMeter />
        <WeatherWidget />
        <AiAssistant />
      </div>

      {/* Mobile Disclaimer */}
      <div className="md:hidden absolute inset-0 z-[2000] bg-slate-950 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
        <h2 className="text-2xl font-bold text-aviation-orange mb-4">Desktop Only</h2>
        <p className="text-slate-400">Mission Control requires a larger display for safety operations.</p>
      </div>
      
    </div>
  );
};

export default MissionControl;