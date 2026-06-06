import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy Route
  app.post("/api/gemini", async (req, res) => {
    const { prompt, key } = req.body;
    const apiKey = key || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return res.status(400).json({ error: "Missing API Key" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let attempt = 0;
      let delay = 1000;
      let response = null;
      let lastError = null;

      while (attempt < 5) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              systemInstruction: "You are the central booking assistant of Indian Railways (IRCTC). Analyze the user's input/chat prompt. If the user is just saying hello, asking general queries, or has not specified a starting station and target destination, set hasActionablePlan to false, and reply conversationally in replyMessage. If they describe a travel requirement with origin and destination, set hasActionablePlan to true and dynamically nominate the best train fitting their preferences. Support options like Tatkal CK quota, specific class (3AC, 2AC, etc.), and specific berth preferences (Lower, Upper, etc.) by setting origin, destination, train details, quota, selectedClass, and selectedBerth appropriately based on their text. Respond using valid JSON matching the schema.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  replyMessage: { 
                    type: Type.STRING, 
                    description: "An elegant, highly welcoming conversational response confirming travel recommendation, answering questions, or greeting the user depending on input." 
                  },
                  hasActionablePlan: {
                    type: Type.BOOLEAN,
                    description: "Set to true ONLY if user specified travel stations or requested train routing suggestions (origin, destination). Otherwise set to false."
                  },
                  intent: { 
                    type: Type.STRING, 
                    description: "Must be exactly one of: EMERGENCY_TATKAL, LEISURE_PLAN, CORPORATE_TRANSIT, GENERAL_BOOKING. If hasActionablePlan is false, default to GENERAL_BOOKING." 
                  },
                  origin: { 
                    type: Type.STRING, 
                    description: "Standardized Station Name & Code, e.g. NEW DELHI (NDLS). Use empty string if hasActionablePlan is false." 
                  },
                  destination: { 
                    type: Type.STRING, 
                    description: "Standardized Station Name & Code, e.g. VGL JHANSI (VGLJ). Use empty string if hasActionablePlan is false." 
                  },
                  quota: { 
                    type: Type.STRING, 
                    description: "Standardized travel quota, e.g. CK (Tatkal), GN (General), LD (Ladies). Use empty string if hasActionablePlan is false." 
                  },
                  trainName: { 
                    type: Type.STRING, 
                    description: "Dynamically chosen train title, e.g. Taj Express, Shatabdi Express, Gatimaan Express, August Kranti Rajdhani. Use empty string if hasActionablePlan is false." 
                  },
                  trainNo: { 
                    type: Type.STRING, 
                    description: "E.g. Train #12280, Train #12954. Use empty string if hasActionablePlan is false." 
                  },
                  depTime: { 
                    type: Type.STRING, 
                    description: "Departure in HH:MM format. Use empty string if hasActionablePlan is false." 
                  },
                  arrTime: { 
                    type: Type.STRING, 
                    description: "Arrival in HH:MM format. Use empty string if hasActionablePlan is false." 
                  },
                  probability: { 
                    type: Type.STRING, 
                    description: "Confirmation probability forecast, e.g. 98% Confirmation Chance. Use empty string if hasActionablePlan is false." 
                  },
                  reasoning: { 
                    type: Type.STRING, 
                    description: "Highly convincing custom logical explanation summarizing why this train, timing, quota, class, and berth fit user constraints. Use empty string if hasActionablePlan is false." 
                  },
                  selectedClass: {
                    type: Type.STRING,
                    description: "E.g. 3AC (3A), 2AC (2A), Sleeper (SL), First AC (1A) based on user prompt. If hasActionablePlan is false, use empty string."
                  },
                  selectedBerth: {
                    type: Type.STRING,
                    description: "E.g. Lower Berth, Upper Berth, Middle Berth based on user prompt. If hasActionablePlan is false, use empty string."
                  },
                  travelDate: {
                    type: Type.STRING,
                    description: "Standardized travel date under format YYYY-MM-DD based on user's query (e.g. 'tomorrow', 'next week', specific date). If unspecified, default to tomorrow '2026-06-07'. Use empty string if hasActionablePlan is false."
                  },
                  trainOptions: {
                    type: Type.ARRAY,
                    description: "A list of 5 alternate train choices (including the top selected option first) fitting the user's time and class requirements. If hasActionablePlan is false, return an empty array.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        trainName: { type: Type.STRING, description: "E.g. Taj Express" },
                        trainNo: { type: Type.STRING, description: "E.g. Train #12280" },
                        depTime: { type: Type.STRING, description: "E.g. 06:40" },
                        arrTime: { type: Type.STRING, description: "E.g. 11:50" },
                        probability: { type: Type.STRING, description: "E.g. 97% Confirmed" },
                        fare: { type: Type.INTEGER, description: "The fare amount in rupees, e.g. 1450" },
                        reasoning: { type: Type.STRING, description: "Why this alternative was included, e.g., 'A fast morning alternative'" }
                      },
                      required: ["trainName", "trainNo", "depTime", "arrTime", "probability", "fare", "reasoning"]
                    }
                  }
                },
                required: [
                  "replyMessage", 
                  "hasActionablePlan",
                  "intent", 
                  "origin", 
                  "destination", 
                  "quota", 
                  "trainName", 
                  "trainNo", 
                  "depTime", 
                  "arrTime", 
                  "probability", 
                  "reasoning",
                  "selectedClass",
                  "selectedBerth",
                  "travelDate",
                  "trainOptions"
                ]
              }
            }
          });
          break;
        } catch (err) {
          lastError = err;
          attempt++;
          if (attempt >= 5) break;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      if (!response) {
        throw lastError || new Error("Failed to contact Gemini API after 5 attempts");
      }

      const text = response.text;
      if (!text) {
        throw new Error("No response content from model");
      }
      
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to process AI travel heuristics." });
    }
  });

  // Serve static UI assets or dynamic developments via Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
