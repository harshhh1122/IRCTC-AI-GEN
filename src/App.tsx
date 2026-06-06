import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";
import TravelPlanCard from "./components/TravelPlanCard";
import TicketReceipt from "./components/TicketReceipt";
import { ApiKeyModal, LogicGraphModal } from "./components/Modals";
import { ChatMessage, IRCTCResponse } from "./types";
import { generateMockTravelPlan, templateMockData } from "./data";
import { AlertCircle, Bot, Compass, HelpCircle, CheckCircle, CreditCard, Lock, Sparkles, Train, ArrowRight, ArrowLeft, QrCode, Ticket, Check, ShieldCheck, Calendar } from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "system",
      text: "Welcome to the NextGen Smart Assist Portal. I am linked with live travel route optimizations. How can I help schedule your Indian Railways itinerary today? Let me search and plan.",
      timestamp: "18:28",
    },
  ]);
  const [apiKey, setApiKey] = useState("");
  const [currentPlan, setCurrentPlan] = useState<IRCTCResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isTicketVisible, setIsTicketVisible] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // High-fidelity Prototype Screen flow states
  // Screen 1: Chat/Consultation, Screen 2: AI Optimized Trains, Screen 3: Superfast Payment Gateway, Screen 4: Ticket Confirmed ✅
  const [activeScreen, setActiveScreen] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTrainNo, setSelectedTrainNo] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [globalTravelDate, setGlobalTravelDate] = useState(() => {
    // Tomorrow by default
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [sortBy, setSortBy] = useState<"time" | "probability">("time");

  // Seat booking simulation variables
  const [pnr, setPnr] = useState("431-9872412");
  const [seatInfo, setSeatInfo] = useState({ coach: "A1", seat: 12, berth: "Lower" });

  useEffect(() => {
    // Sync API key from Local Storage on load
    const stored = localStorage.getItem("irctc_gemini_apikey");
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  // Update Settings API key
  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("irctc_gemini_apikey", newKey);
    
    // Log configuration status
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `config-${Date.now()}`,
        sender: "system",
        text: `🛡 SYSTEM HANDSHAKE: API Key successfully loaded! Next routing searches will prioritize live Gemini optimization.`,
        timestamp: timeNow,
      },
    ]);
  };

  // Client-side search fetch with binary exponential backoff retry structure (5 times)
  const fetchWithRetry = async (url: string, options: RequestInit, maxAttempts = 5) => {
    let attempt = 0;
    let delay = 1000;
    
    while (attempt < maxAttempts) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        throw new Error(`GDS Server returned status HTTP ${response.status}`);
      } catch (error: any) {
        attempt++;
        if (attempt >= maxAttempts) {
          throw error;
        }
        // Fail silently without polluting console
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error("GDS Pipeline connection exhausted.");
  };

  // Preset Selectors
  const handleSelectPreset = async (type: "tatkal" | "family") => {
    const text = type === "tatkal" 
      ? "Urgent travel emergency! I need to get from Delhi to Mumbai tomorrow night on the fastest train with confirmed berths."
      : "Planning a scenic family trip next week from Bangalore to Goa, prefer CC class window seats with pantry options.";
    await handleSubmitPrompt(text);
  };

  // Submit Prompt
  const handleSubmitPrompt = async (text: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lowerText = text.toLowerCase().trim();

    // -- CONVERSATIONAL COMMAND LAYER INTERCEPTS --

    // 1. Reset / Start Over Command
    if (
      lowerText.includes("start over") || 
      lowerText === "reset" || 
      lowerText.includes("another ticket") || 
      lowerText.includes("rebook") || 
      lowerText.includes("clear") ||
      lowerText === "book another ticket"
    ) {
      setCurrentPlan(null);
      setIsTicketVisible(false);
      setActiveScreen(1);
      
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text,
          timestamp: timeNow,
        },
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "🔄 I have reset the booking corridor back to Screen 1. Where would you like to travel today on Indian Railways? Describe your journey to search and optimize!",
          timestamp: timeNow,
        }
      ]);
      return;
    }

    // 2. Go Back / Back to Trains
    if (
      (lowerText.includes("go back") || 
       lowerText.includes("back to trains") || 
       lowerText === "back") && 
      currentPlan
    ) {
      setActiveScreen(2);
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text,
          timestamp: timeNow,
        },
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `🔍 Returned to Screen 2. Here are your optimized travel details on the train **${currentPlan.trainName} (${currentPlan.trainNo})**. You can say **"book"** or click on the button to advance.`,
          timestamp: timeNow,
        }
      ]);
      return;
    }

    // 3. Switch Payment Mode inside payment (Screen 3)
    if (
      (lowerText.includes("switch to") || lowerText.includes("use") || lowerText.includes("select") || lowerText.includes("upi") || lowerText.includes("card") || lowerText.includes("netbanking") || lowerText.includes("net banking") || lowerText.includes("bhim")) &&
      activeScreen === 3 &&
      currentPlan
    ) {
      let method: "upi" | "card" | "netbanking" = "upi";
      let methodName = "BHIM UPI Gateway";
      if (lowerText.includes("card") || lowerText.includes("credit") || lowerText.includes("debit")) {
        method = "card";
        methodName = "Co-branded VISA/RuPay Card";
      } else if (lowerText.includes("netbanking") || lowerText.includes("bank") || lowerText.includes("net banking")) {
        method = "netbanking";
        methodName = "State Bank of India NetBanking login";
      }

      setSelectedPaymentMethod(method);
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text,
          timestamp: timeNow,
        },
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `💳 Securing payment method: **${methodName}**.\n\nYou can now say **"pay now"** or **"confirm"** to route your seat allocation instantly.`,
          timestamp: timeNow,
        }
      ]);
      return;
    }

    // 4. Pay Now / Confirm Settlement
    if (
      (lowerText === "pay now" || 
       lowerText.includes("pay") || 
       lowerText.includes("confirm payment") || 
       lowerText.includes("make payment") || 
       lowerText.includes("do payment") ||
       lowerText.includes("authorize")) && 
      activeScreen === 3 && 
      currentPlan
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text,
          timestamp: timeNow,
        },
      ]);
      await handleExecuteBooking();
      return;
    }

    // 5. Book and Pay / Proceed to Payment
    if (
      (lowerText.includes("book") || 
       lowerText.includes("pay") || 
       lowerText.includes("checkout") || 
       lowerText.includes("proceed") || 
       lowerText.includes("advance") || 
       lowerText === "yes" || 
       lowerText === "confirm" ||
       lowerText === "book and pay") && 
      activeScreen === 2 && 
      currentPlan
    ) {
      setActiveScreen(3);
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text,
          timestamp: timeNow,
        },
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `💳 Loading the Secure Checkout corridor for your recommended train: **${currentPlan.trainName} (${currentPlan.trainNo})**.\n\n• Ticket Total: **₹1,450.00**\n• Passenger: **Rajesh Kumar (M32)**\n• Quota: **${currentPlan.quota}**\n• Route: **${currentPlan.origin.split(" ")[0]} ➔ ${currentPlan.destination.split(" ")[0]}**\n\nPlease select/say your preferred payment mode: **UPI**, **Card**, or **NetBanking**, or simply say **"pay now"** to authorize immediately.`,
          timestamp: timeNow,
        },
      ]);
      return;
    }

    // -- STANDARD ROUTE OPTIMIZATION SEARCH LAYER --

    setIsLoading(true);
    setErrorState(null);  // Reset any active error states
    
    // Add user message bubble
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text,
        timestamp: timeNow,
      },
    ]);

    try {
      let data: IRCTCResponse | null = null;
      let usedGemini = false;

      // Always try sending request to server-side API proxy first
      try {
        const res = await fetchWithRetry("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: `User request: ${text}\n(Preferred travel/journey date: ${globalTravelDate}. If another date was mentioned explicitly in the user's prompt, prioritize that specific date instead)`,
            key: apiKey || "", // Leave as empty to fallback onto process.env.GEMINI_API_KEY
          }),
        });

        if (res.ok) {
          data = await res.json();
          usedGemini = true;
        }
      } catch (err) {
        // Fail silently and use simulator fallback
        console.log("No backend API key configured or connection failure. Using offline simulator.", err);
      }

      if (data && usedGemini) {
        if (data.hasActionablePlan) {
          setCurrentPlan(data);
          setSelectedTrainNo(data.trainNo);
          setIsTicketVisible(false);
          setActiveScreen(2); // Automatically advance to Screen 2: AI Train Options
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data!.replyMessage,
            timestamp: timeNow,
          },
          {
            id: `sys-gemini-${Date.now()}`,
            sender: "system",
            text: `✨ LIVE INTELLIGENCE: Connected live travel routing structures using high-speed Gemini parsing on GCP servers.`,
            timestamp: timeNow,
          }
        ]);
      } else {
        // Run simulator engine
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const simulated = generateMockTravelPlan(text, globalTravelDate);
        if (simulated.hasActionablePlan) {
          setCurrentPlan(simulated);
          setSelectedTrainNo(simulated.trainNo);
          setIsTicketVisible(false);
          setActiveScreen(2); // Automatically advance to Screen 2: AI Train Options
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: simulated.replyMessage,
            timestamp: timeNow,
          },
          {
            id: `sys-simulated-${Date.now()}`,
            sender: "system",
            text: `⚙️ REALTIME PARSER: Dynamic travel parameters extracted directly from prompt. Set your Gemini API Key in Settings to enable live LLM reasoning.`,
            timestamp: timeNow,
          }
        ]);
      }
    } catch (err: any) {
      // Graceful error state card presentation and capture status
      setErrorState(err.message || "Unknown GDS transmission exception.");
      
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "system",
          text: `⚠️ GDS CONNECTION DEFEATED: All 5 transmission retry bounds exhausted. Rendering detailed heuristic error configuration inside workspace card.`,
          timestamp: timeNow,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated Decision breakdown printed inside continuous conversational chat
  const handleOpenGraphWithChat = () => {
    setIsGraphModalOpen(true);
    if (!currentPlan) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `graph-explanation-${Date.now()}`,
        sender: "ai",
        text: `🤖 GDS LOGICAL DECISION BREAKDOWN:\n\n"${currentPlan.reasoning}"\n\n[Parsed Parameters] - Station Hubs: "${currentPlan.origin}" ➔ "${currentPlan.destination}" | Confidence Ratio: "${currentPlan.probability}".`,
        timestamp: timeNow,
      },
    ]);
  };

  // Transition to Screen 3 (Payment Simulation)
  const handleInitiatePayment = () => {
    setActiveScreen(3);
  };

  // Execute Simulated One-Click e-Ticket Allocation (Screen 4)
  const handleExecuteBooking = async () => {
    if (paymentProcessing || !currentPlan) return;
    setPaymentProcessing(true);

    // Simulate high-speed gateway validations
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate random PNR
    const prefix = Math.floor(100 + Math.random() * 900);
    const suffix = Math.floor(1000000 + Math.random() * 9000000);
    setPnr(`${prefix}-${suffix}`);

    // Generate smart Coach/Seat properties depending on parsed class and berth preferences
    let chosenCoach = "B1";
    const cl = currentPlan.selectedClass?.toLowerCase() || "";
    if (cl.includes("1a") || cl.includes("first")) {
      chosenCoach = "H1";
    } else if (cl.includes("2a") || cl.includes("second")) {
      chosenCoach = "A1";
    } else if (cl.includes("3a") || cl.includes("third")) {
      chosenCoach = "B1";
    } else if (cl.includes("sleeper") || cl.includes("sl")) {
      chosenCoach = "S3";
    } else if (cl.includes("chair") || cl.includes("cc")) {
      chosenCoach = "C1";
    }

    const chosenSeat = Math.floor(1 + Math.random() * 64);
    const chosenBerth = currentPlan.selectedBerth || "Lower Berth";

    setSeatInfo({
      coach: chosenCoach,
      seat: chosenSeat,
      berth: chosenBerth,
    });

    setPaymentProcessing(false);
    setIsTicketVisible(true);
    setActiveScreen(4); // Advance to Screen 4: Verified e-Ticket Receipt

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `success-${Date.now()}`,
        sender: "system",
        text: `🎫 TRANSACTION SUCCESS: Secured Coach ${chosenCoach}, Seat ${chosenSeat} (${chosenBerth} Berth) under PNR reference ${prefix}-${suffix}. Paper slip rendered.`,
        timestamp: timeNow,
      },
    ]);
  };

  return (
    <div className="bg-irctc-backdrop font-sans h-screen flex flex-col overflow-hidden text-slate-800">
      
      {/* Top Brand Banner */}
      <Header 
        onOpenSettings={() => setIsApiModalOpen(true)} 
        hasApiKey={!!apiKey} 
      />

      {/* Workspace Area: Two-Column split */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column Width: 460px Chat Panel Card */}
        <ChatPanel
          messages={messages}
          onSubmitPrompt={handleSubmitPrompt}
          onSelectPreset={handleSelectPreset}
          isLoading={isLoading}
          activeScreen={activeScreen}
          currentPlan={currentPlan}
        />

        {/* Right Column Flexible Content Workspace */}
        <section className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          
          {/* AI Assisted Booking Chamber Information Header */}
          <div className="bg-white border-b border-irctc-border px-6 py-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#fb721a]/10 rounded-lg text-irctc-orange">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="font-poppins font-black text-xs text-irctc-navy tracking-tight uppercase">
                  AI Automated Checkout Corridor
                </h2>
                <p className="text-[11px] text-[#64748b] font-medium leading-none mt-1 font-poppins">
                  Secure instant seat allocation in less than <span className="font-bold text-irctc-orange">1 Minute</span> powered by GenAI context parsing.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Interactive Journey Date Setup block */}
              <div className="flex items-center space-x-2.5 bg-slate-50 border border-[#cbd5e1] rounded-lg px-3 py-1.5 shadow-3xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#475569] font-poppins shrink-0">
                  JOURNEY DATE:
                </span>
                <input
                  type="date"
                  value={globalTravelDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setGlobalTravelDate(newDate);
                    // Also update active plan immediately if there is one
                    if (currentPlan) {
                      setCurrentPlan((prev) => prev ? { ...prev, travelDate: newDate } : null);
                    }
                  }}
                  className="bg-transparent border-none text-xs font-extrabold text-[#0f2963] focus:outline-none cursor-pointer font-poppins selection:bg-slate-200"
                />
              </div>

              {currentPlan && (
                <div className="hidden lg:flex items-center space-x-2">
                  <span className="text-[10px] bg-slate-100 text-[#475569] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider font-poppins border border-slate-200">
                    {currentPlan.intent}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-[#166534] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider font-poppins border border-[#bbf7d0]">
                    {currentPlan.quota}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Steps Progress Tracker (Screen 1 => Screen 4) */}
          <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between text-xs select-none shadow-3xs shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full justify-around max-w-5xl mx-auto font-poppins">
              {[
                { step: 1, label: "Screen 1: Consult", sub: "User types request" },
                { step: 2, label: "Screen 2: AI Response", sub: "Train options & explanation" },
                { step: 3, label: "Screen 3: Payment", sub: "Secure speed checkout" },
                { step: 4, label: "Screen 4: Confirmed ✅", sub: "Instant e-Ticket issued" }
              ].map((s) => {
                const isCurrent = activeScreen === s.step;
                const isPassed = activeScreen > s.step;
                const isClickable = currentPlan !== null || s.step === 1;

                return (
                  <button
                    key={s.step}
                    disabled={!isClickable}
                    onClick={() => {
                      setActiveScreen(s.step as 1 | 2 | 3 | 4);
                      if (s.step === 4) {
                        setIsTicketVisible(true);
                      }
                    }}
                    className={`flex items-center space-x-2 text-left group transition-all duration-150 relative cursor-pointer disabled:cursor-not-allowed ${
                      isCurrent 
                        ? "text-irctc-orange" 
                        : isPassed
                        ? "text-emerald-600 font-bold" 
                        : "text-slate-400 opacity-60"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-colors shrink-0 ${
                      isCurrent
                        ? "border-irctc-orange bg-white text-irctc-orange shadow-sm animate-pulse"
                        : isPassed
                        ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                        : "border-slate-200 text-slate-400"
                    }`}>
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <div className="hidden lg:block">
                      <p className={`font-poppins text-[11px] font-bold tracking-tight leading-none ${
                        isCurrent ? "text-slate-900" : isPassed ? "text-emerald-700" : "text-slate-400"
                      }`}>
                        {s.label}
                      </p>
                      <p className="text-[9px] text-[#94a3b8] font-normal mt-0.5 whitespace-nowrap">{s.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Work Area scrollbox */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scroll">
            
            {/* Conditional Workspace states */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-irctc-border shadow-xs space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute w-12 h-12 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute w-12 h-12 border-4 border-t-irctc-orange rounded-full animate-spin"></div>
                </div>
                <p className="text-xs font-semibold font-poppins text-slate-500 animate-pulse">
                  Contacting live Gemini Engine...
                </p>
              </div>
            ) : errorState ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 bg-red-100 text-red-600 rounded-lg shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-base text-red-900">Network Disruption Detected</h3>
                    <p className="text-xs font-semibold text-red-700/80 uppercase tracking-wider mt-0.5">IRCTC GDS Connection Timeout</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed bg-white border border-red-100 p-4 rounded-lg select-text">
                  Our live routing pipelines could not establish a connection to the primary GDS database after 5 automatic transmission retry attempts. 
                  <br /><br />
                  <strong>Error Trace:</strong> {errorState}
                  <br /><br />
                  <strong>Recommended Remedy:</strong> Tap the gear icon in the header above to check or reset your dynamic API credentials, or select a pre-set Travel Scenario to operate in high-fidelity offline simulation mode.
                </p>
              </div>
            ) : activeScreen === 1 ? (
              /* SCREEN 1: Consultation - Chat Dashboard & Speed Advantage Showcase */
              <div className="space-y-6 select-none">
                <div className="bg-white rounded-xl border border-irctc-border p-6 shadow-sm space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 text-irctc-navy rounded-lg">
                      <Bot className="w-6 h-6 text-irctc-orange" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-base text-irctc-navy">Welcome to NextGen Train Co-Pilot</h3>
                      <p className="text-xs text-slate-400">Indian Railways Superfast Booking Prototype</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    This high-fidelity prototype proves how high-speed natural language parsing lowers absolute passenger travel reservation periods to <span className="bg-orange-50 text-irctc-orange px-1.5 py-0.5 rounded font-bold">under 1 minute</span>! Standard IRCTC portals demand a grueling 5 minutes of verification checks.
                  </p>
                </div>



                <div className="text-center py-6 bg-indigo-50/50 rounded-xl border border-indigo-100/60 p-4">
                  <div className="inline-block p-2 bg-white rounded-full shadow-2xs mb-2">
                    <ArrowLeft className="w-5 h-5 text-irctc-orange" />
                  </div>
                  <h4 className="font-poppins font-extrabold text-xs text-irctc-navy uppercase">Initiate Your Simulation</h4>
                  <p className="text-[11px] text-[#64748b] leading-relaxed max-w-sm mx-auto mt-1">
                    Describe your journey in the left Chat Panel (e.g. <em>"Urgent travel from Delhi to Mumbai tomorrow night"</em>) or click a fast preset template.
                  </p>
                </div>
              </div>
            ) : activeScreen === 2 && currentPlan ? (
              /* SCREEN 2: AI Optimization - Optimized Train List + "Best Choice" highlighted */
              <div className="space-y-6">
                
                {/* Primary Travel Detail Display Plan - "Best Choice" Card at the very top */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-poppins font-black text-xs text-slate-500 uppercase tracking-widest">
                      AI "Best Choice" Recommendation
                    </h3>
                    <span className="text-[10px] bg-orange-100 text-irctc-orange font-bold px-2 py-0.5 rounded font-poppins flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-irctc-orange fill-irctc-orange" /> Optimized Selection
                    </span>
                  </div>
                  <TravelPlanCard
                    data={currentPlan}
                    onOpenGraph={handleOpenGraphWithChat}
                    onExecuteBooking={handleInitiatePayment}
                    isBookingLoading={false}
                    onChangeTravelDate={(newDate) => {
                      setGlobalTravelDate(newDate);
                      setCurrentPlan((prev) => prev ? { ...prev, travelDate: newDate } : null);
                    }}
                  />
                </div>

                 {/* Simulated Train List displaying options comparison */}
                <div className="space-y-3.5 select-none">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <h3 className="font-poppins font-black text-xs text-slate-500 uppercase tracking-widest">
                        Search Results & Best Alternatives Mapped
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Compare other premium available options on this corridor</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[10px] font-bold font-poppins text-slate-600 self-stretch sm:self-auto justify-between sm:justify-start">
                      <span className="text-[9px] text-[#475569] px-2 uppercase tracking-wider font-extrabold hidden md:inline">Sort By:</span>
                      <button
                        onClick={() => setSortBy("time")}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-black ${
                          sortBy === "time" ? "bg-white text-[#0f2963] shadow-3xs" : ""
                        }`}
                      >
                        Departure Time
                      </button>
                      <button
                        onClick={() => setSortBy("probability")}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-black ${
                          sortBy === "probability" ? "bg-white text-[#0f2963] shadow-3xs" : ""
                        }`}
                      >
                        Probability
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const rawOptions = currentPlan.trainOptions || [
                      {
                        trainName: currentPlan.trainName,
                        trainNo: currentPlan.trainNo,
                        depTime: currentPlan.depTime,
                        arrTime: currentPlan.arrTime,
                        probability: currentPlan.probability || "98% Confirmed",
                        fare: 1450,
                        reasoning: currentPlan.reasoning || "Best recommended route choice matching your parameters."
                      }
                    ];

                    const parseTime = (timeStr: string) => {
                      const [h, m] = timeStr.split(":").map(Number);
                      return h * 60 + m;
                    };

                    const parseProbability = (probStr: string) => {
                      const match = probStr.match(/\d+/);
                      return match ? parseInt(match[0], 10) : 0;
                    };

                    const options = [...rawOptions].sort((a, b) => {
                      if (sortBy === "time") {
                        return parseTime(a.depTime) - parseTime(b.depTime);
                      } else {
                        return parseProbability(b.probability) - parseProbability(a.probability);
                      }
                    });

                    return options.map((opt) => {
                      const isSelected = currentPlan.trainNo === opt.trainNo;
                      return (
                        <div 
                          key={opt.trainNo}
                          className={`border rounded-xl shadow-xs p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 ${
                            isSelected 
                              ? "border-2 border-[#fb721a] bg-amber-50/5 shadow-md"
                              : "border-slate-200 bg-white opacity-85 hover:opacity-100"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-poppins font-bold text-irctc-navy text-sm md:text-base flex items-center gap-1.5">
                                {opt.trainName}
                                {isSelected && (
                                  <span className="bg-orange-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider flex items-center gap-0.5 animate-pulse">
                                    <Sparkles className="w-2.5 h-2.5 fill-white" /> SELECTED BEST
                                  </span>
                                )}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">({opt.trainNo})</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              {opt.reasoning || "Direct alternative matching selected class and seat layout parameters."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto font-poppins border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 mt-2 md:mt-0">
                            <div className="text-center">
                              <p className="text-[9px] text-[#94a3b8] font-bold tracking-wider uppercase">TIMING</p>
                              <p className={`font-extrabold text-xs md:text-sm ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                {opt.depTime} - {opt.arrTime}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-[#94a3b8] font-bold tracking-wider uppercase">FARE</p>
                              <p className={`font-extrabold text-xs md:text-sm ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                ₹{opt.fare || 1450}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-[#94a3b8] font-bold tracking-wider uppercase">PROBABILITY</p>
                              <p className={`font-extrabold text-[10px] px-2 py-0.5 rounded-full ${
                                opt.probability.toLowerCase().includes("confirmed") || parseFloat(opt.probability) > 85
                                  ? "text-emerald-700 bg-emerald-50 border border-emerald-100" 
                                  : "text-amber-700 bg-amber-50 border border-amber-100"
                              }`}>
                                {opt.probability}
                              </p>
                            </div>
                            {isSelected ? (
                              <div className="px-3 py-1.5 bg-orange-100/60 border border-orange-300 rounded-lg text-xs text-irctc-orange font-bold font-poppins">
                                Selected
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setCurrentPlan({
                                    ...currentPlan,
                                    trainName: opt.trainName,
                                    trainNo: opt.trainNo,
                                    depTime: opt.depTime,
                                    arrTime: opt.arrTime,
                                    probability: opt.probability,
                                    reasoning: opt.reasoning
                                  });
                                  setSelectedTrainNo(opt.trainNo);
                                }}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-white border border-slate-200 hover:border-irctc-orange rounded-lg text-xs text-slate-700 font-bold hover:text-irctc-orange transition-all cursor-pointer shadow-3xs"
                              >
                                Switch To
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : activeScreen === 3 && currentPlan ? (
              /* SCREEN 3: Payment page (High fidelity Simulated checkout gateway) */
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-irctc-border overflow-hidden shadow-sm font-poppins">
                  <div className="bg-[#0f2963] text-white p-5">
                    <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-sm tracking-widest uppercase">
                      NextGen Safe Gateways
                    </span>
                    <h3 className="font-poppins font-black text-lg mt-1 tracking-tight">Superfast Booking Secure Settlement</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Identity pre-validated via smart Assist handshake. Secure booking allocated instantly.
                    </p>
                  </div>

                  {/* Booking Receipt Summary Card */}
                  <div className="p-6 space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                        <span className="text-slate-500 font-bold">TRAVEL DETAILS</span>
                        <span className="text-irctc-navy font-black tracking-tight">{currentPlan.trainName} ({currentPlan.trainNo})</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">ITINERARY</span>
                        <span className="text-slate-800 font-extrabold">{currentPlan.origin.split(" ")[0]} ➔ {currentPlan.destination.split(" ")[0]}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">PASSENGER NAME</span>
                        <span className="text-slate-800 font-extrabold">Rajesh Kumar (M32)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">QUOTA SEATING Preference</span>
                        <span className="text-amber-600 font-black">{currentPlan.quota}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                        <span className="text-slate-500 font-bold">JOURNEY DATE</span>
                        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 hover:border-indigo-300 rounded px-2.5 py-1 text-[11px] text-indigo-900 font-extrabold shadow-3xs cursor-pointer transition-all">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <input
                            type="date"
                            value={currentPlan.travelDate || globalTravelDate}
                            onChange={(e) => {
                              const d = e.target.value;
                              setGlobalTravelDate(d);
                              setCurrentPlan((prev) => prev ? { ...prev, travelDate: d } : null);
                            }}
                            className="bg-transparent border-none text-[11px] font-extrabold text-indigo-800 focus:outline-none cursor-pointer font-poppins font-mono p-0 h-4"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200 font-extrabold">
                        <span className="text-[#1e293b]">TOTAL AMOUNT PAYABLE</span>
                        <span className="text-[15px] text-irctc-navy font-black">₹1,450.00</span>
                      </div>
                    </div>

                    {/* High fidelity Gateway Selector buttons */}
                    <div className="space-y-3.5 select-none text-xs">
                      <h4 className="font-family font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                        Choose Secure Payment Medium:
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod("upi")}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                            selectedPaymentMethod === "upi"
                              ? "bg-orange-50/50 border-[#fb721a] text-irctc-orange"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <QrCode className="w-6 h-6" />
                          <div>
                            <p className="font-bold leading-none">BHIM UPI</p>
                            <p className="text-[9px] text-[#94a3b8] mt-0.5 whitespace-nowrap">Instant Auto-collect</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod("card")}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                            selectedPaymentMethod === "card"
                              ? "bg-orange-50/50 border-[#fb721a] text-irctc-orange"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <CreditCard className="w-6 h-6" />
                          <div>
                            <p className="font-bold leading-none">Credit Card</p>
                            <p className="text-[9px] text-[#94a3b8] mt-0.5 whitespace-nowrap">Co-branded VISA/RuPay</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod("netbanking")}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                            selectedPaymentMethod === "netbanking"
                              ? "bg-orange-50/50 border-[#fb721a] text-irctc-orange"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <Lock className="w-6 h-6" />
                          <div>
                            <p className="font-bold leading-none">SBI NetBanking</p>
                            <p className="text-[9px] text-[#94a3b8] mt-0.5 whitespace-nowrap">Direct bank trust</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* BHIM UPI instructions summary and dynamic simulate action */}
                    {selectedPaymentMethod === "upi" ? (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center space-x-4">
                        <div className="bg-white p-2 rounded border border-slate-200 shadow-3xs shrink-0 select-none">
                          <QrCode className="w-16 h-16 text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-700 text-xs">UPI Address: <span className="text-irctc-orange bg-orange-50 px-1 py-0.5 rounded font-mono select-all">irctc.ai@okhdfc</span></p>
                          <p className="text-[10px] text-[#64748b] leading-relaxed">
                            Simulating secure instant token exchange. No real banking credentials are leaked. Simply push the confirmation trigger below to assign the seat instantly on the GDS registry.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600">
                        <p>Simulating secure authorized portal handshake. Tap checkout to test database routing.</p>
                      </div>
                    )}

                    {/* Bottom CTA trigger button */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-4">
                      <button
                        type="button"
                        onClick={() => setActiveScreen(2)}
                        className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all font-poppins flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Trains
                      </button>

                      <button
                        type="button"
                        disabled={paymentProcessing}
                        onClick={handleExecuteBooking}
                        className="flex-1 py-3 px-6 bg-[#fb721a] hover:bg-orange-600 disabled:opacity-75 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all font-poppins shadow-3xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {paymentProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Securing GDS Allocation & Clearing Funds...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" /> Secure Instant Payment (₹1,450.00)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SCREEN 4: Confirmed Ticket ✅ */
              <div className="space-y-6">
                
                {/* Large visual success badge */}
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-6 text-center select-none space-y-3 shadow-3xs">
                  <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full animate-bounce">
                    <CheckCircle className="w-8 h-8 fill-emerald-50 text-emerald-600" />
                  </div>
                  <h3 className="font-poppins font-black text-[#166534] text-lg">Ticket Confirmed Successfully!</h3>
                  <p className="text-xs text-emerald-800/80 max-w-md mx-auto leading-relaxed">
                    Transaction secured. We resolved the reservation within <span className="font-extrabold underline decoration-emerald-500">22 Seconds</span> from input to docket printing! Coach <span className="font-mono font-bold bg-emerald-100 text-[#166534] px-1.5 py-0.5 rounded">{seatInfo.coach} - Seat {seatInfo.seat}</span> has been allocated on GDS registry servers.
                  </p>
                  
                  <div className="flex space-x-3.5 justify-center pt-2">
                    <button
                      onClick={() => {
                        setActiveScreen(1);
                        setCurrentPlan(null);
                        setIsTicketVisible(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md font-poppins transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-3xs"
                    >
                      <Ticket className="w-3.5 h-3.5" /> Book Another Ticket
                    </button>
                    <button
                      onClick={() => setIsGraphModalOpen(true)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-[#475569] text-[11px] font-bold rounded-md font-poppins transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-3xs"
                    >
                      <Bot className="w-3.5 h-3.5 text-irctc-orange" /> Investigate AI Logic Graph
                    </button>
                  </div>
                </div>

                {/* Vintage Retro ticket slip (rendered inline here for clear focal presentation) */}
                {isTicketVisible && currentPlan && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase font-poppins tracking-wider">
                      Simulated Passenger Document
                    </span>
                    <TicketReceipt 
                      data={currentPlan} 
                      seatInfo={seatInfo} 
                      pnr={pnr} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* Simulated placeholder state when no itinerary is entered */}
            {!currentPlan && !isLoading && !errorState && activeScreen === 1 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-irctc-border shadow-xs">
                <Compass className="w-12 h-12 text-slate-300 animate-spin" />
                <p className="mt-3 text-xs font-semibold font-poppins text-slate-400">
                  Select a scenario template or submit a query to plot high-speed IRCTC lines...
                </p>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* Auxiliary Settings Modals */}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />

      {/* Visual Decisional Graph Modal */}
      <LogicGraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
      />

    </div>
  );
}
