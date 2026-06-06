import { IRCTCResponse, TicketIntent } from "./types";

/**
 * Parses user prompts dynamically to generate rich travel plans when travel endpoints are requested.
 * If the user is just saying hello or chatting, it guides them conversationally.
 */
export function generateMockTravelPlan(prompt: string, fallbackDate?: string): IRCTCResponse {
  const normalized = prompt.toLowerCase().trim();

  // 1. Identify general conversational chat vs active travel booking intents
  const greetingWords = ["hello", "hi", "hey", "who are you", "what is this", "welcome", "good morning", "good evening", "test"];
  const isGeneralChat = greetingWords.some(word => normalized === word || normalized.startsWith(word + " ") || normalized.includes(" help"));

  // If the user doesn't specify any stations or movement indicators, treat as chat
  const hasMovement = normalized.includes("to") || 
                        normalized.includes("from") || 
                        normalized.includes("train") || 
                        normalized.includes("travel") || 
                        normalized.includes("book") || 
                        normalized.includes("going") ||
                        normalized.includes("route") ||
                        normalized.includes("tatkal");

  if (isGeneralChat && !hasMovement) {
    return {
      replyMessage: "👋 Hello! I am your NextGen Indian Railways Train Co-Pilot. I can search, optimize, and book journeys dynamically. Simply describe your destination and class preferences (e.g., *'I want a Tatkal ticket from Delhi to Jhansi for lower berth in 3AC'*), and I will coordinate the best train for you instantly!",
      hasActionablePlan: false,
      intent: "GENERAL_BOOKING",
      origin: "",
      destination: "",
      quota: "",
      trainName: "",
      trainNo: "",
      depTime: "",
      arrTime: "",
      probability: "",
      reasoning: ""
    };
  }

  // 2. Parse Stations dynamically
  let originCity = "NEW DELHI";
  let originCode = "NDLS";
  let destCity = "MUMBAI CENTRAL";
  let destCode = "MMCT";

  // Check custom station pairs
  // e.g. "delhi to jhansi" or "from delhi to jhansi"
  const fromToRegex = /(?:from\s+)?([a-z\s]+)\s+to\s+([a-z\s]+)/i;
  const match = normalized.match(fromToRegex);
  if (match) {
    const rawFrom = match[1].split(/for|book|in|with|lower|upper/)[0].trim().toUpperCase();
    const rawTo = match[2].split(/for|book|in|with|lower|upper/)[0].trim().toUpperCase();
    
    if (rawFrom) {
      originCity = rawFrom;
      originCode = rawFrom.substring(0, 3).replace(/\s/g, "");
    }
    if (rawTo) {
      destCity = rawTo;
      destCode = rawTo.substring(0, 3).replace(/\s/g, "");
    }
  }

  // 3. Extract Quota, Class, and Berth preferences
  let quota = "GN (General Quota)";
  let intent: TicketIntent = "GENERAL_BOOKING";
  if (normalized.includes("tatkal") || normalized.includes("ck") || normalized.includes("urgent") || normalized.includes("emergency")) {
    quota = "CK (Tatkal)";
    intent = "EMERGENCY_TATKAL";
  } else if (normalized.includes("family") || normalized.includes("vacation") || normalized.includes("scenic")) {
    quota = "GN (General)";
    intent = "LEISURE_PLAN";
  } else if (normalized.includes("meeting") || normalized.includes("office") || normalized.includes("business") || normalized.includes("corporate")) {
    quota = "IO (Corporate)";
    intent = "CORPORATE_TRANSIT";
  }

  // Seating Class (3AC, 2AC, SL, CC)
  let selectedClass = "3AC (3A)";
  if (normalized.includes("2ac") || normalized.includes("2a ") || normalized.includes("second ac")) {
    selectedClass = "2AC (2A)";
  } else if (normalized.includes("1ac") || normalized.includes("1a ") || normalized.includes("first ac")) {
    selectedClass = "1AC (1A)";
  } else if (normalized.includes("sleeper") || normalized.includes(" sl ") || normalized.includes("sl")) {
    selectedClass = "Sleeper (SL)";
  } else if (normalized.includes("cc") || normalized.includes("chair car")) {
    selectedClass = "Chair Car (CC)";
  }

  // Berth (Lower, Upper, Middle, Side Lower, Side Upper)
  let selectedBerth = "Lower Berth";
  if (normalized.includes("upper")) {
    selectedBerth = "Upper Berth";
  } else if (normalized.includes("middle")) {
    selectedBerth = "Middle Berth";
  } else if (normalized.includes("side lower")) {
    selectedBerth = "Side Lower Berth";
  } else if (normalized.includes("side upper")) {
    selectedBerth = "Side Upper Berth";
  }

  // Extract travel date
  const tomorrowVal = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrowVal.toISOString().split("T")[0]; // YYYY-MM-DD
  let travelDate = fallbackDate || tomorrowStr;
  
  if (normalized.includes("today")) {
    travelDate = new Date().toISOString().split("T")[0];
  } else if (normalized.includes("next week")) {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    travelDate = nextWeek.toISOString().split("T")[0];
  } else {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    for (let m = 0; m < months.length; m++) {
      if (normalized.includes(months[m])) {
        const dateMatch = normalized.match(/\d+/);
        if (dateMatch) {
          const day = parseInt(dateMatch[0]);
          const currentYear = new Date().getFullYear();
          const targetDate = new Date(currentYear, m, day);
          travelDate = targetDate.toISOString().split("T")[0];
          break;
        }
      }
    }
  }

  // 4. Generate dynamic train numbers and names based on station letters
  const isMorningRequested = normalized.includes("morning") || normalized.includes("morn") || normalized.includes("am") || normalized.includes("early");
  const isNightRequested = normalized.includes("night") || normalized.includes("evening") || normalized.includes("pm") || normalized.includes("late") || normalized.includes("overnight");

  let dep1 = "06:15";
  let arr1 = "11:55";
  let dep2 = "08:40";
  let arr2 = "14:30";
  let dep3 = "11:20";
  let arr3 = "17:10";
  let dep4 = "15:00";
  let arr4 = "20:20";
  let dep5 = "17:30";
  let arr5 = "22:50";

  let train1Name = "Taj Superfast Express";
  let train1No = "Train #12280";
  let train2Name = "Gatimaan Express";
  let train2No = "Train #12049";
  let train3Name = "Uday AC Double Decker";
  let train3No = "Train #22666";
  let train4Name = "Vande Bharat Special";
  let train4No = "Train #22436";
  let train5Name = "Jhansi Jan Shatabdi";
  let train5No = "Train #12061";

  let fare1 = 1450, fare2 = 1180, fare3 = 1750, fare4 = 1680, fare5 = 890;
  let prob1 = "98% Confirmed", prob2 = "92% Confirmed", prob3 = "85% Confirmed", prob4 = "95% Confirmed", prob5 = "87% Confirmed";
  let reason1 = `Best custom match with seat allocation supporting ${selectedClass}.`;
  let reason2 = `Highly efficient fast sprinter line departing ${dep2}.`;
  let reason3 = `High speed commuter link departing ${dep3}.`;
  let reason4 = `Semi-high-speed Vande Bharat corridor connection departing ${dep4}.`;
  let reason5 = `Economic commuter alternative with high seat availability.`;

  if (isNightRequested) {
    dep1 = "19:40";
    arr1 = "02:20";
    dep2 = "21:15";
    arr2 = "04:55";
    dep3 = "23:45";
    arr3 = "06:45";
    dep4 = "17:40";
    arr4 = "01:10";
    dep5 = "22:30";
    arr5 = "05:55";

    train1Name = "August Kranti Rajdhani";
    train1No = "Train #12954";
    train2Name = "Golden Temple Mail";
    train2No = "Train #12903";
    train3Name = "Dehradun Overnight Express";
    train3No = "Train #19019";
    train4Name = "Paschim AC Express";
    train4No = "Train #12926";
    train5Name = "Mumbai Duronto Special";
    train5No = "Train #22209";

    fare1 = 1890; fare2 = 1250; fare3 = 980; fare4 = 1520; fare5 = 2100;
    prob1 = "98% Confirmed"; prob2 = "93% Confirmed"; prob3 = "81% Confirmed"; prob4 = "90% Confirmed"; prob5 = "95% Confirmed";
    reason1 = "Top premium overnight Rajdhani Express with catering.";
    reason2 = "Express service departing late evening with sleeper arrangements.";
    reason3 = "Slow sleeper overnight commuter link with budget berths.";
    reason4 = "Highly dependable trans-state superfast link.";
    reason5 = "Premium point-to-point AC Duronto sleeper with prompt arrival.";
  } else if (isMorningRequested) {
    dep1 = "06:00";
    arr1 = "11:30";
    dep2 = "07:15";
    arr2 = "12:45";
    dep3 = "09:30";
    arr3 = "15:00";
    dep4 = "08:10";
    arr4 = "13:30";
    dep5 = "11:00";
    arr5 = "16:20";

    train1Name = "Vande Bharat Express";
    train1No = "Train #22436";
    train2Name = "Shatabdi Express";
    train2No = "Train #12012";
    train3Name = "Uttar Sampark Kranti";
    train3No = "Train #12445";
    train4Name = "Gatimaan Superfast Express";
    train4No = "Train #12049";
    train5Name = "Garib Rath Premium";
    train5No = "Train #12204";

    fare1 = 1750; fare2 = 1180; fare3 = 890; fare4 = 1320; fare5 = 950;
    prob1 = "98% Confirmed"; prob2 = "94% Confirmed"; prob3 = "85% Confirmed"; prob4 = "91% Confirmed"; prob5 = "81% Confirmed";
    reason1 = "Ultra-premium semi-high-speed morning chain with gourmet meals.";
    reason2 = "Rapid premium AC executive chair and 3AC coaches.";
    reason3 = "Popular regional general express with budget sleeper coaches.";
    reason4 = "High speed commuter option departing after early hours.";
    reason5 = "Affordable fully-airconditioned express line.";
  } else {
    // Standard spread
    if (originCity.includes("DELHI") && destCity.includes("JHANSI")) {
      train1Name = "Taj Superfast Express";
      train1No = "Train #12280";
      train2Name = "Gatimaan Express";
      train2No = "Train #12049";
      train3Name = "Shatabdi Express";
      train3No = "Train #12012";
      train4Name = "Vande Bharat Special";
      train4No = "Train #22436";
      train5Name = "Jhansi Jan Shatabdi";
      train5No = "Train #12061";

      dep1 = "06:15"; arr1 = "11:55";
      dep2 = "08:40"; arr2 = "14:30";
      dep3 = "11:20"; arr3 = "17:10";
      dep4 = "15:00"; arr4 = "20:20";
      dep5 = "17:30"; arr5 = "22:50";

      fare1 = 1450; fare2 = 1180; fare3 = 1750; fare4 = 1680; fare5 = 890;
      prob1 = "98% Confirmed"; prob2 = "92% Confirmed"; prob3 = "85% Confirmed"; prob4 = "95% Confirmed"; prob5 = "87% Confirmed";
    } else if (originCity.includes("DELHI") && destCity.includes("MUMBAI")) {
      train1Name = "August Kranti Rajdhani";
      train1No = "Train #12954";
      train2Name = "Mumbai Central Duronto";
      train2No = "Train #12268";
      train3Name = "Golden Temple Mail";
      train3No = "Train #12903";
      train4Name = "Paschim Express";
      train4No = "Train #12926";
      train5Name = "Punjab Mail";
      train5No = "Train #12138";

      dep1 = "16:55"; arr1 = "09:55";
      dep2 = "22:30"; arr2 = "15:40";
      dep3 = "18:45"; arr3 = "11:20";
      dep4 = "11:05"; arr4 = "03:45";
      dep5 = "05:15"; arr5 = "22:10";

      fare1 = 2100; fare2 = 1890; fare3 = 1450; fare4 = 1250; fare5 = 980;
      prob1 = "98% Confirmed"; prob2 = "95% Confirmed"; prob3 = "91% Confirmed"; prob4 = "88% Confirmed"; prob5 = "76% Confirmed";
    } else {
      train1Name = `${originCity.charAt(0) + originCity.slice(1).toLowerCase()} Superfast`;
      train1No = `Train #${10000 + Math.floor(Math.random() * 9000)}`;
      train2Name = `${originCity.charAt(0) + originCity.slice(1).toLowerCase()} Humsafar Link`;
      train2No = `Train #${20000 + Math.floor(Math.random() * 9000)}`;
      train3Name = `${originCity.charAt(0) + originCity.slice(1).toLowerCase()} Jan Shatabdi`;
      train3No = `Train #${30000 + Math.floor(Math.random() * 9000)}`;
      train4Name = `${originCity.charAt(0) + originCity.slice(1).toLowerCase()} Garib Rath`;
      train4No = `Train #${40000 + Math.floor(Math.random() * 9000)}`;
      train5Name = `${originCity.charAt(0) + originCity.slice(1).toLowerCase()} Vande Bharat`;
      train5No = `Train #${50000 + Math.floor(Math.random() * 9000)}`;

      fare1 = 1450; fare2 = 1180; fare3 = 850; fare4 = 950; fare5 = 1850;
      prob1 = "98% Confirmed"; prob2 = "92% Confirmed"; prob3 = "84% Confirmed"; prob4 = "89% Confirmed"; prob5 = "94% Confirmed";
    }
  }

  // 5. Success reply message matching exact user preferences
  const replyMessage = `🔍 Searching live reservation grids...\n\nMapped top-recommended option: **${train1Name} (${train1No})** from **${originCity} (${originCode})** to **${destCity} (${destCode})**.\n\n• Preferred Class: **${selectedClass}**\n• Berth Priority: **${selectedBerth}**\n• Quota Select: **${quota}**.\n\nWould you like me to reserve the seat and proceed to payment? Describe your preference or type **"Proceed to payment"** to checkout!`;

  return {
    replyMessage,
    hasActionablePlan: true,
    intent,
    origin: `${originCity} (${originCode})`,
    destination: `${destCity} (${destCode})`,
    quota,
    trainName: train1Name,
    trainNo: train1No,
    depTime: dep1,
    arrTime: arr1,
    probability: prob1,
    reasoning: `Matches your travel criteria perfectly. Direct departure aligns with your time constraints. Allocated to coach section supporting ${selectedClass} ${selectedBerth}.`,
    selectedClass,
    selectedBerth,
    travelDate,
    trainOptions: [
      {
        trainName: train1Name,
        trainNo: train1No,
        depTime: dep1,
        arrTime: arr1,
        probability: prob1,
        fare: fare1,
        reasoning: reason1
      },
      {
        trainName: train2Name,
        trainNo: train2No,
        depTime: dep2,
        arrTime: arr2,
        probability: prob2,
        fare: fare2,
        reasoning: reason2
      },
      {
        trainName: train3Name,
        trainNo: train3No,
        depTime: dep3,
        arrTime: arr3,
        probability: prob3,
        fare: fare3,
        reasoning: reason3
      },
      {
        trainName: train4Name,
        trainNo: train4No,
        depTime: dep4,
        arrTime: arr4,
        probability: prob4,
        fare: fare4,
        reasoning: reason4
      },
      {
        trainName: train5Name,
        trainNo: train5No,
        depTime: dep5,
        arrTime: arr5,
        probability: prob5,
        fare: fare5,
        reasoning: reason5
      }
    ]
  };
}

