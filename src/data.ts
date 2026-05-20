import { Lesson, CurrencyPair } from "./types";

// Helpful mathematical formulas for Forex calculations
export const calculatePipValueText = (
  pairCode: string,
  lotSize: number,
  pipSize: number,
  exchangeRate: number
): number => {
  // Approximate standard pip values in USD:
  // Standard Lot (1.00) = $10 per pip for most USD counter pairs.
  // Mini Lot (0.10) = $1 per pip.
  // Micro Lot (0.01) = $0.10 per pip.
  // If Yen pair (JPY is counter, e.g. USD/JPY), pip movement is 0.01.
  const units = lotSize * 100000; // Contract base value
  if (pairCode.endsWith("USD")) {
    return units * pipSize;
  } else {
    // If it's something else (e.g. USD/JPY), convert base unit back to USD
    return (units * pipSize) / exchangeRate;
  }
};

export const calculateTradeProfit = (
  type: "BUY" | "SELL",
  openPrice: number,
  currentPrice: number,
  pipSize: number,
  lotSize: number,
  symbol: string
): number => {
  const diff = type === "BUY" ? currentPrice - openPrice : openPrice - currentPrice;
  const pips = diff / pipSize;
  const standardPipValue = lotSize * 10; // Approx $10/pip for standard lot in USD
  return Number((pips * standardPipValue).toFixed(2));
};

export const INITIAL_CURRENCY_PAIRS: CurrencyPair[] = [
  {
    symbol: "EUR/USD",
    name: "Euro vs US Dollar",
    price: 1.0852,
    pipSize: 0.0001,
    spread: 1.2,
    volatility: 0.0008,
    trend: "SIDEWAYS",
    history: [1.0845, 1.0848, 1.0850, 1.0847, 1.0852, 1.0854, 1.0850, 1.0852],
    candles: [
      { open: 1.0844, high: 1.0849, low: 1.0840, close: 1.0845, timestamp: "09:00" },
      { open: 1.0845, high: 1.0852, low: 1.0843, close: 1.0850, timestamp: "10:00" },
      { open: 1.0850, high: 1.0855, low: 1.0845, close: 1.0848, timestamp: "11:00" },
      { open: 1.0848, high: 1.0856, low: 1.0846, close: 1.0852, timestamp: "12:00" },
    ],
  },
  {
    symbol: "GBP/USD",
    name: "British Pound vs US Dollar",
    price: 1.2644,
    pipSize: 0.0001,
    spread: 1.8,
    volatility: 0.0012,
    trend: "UP",
    history: [1.2630, 1.2634, 1.2640, 1.2638, 1.2642, 1.2645, 1.2641, 1.2644],
    candles: [
      { open: 1.2625, high: 1.2634, low: 1.2620, close: 1.2630, timestamp: "09:00" },
      { open: 1.2630, high: 1.2642, low: 1.2628, close: 1.2640, timestamp: "10:00" },
      { open: 1.2640, high: 1.2648, low: 1.2635, close: 1.2644, timestamp: "11:00" },
    ],
  },
  {
    symbol: "USD/JPY",
    name: "US Dollar vs Japanese Yen",
    price: 155.65,
    pipSize: 0.01,
    spread: 2.1,
    volatility: 0.15,
    trend: "DOWN",
    history: [155.85, 155.80, 155.75, 155.78, 155.70, 155.62, 155.68, 155.65],
    candles: [
      { open: 155.90, high: 156.05, low: 155.82, close: 155.85, timestamp: "09:00" },
      { open: 155.85, high: 155.90, low: 155.70, close: 155.75, timestamp: "10:00" },
      { open: 155.75, high: 155.82, low: 155.55, close: 155.65, timestamp: "11:00" },
    ],
  },
  {
    symbol: "AUD/USD",
    name: "Australian Dollar vs US Dollar",
    price: 0.6621,
    pipSize: 0.0001,
    spread: 1.5,
    volatility: 0.0006,
    trend: "UP",
    history: [0.6611, 0.6615, 0.6618, 0.6614, 0.6620, 0.6624, 0.6619, 0.6621],
    candles: [
      { open: 0.6610, high: 0.6618, low: 0.6608, close: 0.6615, timestamp: "09:00" },
      { open: 0.6615, high: 0.6622, low: 0.6612, close: 0.6620, timestamp: "10:00" },
      { open: 0.6620, high: 0.6626, low: 0.6617, close: 0.6621, timestamp: "11:00" },
    ],
  },
];

