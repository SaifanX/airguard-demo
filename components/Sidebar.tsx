import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Plane, Trash2, PlayCircle, History, AlertOctagon, Home, Save, FolderOpen, X, CheckSquare, ClipboardCheck, BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onBack?: () => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const { 
    droneSettings, 
    updateSettings, 
    clearPath, 
    flightPath, 
    logFlight, 
    logs,
    riskLevel,
    saveMission,
    savedMissions,
    loadMission,
    deleteMission,
    checklist,
    toggleChecklistItem,
    isChecklistComplete,
    setPlaybackPlaying,
    setPlaybackProgress,
    setSimulating,
    stopPlayback
  } = useStore();

  const [activeTab, setActiveTab] = useState<'config' | 'missions' | 'checklist'>('config');

  const handleSimulate = () => {
    if (flightPath.length < 2) return;
    if (!isChecklistComplete()) {
        setActiveTab('checklist');
        alert("Pre-flight checklist incomplete! Aircraft grounded.");
        return;
    }
    
    stopPlayback(); // Reset before starting new
    logFlight();
    setSimulating(true);
    setPlaybackProgress(0);
    setPlaybackPlaying(true);
  };

  const handleSave = () => {
    if (flightPath.length === 0) return;
    const name = prompt("Enter Mission Name:");
    if (name) saveMission(name);
  };

  // Analytics Calculation
  const analytics = useMemo(() => {
    if (logs.length === 0) return null;

    const totalFlights = logs.length;
    const totalRisk = logs.reduce((acc, log) => acc + log.riskScore, 0);
    const avgRisk = Math.round(totalRisk / totalFlights);
    
    const approvedCount = logs.filter(l => l.status === 'APPROVED').length;
    const approvalRate = Math.round((approvedCount / totalFlights) * 100);

    const totalTime = logs.reduce((acc, log) => acc + (log.flightTimeSeconds || 0), 0);
    const totalMinutes = Math.floor(totalTime / 60);

    return { totalFlights, avgRisk, approvalRate, totalMinutes };
  }, [logs]);

  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl flex flex-col z-[1000] text-slate-200">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Plane className="text-aviation-orange" size={24} />
            <h1 className="text-xl font-bold tracking-tight">AIRGUARD</h1>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
            title="Return to Landing Page"
          >
            <Home size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 font-mono">PRE-FLIGHT SAFETY LAYER</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-3 px-2 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'config' ? 'text-aviation-orange border-b-2 border-aviation-orange' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Config
        </button>
        <button 
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 py-3 px-2 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'checklist' ? 'text-aviation-orange border-b-2 border-aviation-orange' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Checklist
        </button>
        <button 
          onClick={() => setActiveTab('missions')}
          className={`flex-1 py-3 px-2 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'missions' ? 'text-aviation-orange border-b-2 border-aviation-orange' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Missions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {activeTab === 'config' && (
          <>
            {/* Drone Config */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aircraft Config</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Class</label>
                <select 
                  value={droneSettings.model}
                  onChange={(e) => updateSettings({ model: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-aviation-orange outline-none"
                >
                  <option value="Nano (<250g)">Nano (&lt;250g)</option>
                  <option value="Micro (>2kg)">Micro (&gt;2kg)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium">Altitude (AGL)</label>
                  <span className="font-mono text-aviation-orange">{droneSettings.altitude}m</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={droneSettings.altitude}
                  onChange={(e) => updateSettings({ altitude: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-aviation-orange"
                />
                {droneSettings.altitude > 120 && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertOctagon size={12} /> Exceeds legal limit (120m)
                  </p>
                )}
              </div>
            </section>

            {/* Flight Controls */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mission Control</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={clearPath}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  Reset
                </button>
                <button 
                  onClick={handleSave}
                  disabled={flightPath.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
              
              <button 
                onClick={handleSimulate}
                disabled={flightPath.length < 2 || riskLevel > 50}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all
                  ${flightPath.length < 2 || riskLevel > 50 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-aviation-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-900/20'}`}
              >
                <PlayCircle size={16} />
                {!isChecklistComplete() ? 'Checklist Incomplete' : 'Simulate Flight'}
              </button>
              
              <p className="text-xs text-slate-500 text-center">
                {flightPath.length} Waypoints set
              </p>
            </section>

             {/* Enhanced Black Box Log */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History size={14} /> Black Box Analytics
              </h3>
              
              {/* Analytics Dashboard */}
              {analytics && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            <TrendingUp size={10} /> Avg Risk
                        </div>
                        <div className={`text-lg font-bold ${analytics.avgRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {analytics.avgRisk}%
                        </div>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            <CheckSquare size={10} /> Approval
                        </div>
                        <div className="text-lg font-bold text-blue-400">
                            {analytics.approvalRate}%
                        </div>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            <Clock size={10} /> Total Flight
                        </div>
                        <div className="text-lg font-bold text-slate-200">
                            {analytics.totalMinutes}m
                        </div>
                    </div>
                     <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            <BarChart3 size={10} /> Missions
                        </div>
                        <div className="text-lg font-bold text-slate-200">
                            {analytics.totalFlights}
                        </div>
                    </div>
                </div>
              )}

              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-xs text-slate-600 italic text-center py-4 border border-dashed border-slate-700 rounded">
                    No flights logged yet
                  </div>
                ) : (
                  logs.slice(0, 5).map(log => (
                    <div key={log.id} className="bg-slate-800/50 border border-slate-700 p-3 rounded flex justify-between items-center group hover:bg-slate-800 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-mono text-slate-300">#{log.id}</p>
                            {log.riskScore > 50 && <AlertTriangle size={10} className="text-red-500" />}
                        </div>
                        <p className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded block mb-1 ${
                            log.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                         }`}>
                            {log.status}
                         </span>
                         <span className="text-[10px] text-slate-500">Risk: {log.riskScore}%</span>
                      </div>
                    </div>
                  ))
                )}
                {logs.length > 5 && (
                    <p className="text-center text-[10px] text-slate-500 italic">Showing recent 5 logs</p>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === 'checklist' && (
            <div className="space-y-6">
                 <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <ClipboardCheck className="text-aviation-orange" size={16}/>
                        Pre-flight Checks
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Mandatory safety protocols. You cannot initiate simulation until all systems are GO.
                    </p>
                 </div>

                 <div className="space-y-2">
                    {Object.entries(checklist).map(([key, isChecked]) => (
                        <div 
                            key={key}
                            onClick={() => toggleChecklistItem(key as any)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                                isChecked 
                                ? 'bg-emerald-900/20 border-emerald-500/30' 
                                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                            }`}>
                                {isChecked && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${isChecked ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                        </div>
                    ))}
                 </div>

                 <div className={`p-3 rounded text-center text-xs font-bold border ${
                     isChecklistComplete()
                     ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                     : 'bg-red-500/10 border-red-500/30 text-red-400'
                 }`}>
                     STATUS: {isChecklistComplete() ? 'CLEARED FOR TAKEOFF' : 'GROUNDED'}
                 </div>
            </div>
        )}

        {activeTab === 'missions' && (
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FolderOpen size={14} /> Saved Plans
              </h3>
            {savedMissions.length === 0 ? (
               <div className="text-slate-500 text-sm text-center py-10">No missions saved.</div>
            ) : (
              savedMissions.map(mission => (
                <div key={mission.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 group hover:border-slate-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-slate-200">{mission.name}</h4>
                    <button onClick={() => deleteMission(mission.id)} className="text-slate-500 hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                     <span>{mission.path.length} WPs</span>
                     <span>{new Date(mission.date).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => { loadMission(mission.id); alert(`Loaded mission: ${mission.name}`); }}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium"
                  >
                    Load Mission
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;