export const templateMockData: Record<"tatkal" | "family", IRCTCResponse> = {
  tatkal: {
    replyMessage: "Urgent emergency request processed. Delhi to Mumbai express coordinates mapped with instant Tatkal booking priority in 3AC Class, Lower Berth.",
    hasActionablePlan: true,
    intent: "EMERGENCY_TATKAL",
    origin: "NEW DELHI (NDLS)",
    destination: "MUMBAI CENTRAL (MMCT)",
    quota: "CK (Tatkal)",
    trainName: "August Kranti Rajdhani",
    trainNo: "Train #12954",
    depTime: "16:55",
    arrTime: "09:55",
    probability: "94% Tatkal Allocation Probability",
    reasoning: "Urgent status prioritizes the Superfast Rajdhani express corridor. Tatkal slot scheduling ensures a direct run with reserved berth protection.",
    selectedClass: "3AC (3A)",
    selectedBerth: "Lower Berth",
    travelDate: "2026-06-07"
  },
  family: {
    replyMessage: "Scenic Bangalore to Goa holiday profile generated. CC panoramic vistas and kitchen pantry details added to reservation preferences.",
    hasActionablePlan: true,
    intent: "LEISURE_PLAN",
    origin: "BENGALURU CITY (SBC)",
    destination: "MADGAON JUNCTION (MAO)",
    quota: "GN (General Class)",
    trainName: "Vasco Da Gama Express",
    trainNo: "Train #17316",
    depTime: "14:30",
    arrTime: "06:45",
    probability: "88% Seat Allocation Probability",
    reasoning: "Diurnal route traversal structured specifically to capture Western Ghats landmark details, including the spectacular Dudhsagar waterfalls passage.",
    selectedClass: "Chair Car (CC)",
    selectedBerth: "Window Seat",
    travelDate: "2026-06-13"
  }
};
