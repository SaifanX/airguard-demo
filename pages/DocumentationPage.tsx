import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Book, AlertTriangle, Cpu, Map as MapIcon, ChevronRight } from 'lucide-react';

const DocumentationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 h-screen sticky top-0 overflow-y-auto hidden md:block">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-aviation-orange flex items-center justify-center">
              <Plane className="text-white transform -rotate-45" size={14} />
            </div>
            <span className="font-bold tracking-tight">AIRGUARD</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">DOCS v2.1</span>
        </div>
        
        <nav className="p-4 space-y-8">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Getting Started</h4>
            <ul className="space-y-1">
              <li><a href="#introduction" className="block px-2 py-1.5 text-sm rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Introduction</a></li>
              <li><a href="#quick-start" className="block px-2 py-1.5 text-sm rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Quick Start Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Core Features</h4>
            <ul className="space-y-1">
              <li><a href="#mission-control" className="block px-2 py-1.5 text-sm rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Mission Control</a></li>
              <li><a href="#risk-engine" className="block px-2 py-1.5 text-sm rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Risk Engine</a></li>
              <li><a href="#captain-arjun" className="block px-2 py-1.5 text-sm rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">AI Assistant</a></li>
            </ul>
          </div>

           <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Safety</h4>
            <ul className="space-y-1">
              <li><a href="#zones" className="block px-2 py-1.5 text-sm rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Airspace Zones</a></li>
              <li><a href="#disclaimer" className="block px-2 py-1.5 text-sm rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">
            
            <div className="mb-12 border-b border-slate-800 pb-8">
                <Link to="/" className="md:hidden flex items-center gap-2 mb-6 text-slate-500">
                    <ChevronRight size={16} className="rotate-180" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-4 text-white">Documentation</h1>
                <p className="text-xl text-slate-400">Everything you need to know about operating the AirGuard Safety Layer.</p>
            </div>

            <section id="introduction" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Book className="text-aviation-orange" size={24} />
                    <h2 className="text-2xl font-bold text-white">Introduction</h2>
                </div>
                <div className="prose prose-invert prose-slate max-w-none">
                    <p>
                        AirGuard is a client-side situational awareness tool designed for drone pilots operating in complex urban environments. 
                        It acts as a "pre-flight safety layer," allowing pilots to visualize their intended flight path, identify regulatory conflicts, and receive AI-driven safety briefings before they ever leave the ground.
                    </p>
                    <p>
                        The system integrates real-time mapping data, airspace classification zones, and local weather telemetry to calculate a comprehensive <strong>Risk Score</strong> for every mission.
                    </p>
                </div>
            </section>

            <section id="quick-start" className="mb-16">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Start Guide</h2>
                <div className="grid gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-aviation-orange">1</div>
                            <h3 className="text-lg font-bold">Configure Aircraft</h3>
                        </div>
                        <p className="text-slate-400 pl-12">
                            Open the sidebar configuration tab. Select your drone class (Nano vs Micro) and set your intended flight altitude (AGL). AirGuard uses this to check against legal altitude ceilings (typically 120m).
                        </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-aviation-orange">2</div>
                            <h3 className="text-lg font-bold">Plot Flight Path</h3>
                        </div>
                        <p className="text-slate-400 pl-12">
                            Press <code>D</code> to enter Draw Mode. Click on the map to place waypoints. AirGuard will draw a path and immediately begin analyzing it for zone intersections.
                        </p>
                    </div>
                     <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-aviation-orange">3</div>
                            <h3 className="text-lg font-bold">Run Simulation</h3>
                        </div>
                        <p className="text-slate-400 pl-12">
                            Complete the pre-flight checklist. Once cleared, click "Simulate Flight" to watch a real-time playback of the drone's path, including wind effects and potential hazards.
                        </p>
                    </div>
                </div>
            </section>

            <section id="mission-control" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <MapIcon className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Mission Control Map</h2>
                </div>
                <p className="text-slate-400 mb-4">
                    The heart of AirGuard is the Map Engine. It supports three primary interaction modes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                    <li><strong>Pan Mode (HotKey: H):</strong> Standard map navigation. Drag to move, scroll to zoom.</li>
                    <li><strong>Draw Mode (HotKey: D):</strong> Click to add waypoints. Click the "Undo" button to remove the last point.</li>
                    <li><strong>Search Mode (HotKey: S):</strong> Quickly locate parks, landmarks, or addresses to center your mission area.</li>
                </ul>
            </section>

            <section id="risk-engine" className="mb-16">
                 <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="text-yellow-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Risk Engine Logic</h2>
                </div>
                <p className="text-slate-400 mb-6">
                    The Risk Engine runs continuously in the background. It evaluates your flight plan against several heuristic rules:
                </p>
                <div className="overflow-hidden rounded-lg border border-slate-800">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900 text-slate-200 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Factor</th>
                                <th className="px-6 py-4">Threshold</th>
                                <th className="px-6 py-4">Risk Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                            <tr>
                                <td className="px-6 py-4 font-medium text-white">Altitude</td>
                                <td className="px-6 py-4">&gt; 120m (400ft)</td>
                                <td className="px-6 py-4 text-red-400">+50 (High)</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-white">BVLOS</td>
                                <td className="px-6 py-4">Path &gt; 4km</td>
                                <td className="px-6 py-4 text-yellow-400">+50 (Medium)</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-white">No-Fly Zone</td>
                                <td className="px-6 py-4">Intersection</td>
                                <td className="px-6 py-4 text-red-400">100 (Critical)</td>
                            </tr>
                             <tr>
                                <td className="px-6 py-4 font-medium text-white">Weather</td>
                                <td className="px-6 py-4">Rain / High Wind</td>
                                <td className="px-6 py-4 text-red-400">Grounded</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="captain-arjun" className="mb-16">
                 <div className="flex items-center gap-3 mb-6">
                    <Cpu className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">AI Assistant (Captain Arjun)</h2>
                </div>
                <p className="text-slate-400 mb-4">
                    Captain Arjun is an AI agent powered by Google's Gemini 3.5 Flash model. He is configured with a system prompt that emulates a retired Air Force instructor—strict, professional, and highly knowledgeable about aviation regulations.
                </p>
                <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-bold text-white mb-2">Capabilities:</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400 text-sm">
                        <li><strong>Pre-flight Briefings:</strong> Summarizes weather, risk, and compliance in a standard military format.</li>
                        <li><strong>Regulatory Advice:</strong> Answers questions about specific zones or rules.</li>
                        <li><strong>Live Monitoring:</strong> Automatically interjects if risk levels spike during planning.</li>
                    </ul>
                </div>
            </section>

             <section id="disclaimer" className="mb-24 pt-8 border-t border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4">Disclaimer</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    AirGuard is a simulation and planning tool only. It does not replace official aeronautical charts, NOTAMs, or local laws. The "Risk Score" is a heuristic estimation and does not constitute legal advice or official authorization to fly. The pilot in command is solely responsible for the safety of the flight and compliance with all applicable regulations.
                </p>
            </section>

        </div>
      </main>
    </div>
  );
};

export default DocumentationPage;