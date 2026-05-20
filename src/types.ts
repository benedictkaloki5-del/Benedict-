export type OrderType = "BUY" | "SELL";

export interface Trade {
  id: string;
  pair: string;
  type: OrderType;
  openPrice: number;
  closePrice?: number;
  lotSize: number; // e.g. 0.01, 0.1, 1.0
  stopLoss?: number;
  takeProfit?: number;
  profit: number; // Running profit in USD
  isOpen: boolean;
  timestamp: string;
}

export interface CurrencyPair {
  symbol: string;
  name: string;
  price: number;
  pipSize: number; // 0.0001 or 0.01
  spread: number; // in pips (e.g., 1.5)
  volatility: number;
  trend: "UP" | "DOWN" | "SIDEWAYS";
  history: number[]; // Last 30 tick prices
  candles: {
    open: number;
    high: number;
    low: number;
    close: number;
    timestamp: string;
  }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate";
  duration: string;
  sections: {
    title: string;
    body: string;
    tips?: string;
  }[];
}
