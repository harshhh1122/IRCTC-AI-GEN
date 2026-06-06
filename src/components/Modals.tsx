import React, { useState } from "react";
import { Key, Eye, EyeOff, Save, ShieldAlert, X, Activity, Server, Cpu, Database, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export function ApiKeyModal({ isOpen, onClose, onSave, currentKey }: ApiKeyModalProps) {
  const [keyValue, setKeyValue] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keyValue.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl border border-irctc-border max-w-md w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-poppins font-bold text-irctc-navy flex items-center gap-2">
            <Key className="w-5 h-5 text-irctc-orange" /> Gemini 2.5 API Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-poppins">
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            By default, the application runs on a structured local simulator. Introduce your live Gemini API Key to connect the conversational agent directly to the models.
          </p>

          <div className="space-y-1">
            <legend className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">
              Gemini API Key
            </legend>
            <div className="relative flex items-center mt-2.5">
              <input
                type={showKey ? "text" : "password"}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-irctc-navy focus:border-irctc-navy focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-2.5">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed font-semibold">
              Your API Key is kept strictly client-side inside local browser storage, and is only sent securely to the server-side proxy route `/api/gemini` for SDK resolution without expose vulnerabilities.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md font-poppins transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-irctc-navy text-white hover:bg-slate-800 text-xs font-bold rounded-md font-poppins shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Configuration
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface LogicGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogicGraphModal({ isOpen, onClose }: LogicGraphModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl border border-irctc-border max-w-lg w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-poppins font-bold text-irctc-navy flex items-center gap-2 leading-none">
            <Activity className="w-5 h-5 text-irctc-orange" /> Real-time Heuristic Decisional Flow
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
          {/* SVG-Based Decisional Graph Network flow */}
          <svg viewBox="0 0 400 280" className="w-full max-h-[220px]">
            {/* Connection Paths (Lines) with animated dashes */}
            <g className="text-slate-300">
              <line x1="200" y1="35" x2="200" y2="90" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" className="text-irctc-orange" />
              <line x1="200" y1="120" x2="100" y2="185" stroke="currentColor" strokeWidth="1.5" />
              <line x1="200" y1="120" x2="300" y2="185" stroke="currentColor" strokeWidth="1.5" />
              <line x1="100" y1="215" x2="200" y2="255" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="300" y1="215" x2="200" y2="255" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
            </g>

            {/* Nodes */}
            {/* Node 1: Input Query */}
            <g transform="translate(110, 10)">
              <rect width="180" height="30" rx="6" fill="#0f2963" className="shadow-xs" />
              <text x="90" y="19" fontFamily="Poppins" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                1. NL User Prompt Parsing
              </text>
            </g>

            {/* Node 2: Classifier Intent Mapping */}
            <g transform="translate(100, 90)">
              <rect width="200" height="30" rx="6" fill="#fb721a" className="shadow-xs" />
              <text x="100" y="19" fontFamily="Poppins" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                2. Classified Intent Mapping
              </text>
            </g>

            {/* Node 3: Heuristic Route search */}
            <g transform="translate(15, 185)">
              <rect width="165" height="30" rx="6" fill="#ecfeff" stroke="#06b6d4" strokeWidth="1" />
              <text x="82" y="18" fontFamily="sans-serif" fontSize="8.5" fontWeight="bold" fill="#0891b2" textAnchor="middle">
                3A. Multi-fleet Route Corridors
              </text>
            </g>

            {/* Node 4: Reservation probability validator */}
            <g transform="translate(220, 185)">
              <rect width="165" height="30" rx="6" fill="#f0fdf4" stroke="#10b981" strokeWidth="1" />
              <text x="82" y="18" fontFamily="sans-serif" fontSize="8.5" fontWeight="bold" fill="#047857" textAnchor="middle">
                3B. Historical Chance Forecast
              </text>
            </g>

            {/* Node 5: Output Generation Node */}
            <g transform="translate(200, 255)">
              <circle r="15" fill="#475569" />
              <path d="M-6 -1 L-2 3 L6 -5" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          </svg>

          <p className="text-[11px] text-slate-500 mt-4 text-center font-poppins leading-relaxed font-semibold">
            This graph maps how user requests are indexed against specific Indian Railways coordinate filters (Tatkal priority, CC tourist lines, or Vande Bharat corridors) to evaluate reservation seat guarantees.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-irctc-navy hover:bg-slate-800 text-white text-xs font-bold rounded-md font-poppins transition-all cursor-pointer"
          >
            Dismiss Heuristics Graph
          </button>
        </div>
      </motion.div>
    </div>
  );
}