export const FOREX_LESSONS: Lesson[] = [
  {
    id: "basics",
    title: "1. Forex Core Concepts",
    description: "Understand the base currency, quote rate, and world currency pairs.",
    difficulty: "Beginner",
    duration: "6 mins",
    sections: [
      {
        title: "What is Foreign Exchange (Forex)?",
        body: "Forex is the global decentralized market where currencies are traded. It is the largest, most liquid financial market in the world, with over **$7.5 trillion** in daily volume. If you have ever traveled abroad and exchanged your money, you have participated in the Forex market!",
      },
      {
        title: "Base vs. Quote Currency Pair",
        body: "All currencies trade in pairs (e.g., EUR/USD). The first currency listed is the **Base Currency** (EUR) and the second is the **Quote/Counter Currency** (USD).\n\nIf **EUR/USD = 1.0850**, it means **1 Euro** can purchase exactly **1.0852 US Dollars**. You are holding EUR and measuring its cost in USD.",
      },
      {
        title: "Major, Minor, and Exotic Pairs",
        body: "- **Major Pairs:** Always include the US Dollar (USD) matched with other economic powerhouses (e.g. EUR/USD, GBP/USD, USD/JPY, USD/CHF). These have high trade volume and very low transaction spreads.\n- **Minor Pairs:** Cross-currency pairings that do not include USD directly but involve other majors (e.g. EUR/GBP, GBP/JPY).\n- **Exotics:** Pairs pairing a major currency with an emerging-market currency (e.g., USD/MXN, USD/TRY). These are highly volatile with wide spreads.",
      },
    ],
  },
  {
    id: "pips",
    title: "2. Pips, Lots & Leverage",
    description: "Learn how price movements are measured and trade size mathematics.",
    difficulty: "Beginner",
    duration: "8 mins",
    sections: [
      {
        title: "What is a Pip?",
        body: "A **PIP** (Percentage in Point) represents the standard unit of change in a pair. For standard currencies, it represents the **4th decimal place** (0.0001). \n\n*Example:* If EUR/USD rises from 1.0852 to 1.0853, that represents a 1-pip movement. \n\n⚠️ **Yen Exception:** For Japanese Yen (JPY) currency pairs, a PIP sits on the **2nd decimal place** (0.01). If USD/JPY moves from 155.60 to 155.61, it represents a 1-pip shift.",
      },
      {
        title: "Contract sizing (Standard, Mini, Micro Lots)",
        body: "Traders execute contracts using unit batches called **Lots**:\n- **Standard Lot (1.00):** Represents 100,000 units of the base currency. Pip move value ≈ **$10.00 USD**.\n- **Mini Lot (0.10):** Represents 10,000 units of base currency. Pip move value ≈ **$1.00 USD**.\n- **Micro Lot (0.01):** Represents 1,000 units of base currency. Pip move value ≈ **$0.10 USD**.\n\n*Rule of Thumb:* Beginner traders must strictly stick to **Micro Lots (0.01)** because even a major 100-pip move will only affect your account by $10.00, preserving your educational bankroll.",
      },
      {
        title: "Leverage & Margin - A Double-Edged Sword",
        body: "**Leverage** is borrowed capital provided by a broker, allowing you to control large order sizes with a small deposit. This deposit is called your **Margin**.\n\n*For instance:* At 50:1 leverage, you only need $200 of margin to trade a position size of $10,000 (0.1 Mini Lot). While it amplifies returns, it equally amplifies losses. Excessive leverage is a beginner's biggest risk trap.",
      },
    ],
  },
  {
    id: "analysis",
    title: "3. Candlesticks & Chart Basics",
    description: "How to interpret Japanese candlesticks and price action charts.",
    difficulty: "Intermediate",
    duration: "10 mins",
    sections: [
      {
        title: "Japanese Candlesticks",
        body: "Candlesticks display price actions for a set timeframe. Each candle is split into:\n- **The Body:** The wide section mapping the price gap between the candle's **Open** and **Close**.\n- **The Wick (Shadows):** Thin vertical lines pointing to the highest and lowest price peaks during that period.\n- **Colors:** Green (bullish, closed higher than it opened) and Red (bearish, closed lower than it opened).",
      },
      {
        title: "Support and Resistance Floors",
        body: "- **Support:** An invisible floor price level where heavy buying demand starts to outweigh sell liquidations, forcing price rebound.\n- **Resistance:** An invisible ceiling price level where heavy selling supply outweighs buyers, forcing price stagnation/drop.",
      },
    ],
  },
  {
    id: "risk",
    title: "4. Golden Rules of Risk Management",
    description: "Learn how to keep your capital safe and avoid common retail trader traps.",
    difficulty: "Intermediate",
    duration: "7 mins",
    sections: [
      {
        title: "The 1%-2% Capital Shield",
        body: "The absolute law of trading survival states: **Never risk more than 1% to 2% of your account size on any given trade**.\n\nIf your demo balance is $10,000, you should size your trade so that a hit stop loss loses no more than $100. This ensures a 10-trade losing streak only knocks off ~10% of your account instead of wiping it completely.",
      },
      {
        title: "Defining Stop Loss (SL) and Take Profit (TP)",
        body: "- **Stop Loss (SL):** A critical automatic instruction that shuts down a trade at a set coordinate if prices turn against you, capping losses.\n- **Take Profit (TP):** An automatic order that sells when target heights are met, capturing profits without emotional greed stalling you.",
      },
    ],
  },
];
