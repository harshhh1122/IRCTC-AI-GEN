import React from "react";
import { Train, Info, Network, CreditCard, Sparkles, Calendar } from "lucide-react";
import { IRCTCResponse } from "../types";
import { motion } from "motion/react";

interface TravelPlanCardProps {
  data: IRCTCResponse | null;
  onOpenGraph: () => void;
  onExecuteBooking: () => void;
  isBookingLoading: boolean;
  onChangeTravelDate?: (date: string) => void;
}

export default function TravelPlanCard({
  data,
  onOpenGraph,
  onExecuteBooking,
  isBookingLoading,
  onChangeTravelDate,
}: TravelPlanCardProps) {
  if (!data) return null;

  const isVandeBharat = data.trainName.toLowerCase().includes("vande");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-[16px] border border-irctc-border shadow-lg overflow-hidden relative"
    >
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-[#0f2963] to-[#1e3a8a] p-5 px-6 text-white flex justify-between items-center select-none">
        <div className="flex items-center space-x-3.5">
          <span className="px-2.5 py-1 bg-irctc-orange text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm font-poppins flex items-center gap-1 shadow-3xs">
            <Sparkles className="w-2.5 h-2.5" /> {isVandeBharat ? "VANDE BHARAT LINKED" : "SUPERFAST OPTION"}
          </span>
          <div>
            <h3 className="font-poppins font-bold text-lg leading-tight tracking-tight">{data.trainName}</h3>
            <p className="text-xs text-slate-200 mt-0.5">{data.trainNo} • Daily Special Corridor</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3.5 py-1.5 bg-white/10 text-white rounded-md text-[11px] font-bold border border-white/20 font-poppins">
            {data.quota}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Reservation Forecaster Assurance Capsule */}
        <div className="flex justify-between items-center bg-[#f8fafc] border border-slate-100 p-3 rounded-lg flex-wrap gap-2">
          {data.selectedClass || data.selectedBerth || data.travelDate ? (
            <div className="flex gap-2 font-poppins flex-wrap items-center">
              {data.travelDate && (
                <div className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-150 text-indigo-800 text-[10px] font-bold rounded-md flex items-center gap-1 shadow-3xs border border-indigo-200 hover:border-indigo-300 transition-all cursor-pointer relative">
                  <Calendar className="w-3 h-3 text-indigo-600 pointer-events-none" /> 
                  <span className="pointer-events-none text-[10px]">Travel Date:</span>
                  <input
                    type="date"
                    value={data.travelDate}
                    onChange={(e) => {
                      if (onChangeTravelDate) {
                        onChangeTravelDate(e.target.value);
                      }
                    }}
                    className="bg-transparent border-none text-[10px] font-extrabold text-indigo-800 focus:outline-none cursor-pointer font-poppins selection:bg-indigo-200 ml-0.5 p-0 h-4"
                  />
                </div>
              )}
              {data.selectedClass && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md shadow-3xs border border-blue-200">
                  Class: {data.selectedClass}
                </span>
              )}
              {data.selectedBerth && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md shadow-3xs border border-amber-200">
                  Berth: {data.selectedBerth}
                </span>
              )}
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-poppins block">
                Reservation Probability Filter
              </span>
            </div>
          )}
          <div className="bg-[#f0fdf4] border border-[#10b981] text-[#10b981] text-[11px] px-3.5 py-1.5 rounded-full font-extrabold flex items-center gap-1.5 shadow-3xs">
            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping"></div>
            <span>{data.probability}</span>
          </div>
        </div>

        {/* Route Visual timeline graphics */}
        <div className="relative flex items-center justify-between px-10 py-6 bg-[#f8fafc] border border-slate-100 rounded-xl select-none">
          {/* Left Endpoint: Departure */}
          <div className="text-center z-10 w-[100px]">
            <span className="text-[9px] text-[#94a3b8] font-bold tracking-widest font-poppins block mb-1">DEP TIME</span>
            <h4 className="font-poppins font-extrabold text-[24px] text-[#1e293b] leading-none mb-1.5">{data.depTime}</h4>
            <span className="text-[12px] text-[#64748b] font-semibold font-poppins truncate block" title={data.origin}>{data.origin.split(" ")[0]}</span>
          </div>

          {/* Central Connecting Corridor Track */}
          <div className="absolute inset-x-32 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-[#cbd5e1] relative"></div>
            <div className="absolute bg-white px-3.5 py-2 rounded-full border border-slate-200 shadow-3xs flex items-center justify-center text-irctc-navy animate-pulse">
              <Train className="w-4 h-4 text-irctc-navy" />
            </div>
          </div>

          {/* Right Endpoint: Arrival */}
          <div className="text-center z-10 w-[100px]">
            <span className="text-[9px] text-[#94a3b8] font-bold tracking-widest font-poppins block mb-1">ARR TIME</span>
            <h4 className="font-poppins font-extrabold text-[24px] text-[#1e293b] leading-none mb-1.5">{data.arrTime}</h4>
            <span className="text-[12px] text-[#64748b] font-semibold font-poppins truncate block" title={data.destination}>{data.destination.split(" ")[0]}</span>
          </div>
        </div>

        {/* AI Explanation / Route Justification text area */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-poppins">
            <Info className="w-3.5 h-3.5 text-irctc-orange" /> Real-time Decision Matrix
          </h4>
          <div className="bg-[#f8fafc] border border-[#cbd5e1] border-l-4 border-l-[#fb721a] p-4 rounded-r-lg rounded-l-xs select-text text-slate-600">
            <p className="text-[12px] font-semibold leading-relaxed">
              <strong>AI Reasoning:</strong> {data.reasoning}
            </p>
          </div>
        </div>

        {/* Action Button Section with Hover, Loaders */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenGraph}
            className="py-2.5 px-[18px] bg-white text-[#475569] hover:bg-slate-50 border border-[#cbd5e1] text-xs font-bold rounded-lg transition-all font-poppins flex items-center gap-1.5 shadow-3xs cursor-pointer"
          >
            <Network className="w-4 h-4 text-slate-500" /> View Logic Graph
          </button>
          <button
            type="button"
            disabled={isBookingLoading}
            onClick={onExecuteBooking}
            className="py-2.5 px-6 bg-[#fb721a] hover:bg-orange-600 disabled:opacity-75 disabled:bg-slate-400 disabled:shadow-none text-white text-xs font-bold rounded-lg transition-all font-poppins shadow-3xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            {isBookingLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Securing Gateways...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" /> One-Click Booking
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
