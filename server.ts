import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI Copilot features will run in mock demonstration mode.");
}

// ----------------- SECURITY UTILITIES & VALIDATION -----------------

/**
 * Escapes characters that could be exploited in XSS attacks.
 * Limits the length to prevent DoS attacks.
 */
function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== "string") {
    return "";
  }
  let str = input.trim();
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  // Replace HTML tag anchors, braces and quotes to neutralize scripts
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Decodes the sanitized HTML entities for sending to the AI model if necessary,
 * or allows safe parsing. However, escaping for database/rendering is primary.
 */
function validateRole(role: unknown): "fan" | "volunteer" | "staff" | "organizer" {
  const allowedRoles = ["fan", "volunteer", "staff", "organizer"];
  if (typeof role === "string" && allowedRoles.includes(role)) {
    return role as "fan" | "volunteer" | "staff" | "organizer";
  }
  return "fan";
}

// ----------------- API ENDPOINTS -----------------

/**
 * 1. AI Copilot Chat Endpoint
 * Role-based intelligent assistant giving guidance, seating suggestions, translation support.
 */
app.post("/api/copilot/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawRole = req.body.role;
    const rawMessages = req.body.messages;
    const rawLanguage = req.body.language;

    const role = validateRole(rawRole);
    const language = sanitizeString(rawLanguage, 50);

    if (!rawMessages || !Array.isArray(rawMessages)) {
      res.status(400).json({ error: "Invalid payload format. 'messages' must be a valid array." });
      return;
    }

    // Map and thoroughly sanitize each historical message item
    const sanitizedMessages = rawMessages.map((msg: any) => {
      const msgRole = msg && typeof msg.role === "string" && (msg.role === "user" || msg.role === "assistant" || msg.role === "model")
        ? msg.role
        : "user";
      const msgContent = msg ? sanitizeString(msg.content, 1500) : "";
      return { role: msgRole, content: msgContent };
    }).filter(msg => msg.content.length > 0);

    if (sanitizedMessages.length === 0) {
      res.status(400).json({ error: "Missing or invalid chat content." });
      return;
    }

    const lastMessage = sanitizedMessages[sanitizedMessages.length - 1].content;

    const systemInstructions: Record<string, string> = {
      fan: `You are the FIFA World Cup 2026 Venue Concierge. Help the fan with seat directions, restrooms, transport schedules, food stands, and accessibility support. Keep responses warm, enthusiastic, concise (under 120 words), and formatted with bullet points if helpful. Translate/respond directly in the language requested: ${language || 'English'}. Avoid technical stadium terms; use simple row, gate, and block labels.`,
      volunteer: `You are the FIFA 2026 Volunteer Supervisor Copilot. Provide operational directions, lost-and-found matching rules, incident triage methods, translation templates, and crowd support procedures. Keep responses professional, highly actionable, well-organized (under 150 words), and focus on resolving issues quickly according to FIFA guidelines.`,
      staff: `You are the Venue Congestion & Resource Planner. Analyze crowd reports, gate flow levels, queue updates, cleaning tasks, and resource allocation. Provide actionable mitigation steps, queue balancing guidelines, and resource dispatch suggestions. Stay clinical, factual, and tactical (under 150 words).`,
      organizer: `You are the FIFA Stadium Command Center Chief AI Copilot. Assist with emergency decision support, crowd safety simulations, green initiatives, sustainability insights, and gate management. Give strategic, highly professional recommendations. Offer risk level evaluations and tactical operations advice (under 200 words).`
    };

    const targetInstruction = systemInstructions[role] || systemInstructions.fan;

    if (!ai) {
      // Return a graceful simulation if API key is missing
      res.json({
        content: `[Demo Mode] Simulated FIFA Copilot response for role: ${role}. Set a valid GEMINI_API_KEY to enable live intelligence. Prompt received: "${lastMessage}"`
      });
      return;
    }

    // Convert previous chat messages into Gemini history format
    const chatHistory = sanitizedMessages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start a chat using the proper server-side SDK
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: targetInstruction,
        temperature: 0.7,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({
      message: lastMessage
    });

    // Make sure output string is trimmed
    res.json({ content: result.text ? result.text.trim() : "" });
  } catch (err: any) {
    console.error("Error in /api/copilot/chat:", err);
    res.status(500).json({ error: "Failed to communicate with AI Copilot. The team has been notified." });
  }
});

/**
 * 2. AI Incident Triage Endpoint
 * Evaluates the details of an incident report and outputs priority and custom instructions using structural JSON.
 */
