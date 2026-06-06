import React, { useId } from "react";
import { Ticket, Search, CheckCircle2, User, Landmark, Shield, Barcode, QrCode } from "lucide-react";
import { IRCTCResponse } from "../types";
import { motion } from "motion/react";

interface TicketReceiptProps {
  data: IRCTCResponse | null;
  seatInfo: { coach: string; seat: number; berth: string };
  pnr: string;
}

export default function TicketReceipt({ data, seatInfo, pnr }: TicketReceiptProps) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 25 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="retro-ticket p-6 rounded-md shadow-2xl border-2 border-dashed border-[#f59e0b] overflow-hidden space-y-4 select-none bg-[#fffcf5]"
    >
      {/* Header element of Retro Ticket */}
      <div className="ticket-title border-b border-dashed border-[#f59e0b] pb-3 text-center">
        <h3 className="font-poppins font-extrabold text-[13px] text-[#92400e] tracking-widest flex items-center justify-center gap-2">
          <Ticket className="w-4 h-4 text-irctc-orange" /> INDIAN RAILWAYS RESERVATION SLIP
        </h3>
        <p className="text-[10px] text-amber-700/80 font-bold uppercase mt-1">FINAL CONFIRMED E-TICKET</p>
      </div>

      {/* Ticket Details Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-poppins py-1">
        {/* PNR Reference */}
        <div className="space-y-0.5">
          <span className="text-amber-700/70 font-bold block uppercase text-[10px] tracking-wider">
            PNR REFERENCE
          </span>
          <span className="font-mono font-extrabold text-[#451a03] text-sm tracking-wider">
            {pnr}
          </span>
        </div>

        {/* Passenger Profile */}
        <div className="space-y-0.5">
          <span className="text-amber-700/70 font-bold block uppercase text-[10px] tracking-wider">
            PASSENGER
          </span>
          <span className="font-extrabold text-[#451a03] flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-amber-800" /> RAJESH KUMAR (M32)
          </span>
        </div>

        {/* Journey Date */}
        <div className="space-y-0.5">
          <span className="text-amber-700/70 font-bold block uppercase text-[10px] tracking-wider">
            JOURNEY DATE
          </span>
          <span className="font-mono font-extrabold text-[#451a03] text-sm">
            {data.travelDate || "2026-06-07"}
          </span>
        </div>

        {/* Coach & Seat */}
        <div className="space-y-0.5">
          <span className="text-amber-700/70 font-bold block uppercase text-[10px] tracking-wider">
            COACH / BERTH
          </span>
          <span className="font-mono font-extrabold text-[#451a03] text-sm">
            {seatInfo.coach} / SEAT {seatInfo.seat}
          </span>
        </div>

        {/* Berth Choice Preference */}
        <div className="space-y-0.5">
          <span className="text-amber-700/70 font-bold block uppercase text-[10px] tracking-wider">
            STATUS
          </span>
          <span className="font-extrabold text-[#166534] uppercase tracking-wide bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block text-[10px]">
             CONFIRMED
          </span>
        </div>
      </div>

      {/* Connection & Travel overview */}
      <div className="bg-amber-100/30 border border-[#f59e0b]/30 p-2.5 rounded flex items-center justify-between text-xs text-amber-900 font-poppins font-medium">
        <div className="flex items-center space-x-2.5">
          <div className="px-2 py-0.5 bg-amber-100/60 rounded text-[10px] font-bold text-[#451a03]">
            {data.trainNo}
          </div>
          <span className="font-extrabold text-[#451a03] truncate max-w-[200px] lg:max-w-xs">{data.trainName}</span>
        </div>
        <div className="text-right text-[11px] font-semibold text-slate-500">
          Route: <span className="text-irctc-navy font-bold">{data.origin.split(" ")[0]} ➔ {data.destination.split(" ")[0]}</span>
        </div>
      </div>

      {/* Ticket barcode element */}
      <div className="pt-3 border-t border-dashed border-[#f59e0b] flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Rules & legal disclaimer */}
        <div className="text-[10px] text-amber-800/80 font-medium space-y-1 max-w-sm">
          <p className="flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wider text-[#92400e]">
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>VALID ID REQUIRED DURING BOARDING</span>
          </p>
          <p className="pl-5 text-[#854d0e] leading-relaxed text-[9px] font-semibold">
            Please display this digital reservation slip to check-in. Simulated client-side allocation has synced successfully.
          </p>
        </div>

        {/* Dynamic barcode visual */}
        <div className="flex items-center space-x-3 bg-white p-2 border border-amber-200 rounded shadow-3xs select-none shrink-0 self-end">
          <Barcode className="w-32 h-10 text-slate-800" />
          <QrCode className="w-10 h-10 text-slate-800" />
        </div>
      </div>

      {/* Dynamic exact UTC timestamp for tracking confirmation */}
      <div className="text-[9px] font-mono text-center text-amber-700/60 mt-1 font-medium">
        SECURITY HANDSHAKE GUID: VINTAGE-IRCTC-F892 | UTC TIMESTAMP: 2026-06-06 18:32:44
      </div>
    </motion.div>
  );
}
