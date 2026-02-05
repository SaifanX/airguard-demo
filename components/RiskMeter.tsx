import React, { useState } from 'react';
import { useStore } from '../store';
import { AlertTriangle, CheckCircle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

const RiskMeter: React.FC = () => {
  const { riskLevel, violations } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    if (riskLevel === 0) return 'text-emerald-400 border-emerald-500/40 bg-slate-900/90 shadow-emerald-900/20';
    if (riskLevel < 50) return 'text-yellow-400 border-yellow-500/40 bg-slate-900/90 shadow-yellow-900/20';
    return 'text-red-400 border-red-500/40 bg-slate-900/90 shadow-red-900/20';
  };

  const getBarColor = () => {
    if (riskLevel === 0) return 'bg-emerald-500';
    if (riskLevel < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (riskLevel === 0) return 'CLEARED';
    if (riskLevel < 50) return 'CAUTION';
    return 'RESTRICTED';
  };

  const Icon = riskLevel === 0 ? CheckCircle : (riskLevel < 50 ? AlertTriangle : ShieldAlert);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center">
      {/* Compact Status Bar */}
      <div 
        className={`
          flex items-center gap-4 px-4 py-2 rounded-full border backdrop-blur-md shadow-2xl transition-all duration-300
          ${getStatusColor()} cursor-pointer hover:scale-105 active:scale-95
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className={riskLevel > 0 ? "animate-pulse" : ""} />
          <span className="font-bold font-mono text-sm tracking-widest">{getStatusText()}</span>
        </div>

        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

        <div className="flex flex-col items-end min-w-[60px]">
          <span className="text-xs font-bold">{riskLevel}% RISK</span>
          {/* Mini progress bar */}
          <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor()}`} 
              style={{ width: `${riskLevel}%` }}
            />
          </div>
        </div>

        {violations.length > 0 && (
           <div className="flex items-center text-xs opacity-70 hover:opacity-100">
             {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
           </div>
        )}
      </div>

      {/* Expanded Details Dropdown */}
      {isExpanded && violations.length > 0 && (
        <div className="mt-2 w-80 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl p-3 animate-in slide-in-from-top-2">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Active Violations</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{violations.length}</span>
           </div>
           <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
             {violations.map((v, i) => (
               <li key={i} className="flex items-start gap-2 text-xs text-slate-300 border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                 <ShieldAlert size={12} className="text-red-400 mt-0.5 shrink-0" />
                 <span className="font-mono leading-tight">{v}</span>
               </li>
             ))}
           </ul>
        </div>
      )}
    </div>
  );
};

export default RiskMeter;