app.post("/api/copilot/incident", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawType = req.body.type;
    const rawSector = req.body.sector;
    const rawDescription = req.body.description;

    const allowedTypes = ["medical", "crowd", "security", "facility", "other"];
    const type = typeof rawType === "string" && allowedTypes.includes(rawType) ? rawType : "facility";
    const sector = sanitizeString(rawSector, 100);
    const description = sanitizeString(rawDescription, 1000);

    if (!sector || !description) {
      res.status(400).json({ error: "Missing or invalid required incident fields: sector, description." });
      return;
    }

    if (!ai) {
      // Mock triage response if key is missing
      const priorities: Record<string, string> = { medical: 'critical', security: 'high', crowd: 'high', facility: 'medium', other: 'medium' };
      res.json({
        priority: priorities[type] || 'medium',
        recommendation: `[Demo Mode] Simulated recommendation: Dispatch nearest team to ${sector} immediately. Clean up spill or clear blockages.`,
        requiresEmergencyAlert: type === 'security' || type === 'medical',
        suggestedSectorStatus: type === 'crowd' ? 'congested' : 'normal'
      });
      return;
    }

    const prompt = `Analyze this FIFA stadium incident and categorize it professionally:
    - Type of incident: ${type}
    - Sector location: ${sector}
    - Description: ${description}
    Provide a robust response matching the requested schema.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the FIFA Incident Dispatch Optimizer. Assess the urgency and suggest immediate staff actions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              description: "The triage urgency scale: 'low', 'medium', 'high', 'critical'."
            },
            recommendation: {
              type: Type.STRING,
              description: "Precise, step-by-step dispatcher directive for volunteers or staff nearby (under 60 words)."
            },
            requiresEmergencyAlert: {
              type: Type.BOOLEAN,
              description: "Whether the organizer should broadcast an active emergency stadium-wide alert."
            },
            suggestedSectorStatus: {
              type: Type.STRING,
              description: "The updated status for the sector: 'normal', 'crowded', 'congested', 'critical'."
            }
          },
          required: ["priority", "recommendation", "requiresEmergencyAlert", "suggestedSectorStatus"]
        }
      }
    });

    const parsedData = JSON.parse(result.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error in /api/copilot/incident:", err);
    res.status(500).json({ error: "Failed to evaluate incident safely. Please contact operational leads." });
  }
});

/**
 * 3. AI Emergency Simulation Support Endpoint
 * Provides immediate tactical action cards during critical stadium-level emergency drills or real situations.
 */
app.post("/api/copilot/emergency", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawScenario = req.body.scenario;
    const rawLocation = req.body.location;
    const rawCurrentImpact = req.body.currentImpact;

    const scenario = sanitizeString(rawScenario, 500);
    const location = sanitizeString(rawLocation, 200) || "All sectors";
    const currentImpact = sanitizeString(rawCurrentImpact, 500) || "Unknown/unspecified";

    if (!scenario) {
      res.status(400).json({ error: "Missing required scenario text." });
      return;
    }

    if (!ai) {
      const fallbacks: Record<string, string> = {
        "scen-1": "Tactical Protocol [SUPPORTER BLOCKAGE]:\n• Dispatch crowd controllers to redirect Gate S2 lines.\n• Turn on East Plazas large digital display guides.\n• Issue push alerts urging Sector C fans to dwell or access food blocks.",
        "scen-2": "Tactical Protocol [LIGHTNING PROTOCOL]:\n• Broadcast evacuation sirens stadium-wide.\n• Open all interior concourse gate safety tunnels.\n• Deploy field crews to safely clear open plazas.",
        "scen-3": "Tactical Protocol [TRANSIT SHUTDOWN]:\n• Activate secondary fan dwell entertainment guides on giant screens.\n• Deploy emergency bus shuttles to Sector A plaza loop.\n• Broaden concession operational hours in North blocks."
      };
      // Match key identifiers if any
      let chosenFallback = "Emergency Response Protocol:\n1. Deploy stadium perimeter safety wardens.\n2. Set Gate 3 and Gate 4 to fully open.\n3. Display evacuation visuals in concourses.";
      for (const [key, value] of Object.entries(fallbacks)) {
        if (scenario.toLowerCase().includes(key) || scenario.toLowerCase().includes("blockage") && key === "scen-1" || scenario.toLowerCase().includes("weather") && key === "scen-2" || scenario.toLowerCase().includes("transit") && key === "scen-3") {
          chosenFallback = value;
          break;
        }
      }

      res.json({ response: chosenFallback });
      return;
    }

    const prompt = `Generate an immediate, high-priority emergency tactical plan for the stadium command center.
    Scenario: ${scenario}
    Location: ${location}
    Current Impact: ${currentImpact}
    Deliver 3-4 structured, bulleted, razor-sharp critical operations.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Chief Emergency Response Strategist. Be concise, urgent, authoritative, and direct. Deliver immediate tactical operations items only.",
        temperature: 0.3
      }
    });

    res.json({ response: result.text ? result.text.trim() : "" });
  } catch (err: any) {
    console.error("Error in /api/copilot/emergency:", err);
    res.status(500).json({ error: "Failed to generate emergency tactical plans under security protocols." });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiConfigured: !!apiKey });
});

// ----------------- VITE DEVELOPMENT / PRODUCTION MIDDLEWARE -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FIFA 2026 Venue Intelligence Server running on port ${PORT}`);
  });
}

startServer();
