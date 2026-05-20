import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini safely, logging a clear warning if the key is missing
const isKeyAvailable = !!process.env.GEMINI_API_KEY;

const ai = isKeyAvailable
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Mock backup answers for when API keys are not provided
const getOfflineResponse = (prompt: string): string => {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("pip")) {
    return "💡 **Offline Lesson on PIPs:**\n\nA **PIP** (Percentage in Point) is the smallest unit of price change in a currency pair. For most pairs (like EUR/USD), 1 pip = **0.0001** (the fourth decimal place). For Japanese Yen pairs (like USD/JPY), 1 pip = **0.01** (the second decimal place).\n\n*Example:* If EUR/USD moves from 1.0850 to 1.0855, it has gained 5 pips.";
  }
  if (normalized.includes("leverage") || normalized.includes("margin")) {
    return "💡 **Offline Lesson on Leverage & Margin:**\n\n**Leverage** allows a beginner trader to control a larger trade size with a small amount of deposit (called **Margin**).\n\n*How it works:* With a leverage of 100:1, you only need $1,000 of margin to trade a position size of $100,000 (1 standard lot). \n\n⚠️ **WARNING:** Leverage amplifies both your potential profits *and* your potential losses. High leverage is the #1 reason beginner traders lose capital. Always use tight Stop Losses!";
  }
  if (normalized.includes("lot")) {
    return "💡 **Offline Lesson on Lots:**\n\nIn Forex, trades are executed in standard contract sizes called **Lots**:\n- **Standard Lot (1.00):** $100,000 of base currency (Approx. $10 per pip).\n- **Mini Lot (0.10):** $10,000 of base currency (Approx. $1 per pip).\n- **Micro Lot (0.01):** $1,000 of base currency (Approx. $0.10 per pip).\n\nAs a beginner, you should always start trading with **Micro Lots (0.01)** to protect your capital while practicing.";
  }
  return "👋 **Welcome to Forex Mentor!** (Running in Demo/Offline Mode)\n\nI can answer any fundamental Forex trading questions. Try asking about:\n- What is a **Pip**?\n- How does **Leverage & Margin** work?\n- What are **Lots** and how much capital do I need?\n- Why is **Risk Management** (Stop Loss) so important?\n\n*Check the Settings > Secrets tab to add your Google Gemini API key to unlock dynamic personal tutoring!*";
};

// Simulated mock quizzes if Gemini is offline
const OFFLINE_QUIZZES: Record<string, any> = {
  basics: {
    quiz: [
      {
        question: "What is the primary product traded in the Forex market?",
        options: [
          "Corporate shares of stock",
          "Government bonds",
          "Currency pairs (one exchange rate relative to another)",
          "Commodity futures like oil and wheat"
        ],
        correctIndex: 2,
        explanation: "Forex stands for Foreign Exchange, which involves simultaneously buying one currency and selling another, traded as currency pairs."
      },
      {
        question: "In the EUR/USD currency pair, which is the 'Base Currency'?",
        options: [
          "EUR (Euro)",
          "USD (US Dollar)",
          "Both are bases",
          "Neither is a base"
        ],
        correctIndex: 0,
        explanation: "The first currency listed in any forex pair is the base currency (EUR), and the second is the quote system or counter currency (USD)."
      },
      {
        question: "When is the global Forex market open for retail trading?",
        options: [
          "Monday to Friday, 9:00 AM to 5:00 PM EST",
          "24 hours a day, 5 days a week",
          "Saturday and Sunday only",
          "24 hours a day, 7 days a week"
        ],
        correctIndex: 1,
        explanation: "Forex market is open 24 hours a day, 5 days a week, bridging international sessions (Sydney, Tokyo, London, and New York)."
      }
    ]
  },
  pips: {
    quiz: [
      {
        question: "For the EUR/USD currency pair, if the price moves from 1.0920 to 1.0924, how many pips has it moved?",
        options: [
          "40 pips",
          "4 pips",
          "0.4 pips",
          "400 pips"
        ],
        correctIndex: 1,
        explanation: "For standard pairs, a pip is the 4th decimal place. 1.0924 minus 1.0920 equals a change of 0.0004, which is 4 pips."
      },
      {
        question: "How is a pip calculated in Japanese Yen (JPY) currency pairs?",
        options: [
          "The first decimal place (0.1)",
          "The second decimal place (0.01)",
          "The fourth decimal place (0.0001)",
          "The fifth decimal place (0.00001)"
        ],
        correctIndex: 1,
        explanation: "Because the Yen has low nominal value, USD/JPY is quoted with 2 decimal places (or 3 for pipettes). Thus, 1 pip = 0.01."
      },
      {
        question: "If you trade a Micro Lot (0.01) of EUR/USD, roughly how much is a 1-pip movement worth in USD?",
        options: [
          "$10.00",
          "$1.00",
          "$0.10",
          "$100.00"
        ],
        correctIndex: 2,
        explanation: "A standard lot is worth $10/pip, a mini lot (0.10) is $1/pip, and a micro lot (0.01) is worth $0.10 per pip."
      }
    ]
  },
  analysis: {
    quiz: [
      {
        question: "On a bullish Japanese candlestick pattern, where is the 'close' relative to the 'open'?",
        options: [
          "The close is below the open",
          "The close is above the open",
          "They are at the exact same level",
          "There is no close"
        ],
        correctIndex: 1,
        explanation: "A bullish candlestick represents an increase in price, meaning the closing price is higher (above) the opening price."
      },
      {
        question: "What is support in technical analysis?",
        options: [
          "A price ceiling where sellers typically take control",
          "A financial backing provided by the broker",
          "A price floor where buyers are expected to step in and prevent further declines",
          "An economic event reported in the news calendar"
        ],
        correctIndex: 2,
        explanation: "Support is a price level where demand (buying strength) prevents the price of a currency from falling further."
      }
    ]
  },
  risk: {
    quiz: [
      {
        question: "What is the recommended maximum percentage of your account to risk on any single trade?",
        options: [
          "1% to 2% of account balance",
          "10% to 20% of account balance",
          "50% of account balance",
          "100% (Go all in)"
        ],
        correctIndex: 0,
        explanation: "Professional risk management guidelines advocate risking no more than 1% to 2% of total capital on a single trade to avoid account ruin."
      },
      {
        question: "What is the primary function of a Stop Loss (SL) order?",
        options: [
          "To automatically close a trade to capture maximum profits",
          "To guarantee a trade always closes in profit",
          "To automatically limit potential losses by exiting a trade if price goes too far against you",
          "To borrow more funds from the broker"
        ],
        correctIndex: 2,
        explanation: "A Stop Loss is a pending instruction that closes a losing trade at a pre-set level, preventing further equity drain."
      }
    ]
  }
};

