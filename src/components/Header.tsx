import React from "react";
import { Settings, CircleCheck } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export default function Header({ onOpenSettings, hasApiKey }: HeaderProps) {
  return (
    <header className="h-[72px] bg-white border-b border-irctc-border px-6 flex items-center justify-between shadow-sm z-30 shrink-0 select-none">
      {/* Left logo section */}
      <div className="flex items-center space-x-3">
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-white shadow-3xs overflow-hidden shrink-0 border border-slate-100">
          <svg 
            viewBox="0 0 120 120" 
            className="w-full h-full text-irctc-navy animate-fade-in"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Deep Blue Rim */}
            <circle cx="60" cy="60" r="56" fill="#0f2963" />
            <circle cx="60" cy="60" r="49" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            
            {/* Inner Ring with Lines background */}
            <circle cx="60" cy="60" r="39" fill="#0f2963" />
            <circle cx="60" cy="60" r="39" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            
            {/* Horizontal Line Grid inside Inner Wheel (Like the real logo) */}
            <mask id="inner-wheel-mask">
              <circle cx="60" cy="60" r="37" fill="#ffffff" />
            </mask>
            <g mask="url(#inner-wheel-mask)">
              <line x1="20" y1="36" x2="100" y2="36" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="42" x2="100" y2="42" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="48" x2="100" y2="48" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="54" x2="100" y2="54" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="60" x2="100" y2="60" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="66" x2="100" y2="66" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="72" x2="100" y2="72" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="78" x2="100" y2="78" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
              <line x1="20" y1="84" x2="100" y2="84" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
            </g>

            {/* Indian Railways Text Pathing Mimic */}
            <path id="textPathUpper" d="M 17,60 A 43,43 0 0,1 103,60" fill="none" />
            <path id="textPathLower" d="M 103,60 A 43,43 0 0,1 17,60" fill="none" />

            <text fontFamily="Poppins, Roboto, sans-serif" fontWeight="bold" fontSize="7.8" fill="#ffffff" letterSpacing="0.4">
              <textPath href="#textPathUpper" startOffset="50%" textAnchor="middle">
                INDIAN RAILWAYS
              </textPath>
            </text>
            <text fontFamily="Poppins, Roboto, sans-serif" fontWeight="bold" fontSize="8" fill="#ffffff" letterSpacing="0.4">
              <textPath href="#textPathLower" startOffset="50%" textAnchor="middle">
                भारतीय रेल
              </textPath>
            </text>

            {/* Star Dividers inside the blue rim */}
            {/* Left and Right central dots */}
            <circle cx="15" cy="60" r="1.8" fill="#ffffff" />
            <circle cx="105" cy="60" r="1.8" fill="#ffffff" />

            {/* Row of decorative stars along the bottom curve */}
            {/* Render star glyphs on paths or manual absolute circular offsets */}
            <g fill="#ffffff" transform="translate(60, 60)">
              {[-130, -110, -70, -50, -30, -10, 10, 30, 50, 70, 110, 130].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const r = 44;
                const sx = r * Math.sin(rad);
                const sy = r * Math.cos(rad);
                return (
                  <path 
                    key={i} 
                    d="M 0,-2.5 L 0.7,-0.7 L 2.5,-0.5 L 1.1,0.7 L 1.5,2.5 L 0,1.5 L -1.5,2.5 L -1.1,0.7 L -2.5,-0.5 L -0.7,-0.7 Z" 
                    transform={`translate(${sx}, ${sy}) scale(0.9)`}
                  />
                );
              })}
            </g>

            {/* High-Fidelity Front-facing Steam Engine Locomotive in White/Blue detailing */}
            {/* Cowcatcher, headlamp, boiler, cabin roof, piston guides */}
            <g transform="translate(30, 38)">
              {/* Cowcatcher (bottom triangular grid) */}
              <polygon points="12,50 48,50 42,42 18,42" fill="#ffffff" />
              <polygon points="14,49 46,49 41,43 19,43" fill="#0f2963" />
              <line x1="22" y1="42" x2="20" y2="49" stroke="#ffffff" strokeWidth="1.2" />
              <line x1="30" y1="42" x2="30" y2="49" stroke="#ffffff" strokeWidth="1.2" />
              <line x1="38" y1="42" x2="40" y2="49" stroke="#ffffff" strokeWidth="1.2" />

              {/* Main boiler circle with details */}
              <circle cx="30" cy="27" r="14" fill="#ffffff" />
              <circle cx="30" cy="27" r="11.5" fill="#0f2963" />
              <circle cx="30" cy="27" r="8" fill="#ffffff" />
              <circle cx="30" cy="27" r="6" fill="#0f2963" />

              {/* Headlamp */}
              <rect x="27" y="9" width="6" height="5" rx="1" fill="#ffffff" />
              <circle cx="30" cy="11.5" r="1.8" fill="#eab308" />

              {/* Piston assemblies & flank plates */}
              <rect x="11" y="32" width="8" height="11" rx="1.5" fill="#ffffff" />
              <rect x="41" y="32" width="8" height="11" rx="1.5" fill="#ffffff" />
              
              <rect x="13" y="34" width="4" height="7" rx="0.5" fill="#0f2963" />
              <rect x="43" y="34" width="4" height="7" rx="0.5" fill="#0f2963" />

              {/* Central emblem / plate inside front of train */}
              <polygon points="26,22 34,22 32,32 28,32" fill="#ffffff" />
              <circle cx="30" cy="27" r="3" fill="#fb721a" />
              
              {/* Base plate */}
              <rect x="15" y="39" width="30" height="4" fill="#ffffff" />
            </g>
          </svg>
        </div>
        <div>
          <h1 className="font-poppins font-extrabold text-irctc-navy text-[18px] -tracking-[0.5px] leading-tight">
            INDIAN RAILWAYS
          </h1>
          <p className="text-[11px] text-[#64748b] font-semibold tracking-wide">
            Next Generation e-Ticketing System
          </p>
        </div>
      </div>

      {/* Empty block for layout flow balanced distribution */}
      <div className="hidden md:block"></div>

      {/* Assist Badge & settings trigger */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] px-3.5 py-1.5 rounded-full text-[11px] font-bold space-x-2 shadow-3xs transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
          </span>
          <span className="font-poppins">IRCTC AI-Assist</span>
          <CircleCheck className="w-3.5 h-3.5" />
        </div>
        
        <button
          onClick={onOpenSettings}
          className="text-slate-500 hover:text-irctc-navy transition-colors p-2 rounded-full hover:bg-slate-100 flex items-center justify-center relative group"
          title="Configure Gemini API Settings"
        >
          <Settings className="w-5 h-5" />
          {hasApiKey && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-irctc-orange border border-white rounded-full"></span>
          )}
        </button>
      </div>
    </header>
  );
}
