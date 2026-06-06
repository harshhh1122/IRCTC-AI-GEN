import React from "react";
import { Brain, Train, Landmark, Compass, UserCircle } from "lucide-react";
import { IRCTCResponse, TicketIntent } from "../types";

interface DiagnosticsPanelProps {
  data: IRCTCResponse | null;
}

const intentColorsObj: Record<TicketIntent, { bg: string; text: string; label: string }> = {
  EMERGENCY_TATKAL: {
    bg: "bg-red-50 border-red-200 text-red-700",
    text: "text-red-700",
    label: "Emergency Tatkal",
  },
  LEISURE_PLAN: {
    bg: "bg-sky-50 border-sky-200 text-sky-700",
    text: "text-sky-700",
    label: "Leisure Tourism",
  },
  CORPORATE_TRANSIT: {
    bg: "bg-violet-50 border-violet-200 text-violet-700",
    text: "text-violet-700",
    label: "Corporate Transit",
  },
  GENERAL_BOOKING: {
    bg: "bg-slate-50 border-slate-200 text-slate-700",
    text: "text-slate-700",
    label: "General Booking",
  },
};

export default function DiagnosticsPanel({ data }: DiagnosticsPanelProps) {
  const currentIntentValue: TicketIntent = data?.intent || "GENERAL_BOOKING";
  const intentColors = intentColorsObj[currentIntentValue];

  return (
    <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 border-b border-irctc-border bg-white shadow-3xs">
      
      {/* 1. Classified Intent */}
      <div className="bg-white p-4 rounded-xl border border-irctc-border flex items-center space-x-3 shadow-3xs transition-all duration-150 hover:bg-slate-50/50">
        <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${intentColors.bg}`}>
          <Brain className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest font-poppins leading-none">Intent</span>
          <span className="block text-[13px] font-extrabold text-irctc-navy font-poppins mt-1.5 truncate">
            {intentColors.label}
          </span>
        </div>
      </div>

      {/* 2. Origin Junction */}
      <div className="bg-white p-4 rounded-xl border border-irctc-border flex items-center space-x-3 shadow-3xs transition-all duration-150 hover:bg-slate-50/50">
        <div className="p-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center justify-center shrink-0">
          <Train className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest font-poppins leading-none">Origin</span>
          <span className="block text-[13px] font-extrabold text-irctc-navy font-poppins mt-1.5 truncate" title={data?.origin || "Pending Discovery"}>
            {data?.origin || "Pending Discovery"}
          </span>
        </div>
      </div>

      {/* 3. Destination Junction */}
      <div className="bg-white p-4 rounded-xl border border-irctc-border flex items-center space-x-3 shadow-3xs transition-all duration-150 hover:bg-slate-50/50">
        <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center justify-center shrink-0">
          <Compass className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest font-poppins leading-none">Destination</span>
          <span className="block text-[13px] font-extrabold text-irctc-navy font-poppins mt-1.5 truncate" title={data?.destination || "Pending Discovery"}>
            {data?.destination || "Pending Discovery"}
          </span>
        </div>
      </div>

      {/* 4. Optimal Quota/Class */}
      <div className="bg-white p-4 rounded-xl border border-irctc-border flex items-center space-x-3 shadow-3xs transition-all duration-150 hover:bg-slate-50/50">
        <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center justify-center shrink-0">
          <UserCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest font-poppins leading-none">Optimal Quota</span>
          <span className="block text-[13px] font-extrabold text-irctc-navy font-poppins mt-1.5 truncate">
            {data?.quota || "GN (General Class)"}
          </span>
        </div>
      </div>

    </div>
  );
}
