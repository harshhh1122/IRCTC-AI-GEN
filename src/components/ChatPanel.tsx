import React, { useRef, useEffect, useState } from "react";
import { MessageSquare, Bot, ArrowRight, Zap, Umbrella, Ticket, Network, CreditCard, Lock, Landmark, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { ChatMessage, IRCTCResponse } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSubmitPrompt: (text: string) => void;
  onSelectPreset: (type: "tatkal" | "family") => void;
  isLoading: boolean;
  activeScreen: number;
  currentPlan: IRCTCResponse | null;
}

export default function ChatPanel({
  messages,
  onSubmitPrompt,
  onSelectPreset,
  isLoading,
  activeScreen,
  currentPlan,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSubmitPrompt(inputValue.trim());
    setInputValue("");
  };

  return (
    <aside className="w-[460px] border-r border-irctc-border bg-white flex flex-col justify-between shrink-0 h-full select-none">
      {/* Smart Co-Pilot Banner */}
      <div className="bg-[#f8fafc] border-b border-irctc-border px-5 py-4 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#fb721a]/10 rounded-lg text-irctc-orange">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-poppins font-bold text-sm text-irctc-navy">AI Smart Assist Co-Pilot</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Ultra-Fast 60s Checkout</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content Panel view */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* AI Co-Pilot Chat stream inside a slate container */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#f8fafc] custom-scroll">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start space-x-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {/* Icon bubbles */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-3xs ${
                    msg.sender === "user"
                      ? "bg-irctc-navy text-white"
                      : "bg-white border border-irctc-border text-irctc-navy"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <span className="text-[10px] font-bold font-poppins">ME</span>
                  ) : (
                    <Bot className="w-4 h-4 text-irctc-orange" />
                  )}
                </div>

                {/* Chat Bubble card bodies */}
                <div
                  className={`p-3 text-[13px] leading-relaxed shadow-3xs border ${
                    msg.sender === "user"
                      ? "bg-irctc-navy border-irctc-navy text-white rounded-xl rounded-br-[2px]"
                      : "bg-white border-irctc-border text-[#1e293b] rounded-xl rounded-tl-[2px]"
                  }`}
                >
                  <p className="font-semibold text-xs mb-1 font-poppins flex items-center justify-between">
                    <span className={msg.sender === "user" ? "text-slate-300" : "text-irctc-navy font-bold"}>
                      {msg.sender === "user" ? "You" : "IRCTC Smart Assist"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal ml-3">{msg.timestamp}</span>
                  </p>
                  <p className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Dynamic Loader Bubble matching AI Bubble style */}
          {isLoading && (
            <div className="flex items-start space-x-2.5 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-white border border-irctc-border text-irctc-navy flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-irctc-orange animate-bounce" />
              </div>
              <div className="bg-white border border-irctc-border text-[#1e293b] rounded-xl rounded-tl-[2px] p-3 shadow-3xs text-[13px] flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-irctc-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-irctc-orange rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-irctc-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span>Optimizing routes...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions horizontal scroll row */}
        <div className="p-3 border-t border-[#cbd5e1] bg-white shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2 font-poppins">
            <span className="w-1.5 h-1.5 bg-[#fb721a] rounded-full"></span>
            <span>
              {currentPlan 
                ? `Available Actions (Screen ${activeScreen}):`
                : "Select Scenario Templates:"}
            </span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1.5 custom-scroll">
            {currentPlan ? (
              <>
                {activeScreen === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSubmitPrompt("Proceed to Payment")}
                      className="shrink-0 border-none bg-[#fb721a] hover:bg-orange-600 text-white rounded-full px-4 py-2 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Book and Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => onSubmitPrompt("Start Over")}
                      className="shrink-0 bg-white border border-[#cbd5e1] text-[#475569] rounded-full px-3.5 py-2 text-[11px] font-semibold hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-red-500" /> Start Over
                    </button>
                  </>
                )}
                {activeScreen === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSubmitPrompt("Pay Now")}
                      className="shrink-0 border-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 py-2 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer animate-pulse"
                    >
                      <Lock className="w-3.5 h-3.5" /> Pay Now & Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => onSubmitPrompt("Switch to Card")}
                      className="shrink-0 bg-white border border-[#cbd5e1] text-[#475569] rounded-full px-3.5 py-2 text-[11px] font-semibold hover:border-irctc-orange hover:text-irctc-orange transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-irctc-orange" /> Switch to Card
                    </button>
                    <button
                      type="button"
                      onClick={() => onSubmitPrompt("Switch to NetBanking")}
                      className="shrink-0 bg-white border border-[#cbd5e1] text-[#475569] rounded-full px-3.5 py-2 text-[11px] font-semibold hover:border-irctc-orange hover:text-irctc-orange transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
                    >
                      <Landmark className="w-3.5 h-3.5 text-irctc-orange" /> Switch to Netbanking
                    </button>
                    <button
                      type="button"
                      onClick={() => onSubmitPrompt("Back to Trains")}
                      className="shrink-0 bg-white border border-[#cbd5e1] text-[#475569] rounded-full px-3.5 py-2 text-[11px] font-semibold hover:border-slate-500 hover:text-slate-500 transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Go Back
                    </button>
                  </>
                )}
                {activeScreen === 4 && (
                  <button
                    type="button"
                    onClick={() => onSubmitPrompt("Book Another Ticket")}
                    className="shrink-0 border-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 py-2 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" /> Book Another Ticket
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelectPreset("tatkal")}
                  className="shrink-0 bg-white border border-[#cbd5e1] text-[#475569] rounded-full px-3.5 py-2 text-[11px] font-semibold hover:border-irctc-orange hover:text-irctc-orange transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Emergency Tatkal (DEL-MUM)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPreset("family")}
                  className="shrink-0 bg-white border border-[#cbd5e1] text-[#475569] rounded-full px-3.5 py-2 text-[11px] font-semibold hover:border-irctc-orange hover:text-irctc-orange transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
                >
                  <Umbrella className="w-3.5 h-3.5 text-sky-500 fill-sky-200" /> Family Scenic (BLR-GOA)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Input card footer Panel */}
        <div className="p-4 border-t border-[#cbd5e1] bg-white flex flex-col gap-3 shrink-0">
          {/* Query Suggestion Templates */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#475569] font-poppins px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
              <span>Prompt Templates & Query Ideas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1">
              {[
                { label: "Delhi to Mumbai tomorrow night", text: "Urgent travel from Delhi to Mumbai tomorrow night with 3AC sleeper seat preference" },
                { label: "Morning Vande Bharat to Jhansi", text: "Fastest morning trains from Delhi to Jhansi tomorrow morning in Chair Car" },
                { label: "Bangalore to Goa next week", text: "Scenic Bangalore to Goa holiday trip next week, looking for CC panoramic coach view" },
                { label: "Mumbai to Delhi overnight", text: "Overnight superfast sleeper train options from Mumbai to Delhi for travel tomorrow" }
              ].map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputValue(tpl.text)}
                  className="text-[10px] bg-[#f8fafc] hover:bg-[#fb721a]/10 hover:text-irctc-orange hover:border-[#fb721a]/30 text-[#475569] font-bold font-poppins px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] transition-all cursor-pointer text-left active:scale-[0.97]"
                  title={tpl.text}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex gap-2.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for routes, availability or status..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-irctc-navy focus:border-irctc-navy focus:bg-white placeholder:text-slate-400 transition-all font-poppins"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#fb721a] text-white hover:bg-orange-600 border-none px-5 py-2.5 rounded-lg text-[13px] font-bold font-poppins transition-all flex items-center gap-1 shadow-3xs cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
