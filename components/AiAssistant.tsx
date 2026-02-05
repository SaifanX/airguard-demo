import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, FileText, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { getCaptainCritique } from '../services/geminiService';
import * as turf from '@turf/turf';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: 'init',
    sender: 'ai',
    text: "Captain Arjun here. I'm monitoring your flight plan. Plot your course, and ask me if you're unsure about the regulations."
  }]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { riskLevel, violations, droneSettings, weather, flightPath } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevRiskLevel = useRef(riskLevel);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Auto-Trigger Logic
  useEffect(() => {
    // Trigger if risk jumps to High (>50) from a safe state
    if (riskLevel > 50 && prevRiskLevel.current <= 50) {
        setIsOpen(true);
        const alertMsg: Message = {
            id: Date.now().toString(),
            sender: 'ai',
            text: `⚠️ PILOT ALERT: You have entered a high-risk configuration (${riskLevel}%). Immediate attention required. Check your altitude and zone intersections.`
        };
        setMessages(prev => [...prev, alertMsg]);
    }
    // Trigger if risk jumps to Caution (>0) from 0
    else if (riskLevel > 0 && prevRiskLevel.current === 0) {
        const warnMsg: Message = {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Advisory: Flight plan deviates from standard parameters. Review violations.`
        };
        setMessages(prev => [...prev, warnMsg]);
    }
    prevRiskLevel.current = riskLevel;
  }, [riskLevel]);

  const getFlightStats = () => {
      if (flightPath.length < 2) return undefined;
      try {
        const line = turf.lineString(flightPath.map(p => [p.lng, p.lat]));
        const distance = parseFloat(turf.length(line, { units: 'kilometers' }).toFixed(2));
        return { distance, waypoints: flightPath.length };
      } catch (e) {
          return undefined;
      }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInput('');
    setIsLoading(true);

    const flightStats = getFlightStats();

    const aiResponseText = await getCaptainCritique(
      textToSend,
      riskLevel,
      violations,
      droneSettings,
      weather,
      flightStats
    );

    const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleBriefing = () => {
      if (!isOpen) setIsOpen(true);
      handleSend("Commander, request pre-flight briefing status report.");
  };

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-aviation-orange flex items-center justify-center overflow-hidden">
                <Bot size={24} className="text-slate-300" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200">Captain Arjun</h3>
                <p className="text-[10px] text-aviation-orange font-mono uppercase">AI Safety Officer</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex gap-2 overflow-x-auto custom-scrollbar">
             <button 
                onClick={handleBriefing}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
             >
                <FileText size={12} className="text-aviation-orange" />
                Req. Briefing
             </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-aviation-orange text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none font-mono'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex gap-2 items-center">
                  <Loader2 size={16} className="animate-spin text-aviation-orange" />
                  <span className="text-xs text-slate-400">Processing intelligence...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for clearance..."
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-aviation-orange outline-none"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-aviation-orange text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg border-2 border-aviation-orange transition-all hover:scale-105"
        >
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold text-sm">
            Ask Captain Arjun
          </span>
          <MessageSquare size={24} />
          {violations.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border border-slate-900"></span>
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default AiAssistant;