// API Endpoint for Interactive AI Tutor
app.post("/api/tutor", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages payload" });
    }

    if (!ai) {
      // Offline fallback
      const lastUserMsg = messages[messages.length - 1]?.text || "";
      const reply = getOfflineResponse(lastUserMsg);
      return res.json({ text: reply, isOffline: true });
    }

    // Format for @google/genai SDK
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are ForexMentor, a world-class, extremely supportive educational trading companion for absolute beginners. 
Your goal is to explain Forex concepts simply, using real-world analogies (like exchanging cash at an airport or purchasing apples at a grocery market).
Highlight the math step-by-step when explaining Pips (0.0001 for most, 0.01 for Yen) and contract sizes (Lots).
ALWAYS stress risk management. Encourage beginners to only trade micro lots (0.01) with tight Stop Losses.
Keep formatting elegant and clean using markdown bullets and bold values.
Do not use dry corporate speech, do not discuss programming/code, and do not make specific real-time trading recommendations. Focus entirely on theory, terminology, psychological discipline, and calculation safety.`,
      }
    });

    const text = response.text || "I was unable to formulate a response. Please try rephrasing.";
    return res.json({ text, isOffline: false });
  } catch (error: any) {
    console.error("Gemini Tutor Error:", error);
    return res.status(500).json({
      error: "Failed to communicate with the tutor.",
      fallbackText: "I'm having trouble connecting to my brain right now, but feel free to practice simulated positions below or read the tutorial academy!"
    });
  }
});

// API Endpoint to generate custom quizzes
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { category } = req.body;
    const resolvedCategory = category || "basics";

    if (!ai) {
      // Return offline static quizzes
      const fallbackQuiz = OFFLINE_QUIZZES[resolvedCategory] || OFFLINE_QUIZZES.basics;
      return res.json({ ...fallbackQuiz, isOffline: true });
    }

    let topicPrompt = "General Forex Basics (Terminology, Sessions, Base/Quote Currencies)";
    if (resolvedCategory === "pips") {
      topicPrompt = "Pips, Calculations, Lots sizes (standard, mini, micro), and Leverage calculation examples";
    } else if (resolvedCategory === "analysis") {
      topicPrompt = "Technical Analysis Basics (Bullish/Bearish candlesticks, Support & Resistance, basic Moving Average crossings)";
    } else if (resolvedCategory === "risk") {
      topicPrompt = "Risk Management principles (Position sizing, Stop Loss, Take Profit, and the 1-2% risk-per-trade rule)";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate an interactive multiple choice quiz on the topic: ${topicPrompt}.
The quiz must have exactly 3 high-quality educational questions suited for a beginner. Includes detailed explanation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "A clear, beginner-friendly question testing a core Forex concept."
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options representing plausible answers."
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: "Zero-based index of the correct option (0, 1, 2, or 3)."
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "An educational explanation explaining why this is correct and why other key concepts matter."
                  }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["quiz"]
        }
      }
    });

    const parsedJson = JSON.parse(response.text.trim());
    return res.json({ quiz: parsedJson.quiz, isOffline: false });
  } catch (error: any) {
    console.error("Gemini Quiz Error:", error);
    const fallbackQuiz = OFFLINE_QUIZZES[req.body.category] || OFFLINE_QUIZZES.basics;
    return res.json({ ...fallbackQuiz, isOffline: true, error: "Tutor is currently offline. Loaded academy standard test instead!" });
  }
});

// Vite Middleware & Static Serves
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
    console.log(`Forex learning server is active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
