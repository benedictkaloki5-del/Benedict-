import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  LineChart, 
  MessageSquare, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  AlertTriangle, 
  DollarSign, 
  Plus, 
  Minus, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles, 
  RotateCcw, 
  ArrowRightLeft, 
  Award, 
  CheckCircle2, 
  Layers, 
  Send,
  Keyboard,
  Wallet,
  CreditCard,
  Receipt,
  Coins,
  Link,
  Copy,
  Share2,
  Newspaper,
  Calendar,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  Activity,
  FileText,
  LayoutDashboard,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Megaphone
} from "lucide-react";
import { INITIAL_CURRENCY_PAIRS, FOREX_LESSONS, calculateTradeProfit } from "./data";
import { CurrencyPair, Trade, Lesson, QuizQuestion } from "./types";

export default function App() {
  // System State
  const [activeTab, setActiveTab] = useState<"dashboard" | "academy" | "simulator" | "tutor" | "quiz" | "payments" | "news">("dashboard");
  const [balance, setBalance] = useState<number>(10000); // $10,000 demo capital
  const [leverage, setLeverage] = useState<number>(100); // 100:1 leverage baseline
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>(INITIAL_CURRENCY_PAIRS);
  const [selectedPairSymbol, setSelectedPairSymbol] = useState<string>("EUR/USD");
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  
  // Chart Indicators Options
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [supportLine, setSupportLine] = useState<number>(1.0820);
  const [resistanceLine, setResistanceLine] = useState<number>(1.0880);
  const [showIndicators, setShowIndicators] = useState<boolean>(true);

  // Lesson State & Step Interactive Simulator
  const [selectedLessonId, setSelectedLessonId] = useState<string>("basics");
  const [lotCalculatorSize, setLotCalculatorSize] = useState<number>(0.1); // default mini lot
  const [calculatorLeverage, setCalculatorLeverage] = useState<number>(100);

  // AI Tutor state
  const [tutorMessages, setTutorMessages] = useState<{ role: "user" | "model"; text: string; isOffline?: boolean }[]>([
    {
      role: "model",
      text: "👋 **Welcome to Forex Tutor!** I'm your interactive AI mentor.\n\nI can explain general trading concepts, break down complex calculations (such as how a JPY Pip works), or provide safe risk-management tips.\n\nAsk me any Forex question, or select one of the suggested lessons below!",
    }
  ]);
  const [tutorInput, setTutorInput] = useState<string>("");
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);

  // Quiz State
  const [activeQuizCategory, setActiveQuizCategory] = useState<string>("basics");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizFeedbackMessage, setQuizFeedbackMessage] = useState<string | null>(null);

  // Forex Manager Funding & Payment Terminal State
  const [paymentAmount, setPaymentAmount] = useState<number>(100); // Default to $100
  const [paymentPhone, setPaymentPhone] = useState<string>("254759722562"); // Forex Manager Destination phone
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [paymentStep, setPaymentStep] = useState<"idle" | "stk_pending" | "pin_verification" | "processing" | "success" | "error">("idle");
  const [stkErrorMessage, setStkErrorMessage] = useState<string>("");
  const [simulatedPin, setSimulatedPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [cardName, setCardName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

  // Registration Fee States
  const [isExamRegistered, setIsExamRegistered] = useState<boolean>(false);
  const [isMentorLicensed, setIsMentorLicensed] = useState<boolean>(false);
  const [isBrokerLicensed, setIsBrokerLicensed] = useState<boolean>(false);
  const [isAcademyRegistered, setIsAcademyRegistered] = useState<boolean>(false); // Starts false, unlocked after payment

  // Class of Trade registrations (ranging from 100 shillings to 10,000 shillings)
  const [isNoviceRegistered, setIsNoviceRegistered] = useState<boolean>(false);
  const [isStandardRegistered, setIsStandardRegistered] = useState<boolean>(true); // Let them start standard
  const [isProRegistered, setIsProRegistered] = useState<boolean>(false);
  const [isHedgeRegistered, setIsHedgeRegistered] = useState<boolean>(false);

  const [paymentPurpose, setPaymentPurpose] = useState<
    "funding" | "exam_fee" | "mentor_license" | "broker_reg" |
    "class_novice" | "class_standard" | "class_pro" | "class_hedge" | "academy_enroll"
  >("funding");

  // Share App Link States
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showLinkDropdown, setShowLinkDropdown] = useState<boolean>(false);
  const [shareTemplateIndex, setShareTemplateIndex] = useState<number>(0);
  const [shareCopiedState, setShareCopiedState] = useState<boolean>(false);
  const [qrColor, setQrColor] = useState<"emerald" | "pink" | "indigo">("pink");
  const [customNote, setCustomNote] = useState<string>("Highly recommend checking this out!");

  // News and Economic Calendar States
  const [newsFeed, setNewsFeed] = useState<Array<{
    id: string;
    source: string;
    headline: string;
    timestamp: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
    category: "central-banks" | "employment" | "inflation" | "geopolitics" | "technical";
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
    targetCurrency: "USD" | "EUR" | "GBP" | "JPY" | "ALL";
    summary: string;
  }>>([
    {
      id: "news-1",
      source: "Reuters Forex",
      headline: "US CPI Core Inflation Rises Unexpectedly to 3.4%, Bolstering Safe-Haven USD Bids",
      timestamp: "2 mins ago",
      impact: "HIGH",
      category: "inflation",
      sentiment: "BEARISH",
      targetCurrency: "USD",
      summary: "Consumer prices accelerated unexpectedly due to stubborn housing costs. Fed officials have hinted at delayed policy easing, causing US treasury yields to surge and major pairs like EURUSD and GBPUSD to pull back."
    },
    {
      id: "news-2",
      source: "Bloomberg",
      headline: "ECB President Christine Lagarde Retains Restrictive Rate Bias Amid Service Sector Wage Inflation",
      timestamp: "15 mins ago",
      impact: "HIGH",
      category: "central-banks",
      sentiment: "BULLISH",
      targetCurrency: "EUR",
      summary: "Lagarde warned that despite slowing goods prices, stubborn labor market tightness demands restrictive refinancing terms. Traders are repricing June expectations, resulting in support bounds for EUR."
    },
    {
      id: "news-3",
      source: "FXStreet",
      headline: "UK Average Earnings Cool to 4.2% supporting BoE June Rate Cut Anticipation",
      timestamp: "1 hr ago",
      impact: "MEDIUM",
      category: "employment",
      sentiment: "BEARISH",
      targetCurrency: "GBP",
      summary: "Wage indicators printed at 4.2%, cooling from 4.5% previously. Lower pressure on inflation gives Bank of England policymakers comfort to explore rate cuts sooner than later, rendering GBP sluggish."
    },
    {
      id: "news-4",
      source: "Tokyo Times",
      headline: "Bank of Japan Governor Ueda Flags Phased Real Interest Adjustment Parameters",
      timestamp: "2 hrs ago",
      impact: "HIGH",
      category: "central-banks",
      sentiment: "BULLISH",
      targetCurrency: "JPY",
      summary: "Ueda remarked that if base wage pressure triggers a healthy inflationary cycle, further structural normalization of yield curve levels will be critical, boosting Yen cross-pair support."
    },
    {
      id: "news-5",
      source: "TradingFloor News",
      headline: "Technical Analysis: EURUSD Bounces off Key Support at 1.0780 with Bullish MACD Crossover",
      timestamp: "3 hrs ago",
      impact: "LOW",
      category: "technical",
      sentiment: "BULLISH",
      targetCurrency: "EUR",
      summary: "A robust oversold reaction at the daily moving average zone triggers buy limits, aiming to retest the 1.0855 level in early London sessions."
    }
  ]);

  const [economicCalendar, setEconomicCalendar] = useState<Array<{
    id: string;
    time: string;
    currency: "USD" | "EUR" | "GBP" | "JPY";
    event: string;
    importance: "HIGH" | "MEDIUM" | "LOW";
    actual?: string;
    forecast: string;
    previous: string;
    countdown: number;
    state: "upcoming" | "released";
  }>>([
    {
      id: "cal-1",
      time: "15 mins ago",
      currency: "GBP",
      event: "UK Average Earnings Index 3m/y",
      importance: "MEDIUM",
      actual: "4.2%",
      forecast: "4.3%",
      previous: "4.5%",
      countdown: 0,
      state: "released"
    },
    {
      id: "cal-2",
      time: "In 45 seconds",
      currency: "USD",
      event: "US Core Retail Sales m/m",
      importance: "HIGH",
      forecast: "0.2%",
      previous: "0.1%",
      countdown: 45,
      state: "upcoming"
    },
    {
      id: "cal-3",
      time: "In 3 mins",
      currency: "EUR",
      event: "ECB Monetary Policy Statement",
      importance: "HIGH",
      forecast: "4.25%",
      previous: "4.25%",
      countdown: 180,
      state: "upcoming"
    },
    {
      id: "cal-4",
      time: "In 8 mins",
      currency: "USD",
      event: "US Unemployment Weekly Claims",
      importance: "MEDIUM",
      forecast: "215K",
      previous: "212K",
      countdown: 480,
      state: "upcoming"
    },
    {
      id: "cal-5",
      time: "Tomorrow",
      currency: "JPY",
      event: "National Core CPI y/y",
      importance: "HIGH",
      forecast: "2.5%",
      previous: "2.7%",
      countdown: 86400,
      state: "upcoming"
    }
  ]);

  const [newsSearch, setNewsSearch] = useState<string>("");
  const [newsImpactFilter, setNewsImpactFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>("ALL");

  // Voice Narrator States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [narratorRate, setNarratorRate] = useState<number>(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [speakText, setSpeakText] = useState<string>(
    "Welcome to FX Fluent, your premier interactive educational sandbox for Kenya retail traders. Practice high-leverage positions and lot sizing safely with our spot simulator using virtual fund deposits. Unlock structured syllabus courses inside the Academy, consult our real-time AI Trading Mentor, check your financial quotient in the Exam Center, or generate viral short scripts in the Creator Studio!"
  );

  // Populate browser speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Filter out duplicate names if any and sort
        setAvailableVoices(voices);
        const defaultVoice = voices.find(v => v.lang.startsWith("en-") || v.lang.startsWith("en")) || voices[0];
        if (defaultVoice && !selectedVoiceName) {
          setSelectedVoiceName(defaultVoice.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSuccessNotification("⚠️ Your web browser does not support the SpeechSynthesis voice API.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSuccessNotification("🔇 Oral voice presentation silent.");
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakText);
      
      if (selectedVoiceName) {
        const foundVoice = availableVoices.find(v => v.name === selectedVoiceName);
        if (foundVoice) {
          utterance.voice = foundVoice;
        }
      }
      
      utterance.rate = narratorRate;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (e) => {
        console.error("Speech utterance error", e);
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      setSuccessNotification("🔊 Speaking: AI voice is currently summarizing the retail sandbox...");
    }
  };

  // TikTok State & Creator Hub
  const [tiktokVidType, setTiktokVidType] = useState<"profit" | "quiz" | "lesson">("profit");
  const [tiktokMusicTrack, setTiktokMusicTrack] = useState<string>("Forex Market Phonk - Sped Up");
  const [tiktokVoiceStyle, setTiktokVoiceStyle] = useState<string>("Jessie (Siri-like English Pro)");
  const [tiktokHookStyle, setTiktokHookStyle] = useState<string>("shocking");
  const [copiedTiktokScript, setCopiedTiktokScript] = useState<boolean>(false);

  const [fundingTransactions, setFundingTransactions] = useState<Array<{
    id: string;
    method: "mpesa" | "card";
    amountUsd: number;
    amountKes: number;
    phoneOrCard: string;
    timestamp: string;
    status: "SUCCESS" | "FAILED";
    purpose?: "funding" | "exam_fee" | "mentor_license" | "broker_reg" | "class_novice" | "class_standard" | "class_pro" | "class_hedge";
    pkgName?: string;
  }>>([
    {
      id: "MPESA-STK-FTX921",
      method: "mpesa",
      amountUsd: 200,
      amountKes: 26000,
      phoneOrCard: "+254 759 722 562",
      timestamp: new Date(Date.now() - 3600000 * 4).toLocaleString(),
      status: "SUCCESS",
      purpose: "funding",
      pkgName: "Simulator Balance Topup"
    }
  ]);

  // Sandbox simulated trade inputs
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [tradeLotSize, setTradeLotSize] = useState<number>(0.01); // Safe micro lot baseline for beginners
  const [slPips, setSlPips] = useState<number>(20); // 20 pips stop loss
  const [tpPips, setTpPips] = useState<number>(50); // 50 pips take profit

  const getShillingsForPurpose = (purpose: string): number => {
    if (purpose === "class_novice") return 100;
    if (purpose === "class_standard") return 1000;
    if (purpose === "class_pro") return 5000;
    if (purpose === "class_hedge") return 10000;
    if (purpose === "exam_fee") return 25 * 130;
    if (purpose === "mentor_license") return 40 * 130;
    if (purpose === "broker_reg") return 15 * 130;
    if (purpose === "academy_enroll") return 300;
    return paymentAmount * 130;
  };

  const activePair = currencyPairs.find(p => p.symbol === selectedPairSymbol) || currencyPairs[0];

  // Adjust support/resistance default values when selected currency pair changes
  useEffect(() => {
    if (activePair) {
      if (activePair.symbol === "USD/JPY") {
        setSupportLine(155.10);
        setResistanceLine(156.20);
      } else if (activePair.symbol === "EUR/USD") {
        setSupportLine(1.0810);
        setResistanceLine(1.0890);
      } else if (activePair.symbol === "GBP/USD") {
        setSupportLine(1.2580);
        setResistanceLine(1.2700);
      } else if (activePair.symbol === "AUD/USD") {
        setSupportLine(0.6570);
        setResistanceLine(0.6680);
      }
    }
  }, [selectedPairSymbol]);

  // Handle automatic notifications fadeout
  useEffect(() => {
    if (successNotification) {
      const timer = setTimeout(() => {
        setSuccessNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successNotification]);

  // Live market tick ticks simulator (every 2.5 seconds)
  useEffect(() => {
    const marketInterval = setInterval(() => {
      setCurrencyPairs(prevPairs => {
        return prevPairs.map(pair => {
          // Generate realistic random walk based on volatility
          const isUp = Math.random() > 0.48; // slight upward drift for demo feel
          const pipMovementScale = (Math.random() * 0.8 + 0.2) * pair.volatility;
          const change = isUp ? pipMovementScale : -pipMovementScale;
          const newPrice = Number((pair.price + change).toFixed(pair.pipSize === 0.01 ? 3 : 5));

          // Retain historical tick prices (max 30)
          const updatedHistory = [...pair.history.slice(1), newPrice];

          // Update latest candlestick
          const candlesCopy = [...pair.candles];
          const latestCandleIndex = candlesCopy.length - 1;
          
          if (latestCandleIndex >= 0) {
            const currentCandle = candlesCopy[latestCandleIndex];
            // Modify latest candle dynamically
            const newHigh = Math.max(currentCandle.high, newPrice);
            const newLow = Math.min(currentCandle.low, newPrice);
            
            candlesCopy[latestCandleIndex] = {
              ...currentCandle,
              high: newHigh,
              low: newLow,
              close: newPrice
            };
          }

          // Cycle to next candle once in a while (e.g., 8% probability each tick)
          if (Math.random() > 0.92 && candlesCopy.length > 0) {
            const lastCandle = candlesCopy[candlesCopy.length - 1];
            candlesCopy.push({
              open: lastCandle.close,
              high: lastCandle.close,
              low: lastCandle.close,
              close: lastCandle.close,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
            // Keep candles limited to last 15
            if (candlesCopy.length > 15) {
              candlesCopy.shift();
            }
          }

          return {
            ...pair,
            price: newPrice,
            history: updatedHistory,
            candles: candlesCopy,
            trend: change > 0 ? "UP" : "DOWN"
          };
        });
      });
    }, 2500);

    return () => clearInterval(marketInterval);
  }, []);

  // Economic Calendar Countdown Tick and Live releases Simulation
  useEffect(() => {
    const calendarInterval = setInterval(() => {
      setEconomicCalendar(prevEvents => {
        let triggersNotification = false;
        let notificationMsg = "";
        let affectedCurrency: "USD" | "EUR" | "GBP" | "JPY" | null = null;
        let direction: "UP" | "DOWN" = "UP";

        const updatedEvents = prevEvents.map(event => {
          if (event.state === "upcoming" && event.countdown > 0) {
            const nextCountdown = event.countdown - 1;
            let timeLabel = event.time;
            
            if (nextCountdown > 60) {
              timeLabel = `In ${Math.floor(nextCountdown / 60)} mins`;
            } else if (nextCountdown > 0) {
              timeLabel = `In ${nextCountdown} secs`;
            } else {
              timeLabel = "Just released";
            }

            if (nextCountdown === 0) {
              // Trigger Release!
              const isStronger = Math.random() > 0.45;
              let finalActualVal = "";
              
              if (event.event.includes("Retail Sales")) {
                finalActualVal = isStronger ? "0.4%" : "-0.1%";
              } else if (event.event.includes("Statement")) {
                finalActualVal = "4.25% (Unchanged)";
              } else if (event.event.includes("Claims")) {
                finalActualVal = isStronger ? "208K" : "224K";
              } else if (event.event.includes("CPI")) {
                finalActualVal = isStronger ? "2.8%" : "2.4%";
              } else {
                finalActualVal = "Released";
              }

              // Flash a nice alert
              notificationMsg = `🚨 Economic Event Released: ${event.event} actual at ${finalActualVal} vs forecast ${event.forecast}!`;
              triggersNotification = true;
              affectedCurrency = event.currency;
              direction = isStronger ? "UP" : "DOWN";

              // Dynamically inject a news headline matching this
              setNewsFeed(prevNews => [
                {
                  id: `news-released-${Date.now()}`,
                  source: "Financial Times Live",
                  headline: `${event.currency} ${event.event} Released: Actual ${finalActualVal} (Forecast ${event.forecast})`,
                  timestamp: "Just now",
                  impact: event.importance,
                  category: event.event.includes("CPI") ? "inflation" : "central-banks",
                  sentiment: isStronger ? "BULLISH" : "BEARISH",
                  targetCurrency: event.currency,
                  summary: `The vital macroeconomic results for "${event.event}" have crossed the wire at ${finalActualVal}. Initial automated orders are driving instant liquidity moves for ${event.currency} spot positions.`
                },
                ...prevNews
              ]);

              return {
                ...event,
                time: "Just released",
                countdown: 0,
                actual: finalActualVal,
                state: "released"
              };
            }

            return {
              ...event,
              time: timeLabel,
              countdown: nextCountdown
            };
          }
          return event;
        });

        if (triggersNotification && notificationMsg) {
          setSuccessNotification(notificationMsg);
          
          // Apply a price shock to currencyPairs state!
          if (affectedCurrency) {
            const isPairMovingUp = direction === "UP";
            const curAffected = affectedCurrency;
            setCurrencyPairs(prevPairs => {
              return prevPairs.map(curr => {
                const isTargetBase = curr.symbol.startsWith(curAffected);
                const isTargetQuote = curr.symbol.endsWith(curAffected);
                
                if (isTargetBase || isTargetQuote) {
                  // apply sharp 25-45 pip shock
                  const pipsShift = (25 + Math.random() * 20) * curr.pipSize;
                  const factor = isTargetBase ? (isPairMovingUp ? 1 : -1) : (isPairMovingUp ? -1 : 1);
                  const shockChange = pipsShift * factor;
                  const shockedPrice = Number((curr.price + shockChange).toFixed(curr.pipSize === 0.01 ? 3 : 5));

                  return {
                    ...curr,
                    price: shockedPrice,
                    trend: shockChange > 0 ? "UP" : "DOWN",
                    history: [...curr.history.slice(1), shockedPrice]
                  };
                }
                return curr;
              });
            });
          }
        }

        return updatedEvents;
      });
    }, 1000);

    return () => clearInterval(calendarInterval);
  }, []);

  // Dynamic random news spawner interval
  useEffect(() => {
    const newsTemplates = [
      {
        source: "Bloomberg",
        headline: "US Yield Curve Steepens as Long-Term Yields Break Post-Auction Resistance",
        impact: "MEDIUM",
        category: "inflation",
        sentiment: "BEARISH",
        targetCurrency: "USD",
        summary: "Following weak demand in the 10-year treasury note auction, sellers drive long-end yields higher. Rate premium fears maintain USD structural floors against European single currencies."
      },
      {
        source: "Reuters Forex",
        headline: "EURUSD Pulls Back Below 1.0820 After German Consumer Confidence Drops Sharply",
        impact: "HIGH",
        category: "employment",
        sentiment: "BEARISH",
        targetCurrency: "EUR",
        summary: "The GfK forward-looking sentiment index prints at lower brackets, underscoring domestic manufacturing friction and highlighting the divergence in growth parameters."
      },
      {
        source: "FXStreet",
        headline: "BoE Broadens Policy Horizon: Deputy Governor Re-evaluates Supply-Shock Constraints",
        impact: "MEDIUM",
        category: "central-banks",
        sentiment: "NEUTRAL",
        targetCurrency: "GBP",
        summary: "Policymakers stated that while core services metrics are elevated, long-run expectations are firmly anchored inside targets, allowing for structural rate adjustments."
      },
      {
        source: "Sydney News Desk",
        headline: "AUDUSD Ignites 30-Pip Rally Following Higher RBA Trimmed Mean Inflation Read",
        impact: "HIGH",
        category: "inflation",
        sentiment: "BULLISH",
        targetCurrency: "ALL",
        summary: "The Reserve Bank of Australia trimmed mean CPI printed at upper-bound tolerances, causing bond markets to ditch interest rate cut bets for the remainder of the calendar year."
      }
    ];

    const spawner = setInterval(() => {
      const randomTpl = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
      
      setNewsFeed(prevNews => {
        const exists = prevNews.some(n => n.headline === randomTpl.headline);
        if (exists) return prevNews;

        const newItem = {
          id: `rand-news-${Date.now()}`,
          source: randomTpl.source,
          headline: randomTpl.headline,
          timestamp: "Just now",
          impact: randomTpl.impact as "HIGH" | "MEDIUM" | "LOW",
          category: randomTpl.category as "central-banks" | "employment" | "inflation" | "geopolitics" | "technical",
          sentiment: randomTpl.sentiment as "BULLISH" | "BEARISH" | "NEUTRAL",
          targetCurrency: randomTpl.targetCurrency as "USD" | "EUR" | "GBP" | "JPY" | "ALL",
          summary: randomTpl.summary
        };

        return [newItem, ...prevNews.slice(0, 14)];
      });
    }, 45000);

    return () => clearInterval(spawner);
  }, []);

  // Sync open positions profits/losses and trigger automatic Stop-Loss / Take-Profit executions
  useEffect(() => {
    const listModified: Trade[] = [];
    const closedList: Trade[] = [];

    openTrades.forEach(trade => {
      const currentPair = currencyPairs.find(p => p.symbol === trade.pair);
      if (!currentPair) {
        listModified.push(trade);
        return;
      }

      const activePrice = currentPair.price;
      const profitCalculated = calculateTradeProfit(
        trade.type,
        trade.openPrice,
        activePrice,
        currentPair.pipSize,
        trade.lotSize,
        trade.pair
      );

      // Check auto liquidation protectors
      let triggerClose = false;
      let closeReason = "";
      let liquidationPrice = activePrice;

      if (trade.type === "BUY") {
        if (trade.stopLoss && activePrice <= trade.stopLoss) {
          triggerClose = true;
          closeReason = `🔴 Stop Loss hit at ${trade.stopLoss}! Capital guarded as planned.`;
          liquidationPrice = trade.stopLoss;
        } else if (trade.takeProfit && activePrice >= trade.takeProfit) {
          triggerClose = true;
          closeReason = `🟢 Take Profit reached at ${trade.takeProfit}! Profits captured successfully.`;
          liquidationPrice = trade.takeProfit;
        }
      } else { // SELL position
        if (trade.stopLoss && activePrice >= trade.stopLoss) {
          triggerClose = true;
          closeReason = `🔴 Stop Loss hit at ${trade.stopLoss}! Capital guarded as planned.`;
          liquidationPrice = trade.stopLoss;
        } else if (trade.takeProfit && activePrice <= trade.takeProfit) {
          triggerClose = true;
          closeReason = `🟢 Take Profit reached at ${trade.takeProfit}! Profits captured successfully.`;
          liquidationPrice = trade.takeProfit;
        }
      }

      if (triggerClose) {
        const finalProfit = calculateTradeProfit(
          trade.type,
          trade.openPrice,
          liquidationPrice,
          currentPair.pipSize,
          trade.lotSize,
          trade.pair
        );

        setBalance(prevBalance => prevBalance + finalProfit);
        closedList.push({
          ...trade,
          profit: finalProfit,
          isOpen: false,
          closePrice: liquidationPrice,
        });
        setSuccessNotification(`${trade.pair} ${trade.type} position liquidated: ${closeReason} Profit: $${finalProfit.toFixed(2)}`);
      } else {
        listModified.push({
          ...trade,
          profit: profitCalculated
        });
      }
    });

    if (closedList.length > 0) {
      setOpenTrades(listModified);
      setClosedTrades(prevClosed => [...closedList, ...prevClosed]);
    } else {
      // Periodic synchronization without liquidations
      const hasChangedProfs = openTrades.some(trade => {
        const matchingPair = currencyPairs.find(p => p.symbol === trade.pair);
        if (!matchingPair) return false;
        const currentProf = calculateTradeProfit(
          trade.type,
          trade.openPrice,
          matchingPair.price,
          matchingPair.pipSize,
          trade.lotSize,
          trade.pair
        );
        return Math.abs(currentProf - trade.profit) > 0.01;
      });

      if (hasChangedProfs) {
        setOpenTrades(prev => prev.map(t => {
          const matchingPair = currencyPairs.find(p => p.symbol === t.pair);
          if (!matchingPair) return t;
          return {
            ...t,
            profit: calculateTradeProfit(
              t.type,
              t.openPrice,
              matchingPair.price,
              matchingPair.pipSize,
              t.lotSize,
              t.pair
            )
          };
        }));
      }
    }
  }, [currencyPairs]);

  // Trigger custom preset AI tutoring question
  const askTutorPreset = (text: string) => {
    setTutorInput(text);
    triggerTutorQuery(text);
  };

  // Submit AI Tutor Chat Query
  const triggerTutorQuery = async (overrideText?: string) => {
    const question = (overrideText || tutorInput).trim();
    if (!question) return;

    // Append user message
    const updatedMessages = [...tutorMessages, { role: "user" as const, text: question }];
    setTutorMessages(updatedMessages);
    setTutorInput("");
    setTutorLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await response.json();
      
      setTutorMessages(prev => [...prev, { 
        role: "model", 
        text: data.text,
        isOffline: data.isOffline 
      }]);
    } catch (e) {
      console.error(e);
      setTutorMessages(prev => [...prev, { 
        role: "model", 
        text: "⚡ **Connection Error:** I was unable to connect to the server. Don't worry, you can always learn essential Forex math using the calculators and academies directly!" 
      }]);
    } finally {
      setTutorLoading(false);
    }
  };

  // Generate Interactive AI Quiz
  const handleLoadQuiz = async (category: string) => {
    setActiveQuizCategory(category);
    setQuizLoading(true);
    setCurrentQuizIndex(0);
    setSelectedAnswerIndex(null);
    setQuizAnswered(false);
    setQuizCompleted(false);
    setQuizScore(0);
    setQuizFeedbackMessage(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category })
      });
      const data = await response.json();
      if (data && data.quiz) {
        setQuizQuestions(data.quiz);
        if (data.isOffline) {
          setQuizFeedbackMessage("Loaded standard offline tests for your syllabus modules!");
        }
      } else {
        throw new Error("Invalid responses structure");
      }
    } catch (err) {
      console.error(err);
      setQuizFeedbackMessage("Failed to retrieve fresh AI exam sheets. Try reloading.");
    } finally {
      setQuizLoading(false);
    }
  };

  // Load baseline quiz on start
  useEffect(() => {
    handleLoadQuiz("basics");
  }, []);

  const handleSelectAnswer = (index: number) => {
    if (quizAnswered) return;
    setSelectedAnswerIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex === null || quizAnswered) return;
    setQuizAnswered(true);
    const correct = selectedAnswerIndex === quizQuestions[currentQuizIndex].correctIndex;
    if (correct) {
      setQuizScore(p => p + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(p => p + 1);
      setSelectedAnswerIndex(null);
      setQuizAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  // Place Interactive Simulated Position
  const handlePlaceTrade = () => {
    if (balance <= 10) {
      setSuccessNotification("❌ Insufficient Funds of capital. Restart the account below to practice!");
      return;
    }

    const price = activePair.price;
    const isYen = activePair.symbol === "USD/JPY";
    
    // Calculate protective numerical Stop Loss and Take Profits values
    const slPipsDelta = slPips * activePair.pipSize;
    const tpPipsDelta = tpPips * activePair.pipSize;

    const stopLossValue = tradeType === "BUY" ? price - slPipsDelta : price + slPipsDelta;
    const takeProfitValue = tradeType === "BUY" ? price + tpPipsDelta : price - tpPipsDelta;

    // Calculate required margin
    const unitsBase = tradeLotSize * 100000;
    // For standard display purposes, standard currency unit margin
    const requiredMargin = (unitsBase * (activePair.symbol.startsWith("USD") ? 1 : price)) / leverage;

    if (requiredMargin > balance) {
      setSuccessNotification("❌ Trade size exceeds your available Margin limit under this leverage!");
      return;
    }

    const newTrade: Trade = {
      id: Math.random().toString(36).substring(4),
      pair: activePair.symbol,
      type: tradeType,
      openPrice: price,
      lotSize: tradeLotSize,
      stopLoss: Number(stopLossValue.toFixed(isYen ? 3 : 5)),
      takeProfit: Number(takeProfitValue.toFixed(isYen ? 3 : 5)),
      profit: 0,
      isOpen: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOpenTrades(prev => [newTrade, ...prev]);
    setSuccessNotification(`🚀 Position opened: ${tradeType} ${tradeLotSize} lots of ${activePair.symbol} at ${price}`);
  };

  // Close Simulated Position manually
  const handleCloseTradeManually = (trade: Trade) => {
    const pairMeta = currencyPairs.find(p => p.symbol === trade.pair) || activePair;
    const finalProfit = calculateTradeProfit(
      trade.type,
      trade.openPrice,
      pairMeta.price,
      pairMeta.pipSize,
      trade.lotSize,
      trade.pair
    );

    setBalance(prev => prev + finalProfit);
    setOpenTrades(prev => prev.filter(t => t.id !== trade.id));
    setClosedTrades(prev => [
      {
        ...trade,
        isOpen: false,
        closePrice: pairMeta.price,
        profit: finalProfit
      },
      ...prev
    ]);
    setSuccessNotification(`🔒 Closed ${trade.pair} position manually at ${pairMeta.price}. Profit: $${finalProfit.toFixed(2)}`);
  };

  // Reset simulated capital bankroll
  const handleResetCapital = () => {
    setBalance(10000);
    setOpenTrades([]);
    setClosedTrades([]);
    setSuccessNotification("🧹 Educational Account reset. Recalibrated starting funds to $10,000.00!");
  };

  // Payments & deposit management controls (M-Pesa Express & Secure Card Simulation)
  const handleInitiatePayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setStkErrorMessage("Please enter a valid transfer amount greater than 0");
      setPaymentStep("error");
      return;
    }

    if (paymentMethod === "mpesa") {
      if (!paymentPhone || paymentPhone.trim() === "") {
        setStkErrorMessage("Please specify a target phone number for the Mobile Money transfer");
        setPaymentStep("error");
        return;
      }
      setPaymentStep("stk_pending");
      setStkErrorMessage("");
      // Simulate Safaricom Daraja API STK Push delay (1.2 seconds)
      setTimeout(() => {
        setPaymentStep("pin_verification");
      }, 1200);
    } else {
      // Secure Credit Card Proxy Flow
      if (!cardNumber || !cardName) {
        setStkErrorMessage("Please provide valid Card credentials (card number, cardholder name, expiry, cvv)");
        setPaymentStep("error");
        return;
      }
      setPaymentStep("processing");
      setTimeout(() => {
        const txId = "CARD-PG-" + Math.random().toString(36).substring(3, 9).toUpperCase();
        const amtKes = paymentAmount * 130; // 130 KES exchange standard
        const pkgNames = {
          funding: "Simulator Balance Funding",
          exam_fee: "Certification Exam Registration Fee",
          mentor_license: "AI Trading Mentor Premium License Fee",
          broker_reg: "Broker Compliance Registration Fee",
          class_novice: "Micro/Novice Class of Trade License",
          class_standard: "Standard Retail Class of Trade License",
          class_pro: "Professional/VIP Class of Trade License",
          class_hedge: "Elite Institutional Hedge Class License",
          academy_enroll: "Academy Course Enrollment Fee"
        };
        const currentPkgName = pkgNames[paymentPurpose];

        const newTx = {
          id: txId,
          method: "card" as const,
          amountUsd: paymentAmount,
          amountKes: amtKes,
          phoneOrCard: `Card **** **** **** ${cardNumber.slice(-4) || "4111"}`,
          timestamp: new Date().toLocaleString(),
          status: "SUCCESS" as const,
          purpose: paymentPurpose,
          pkgName: currentPkgName
        };

        if (paymentPurpose === "funding") {
          setBalance(prev => prev + paymentAmount);
          setSuccessNotification(`💳 $${paymentAmount.toFixed(2)} deposit credited to your account via Secure Debit Card!`);
        } else {
          if (paymentPurpose === "exam_fee") {
            setIsExamRegistered(true);
            setSuccessNotification(`🎓 Registered for Certification Exam! Official credentials unlocked inside Exam Center.`);
          } else if (paymentPurpose === "mentor_license") {
            setIsMentorLicensed(true);
            setSuccessNotification(`🌟 AI Mentor Premium License activated! Supercharged Coaching mode online.`);
          } else if (paymentPurpose === "broker_reg") {
            setIsBrokerLicensed(true);
            setSuccessNotification(`🚀 Demonstration Account compliance registration cleared. Live broker integration ready!`);
          } else if (paymentPurpose === "academy_enroll") {
            setIsAcademyRegistered(true);
            setSuccessNotification(`🎓 Kenya Retail Sandbox Academy & Course Syllabus successfully registered and unlocked!`);
          } else if (paymentPurpose === "class_novice") {
            setIsNoviceRegistered(true);
            setSuccessNotification(`🌱 Micro/Novice Class of Trade registered! Micro cent-sizing credentials unlocked.`);
          } else if (paymentPurpose === "class_standard") {
            setIsStandardRegistered(true);
            setSuccessNotification(`📈 Standard Retail Class of Trade registered! Standard lot size and major pair metrics online.`);
          } else if (paymentPurpose === "class_pro") {
            setIsProRegistered(true);
            setSuccessNotification(`🔥 Professional VIP Class of Trade registered! Custom exotic spreads and deep heuristics active.`);
          } else if (paymentPurpose === "class_hedge") {
            setIsHedgeRegistered(true);
            setSuccessNotification(`🏛️ Elite Institutional Hedge Class of Trade registered! Zero-latency order execution active.`);
          }
        }

        setFundingTransactions(prev => [newTx, ...prev]);
        setPaymentStep("success");
      }, 1800);
    }
  };

  const handleVerifyMpesaPin = () => {
    if (!simulatedPin || simulatedPin.length < 4) {
      setPinError("Mobile payment requirements specify a standard 4-digit device approval PIN.");
      return;
    }

    setPinError(null);
    setPaymentStep("processing");

    setTimeout(() => {
      const txId = "MPESA-STK-" + Math.random().toString(36).substring(3, 9).toUpperCase();
      const amtKes = paymentAmount * 130; // 130 KES exchange standard
      const pkgNames = {
        funding: "Simulator Balance Funding",
        exam_fee: "Certification Exam Registration Fee",
        mentor_license: "AI Trading Mentor Premium License Fee",
        broker_reg: "Broker Compliance Registration Fee",
        class_novice: "Micro/Novice Class of Trade License",
        class_standard: "Standard Retail Class of Trade License",
        class_pro: "Professional/VIP Class of Trade License",
        class_hedge: "Elite Institutional Hedge Class License",
        academy_enroll: "Academy Course Enrollment Fee"
      };
      const currentPkgName = pkgNames[paymentPurpose];

      const newTx = {
        id: txId,
        method: "mpesa" as const,
        amountUsd: paymentAmount,
        amountKes: amtKes,
        phoneOrCard: `+${paymentPhone}`,
        timestamp: new Date().toLocaleString(),
        status: "SUCCESS" as const,
        purpose: paymentPurpose,
        pkgName: currentPkgName
      };

      if (paymentPurpose === "funding") {
        setBalance(prev => prev + paymentAmount);
        setSuccessNotification(`🔥 Mobile Money transfer of KSh ${amtKes.toLocaleString()} ($${paymentAmount.toFixed(2)}) processed! Account Funded!`);
      } else {
        if (paymentPurpose === "exam_fee") {
          setIsExamRegistered(true);
          setSuccessNotification(`🎓 Registered for Certification Exam! Official credentials unlocked inside Exam Center.`);
        } else if (paymentPurpose === "mentor_license") {
          setIsMentorLicensed(true);
          setSuccessNotification(`🌟 AI Mentor Premium License activated! Supercharged Coaching mode online.`);
        } else if (paymentPurpose === "broker_reg") {
          setIsBrokerLicensed(true);
          setSuccessNotification(`🚀 Demonstration Account compliance registration cleared. Live broker integration ready!`);
        } else if (paymentPurpose === "academy_enroll") {
          setIsAcademyRegistered(true);
          setSuccessNotification(`🎓 Kenya Retail Sandbox Academy & Course Syllabus successfully registered and unlocked!`);
        } else if (paymentPurpose === "class_novice") {
          setIsNoviceRegistered(true);
          setSuccessNotification(`🌱 Micro/Novice Class of Trade registered! Micro cent-sizing credentials unlocked.`);
        } else if (paymentPurpose === "class_standard") {
          setIsStandardRegistered(true);
          setSuccessNotification(`📈 Standard Retail Class of Trade registered! Standard lot size and major pair metrics online.`);
        } else if (paymentPurpose === "class_pro") {
          setIsProRegistered(true);
          setSuccessNotification(`🔥 Professional VIP Class of Trade registered! Custom exotic spreads and deep heuristics active.`);
        } else if (paymentPurpose === "class_hedge") {
          setIsHedgeRegistered(true);
          setSuccessNotification(`🏛️ Elite Institutional Hedge Class of Trade registered! Zero-latency order execution active.`);
        }
      }

      setFundingTransactions(prev => [newTx, ...prev]);
      setPaymentStep("success");
    }, 1500);
  };

  const handleResetPaymentPortal = () => {
    setPaymentStep("idle");
    setSimulatedPin("");
    setPinError(null);
    setStkErrorMessage("");
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isEditing = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA";
      
      // Escape key to close the shortcuts sheet
      if (e.key === "Escape") {
        if (showShortcutsModal) {
          e.preventDefault();
          setShowShortcutsModal(false);
          return;
        }
      }

      // If typing in textbox/input, ignore simple shortcuts
      if (isEditing && !e.altKey && !e.ctrlKey && !e.metaKey) {
        return;
      }

      // '?' key toggles cheatsheet modal if not focusing input
      if (e.key === "?" && !isEditing) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // Modifier Alt is required for other shortcut keys
      if (!e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "d":
          e.preventDefault();
          setActiveTab("dashboard");
          setSuccessNotification("Switched to Home Dashboard (Alt + D)");
          break;
        case "1":
          e.preventDefault();
          setActiveTab("academy");
          setSuccessNotification("Switched to Academy Modules (Alt + 1)");
          break;
        case "2":
          e.preventDefault();
          setActiveTab("simulator");
          setSuccessNotification("Switched to Live Market Sandbox (Alt + 2)");
          break;
        case "3":
          e.preventDefault();
          setActiveTab("tutor");
          setSuccessNotification("Switched to AI Trading Mentor (Alt + 3)");
          break;
        case "4":
          e.preventDefault();
          setActiveTab("quiz");
          setSuccessNotification("Switched to Interactive Exams (Alt + 4)");
          break;
        case "5":
          e.preventDefault();
          setActiveTab("payments");
          setSuccessNotification("Switched to Payments Terminal (Alt + 5)");
          break;
        case "6":
          e.preventDefault();
          setActiveTab("news");
          setSuccessNotification("Switched to News Terminal & Economic Calendar (Alt + 6)");
          break;
        case "b":
          e.preventDefault();
          setTradeType("BUY");
          setSuccessNotification("Selected BUY order type (Alt + B)");
          if (activeTab !== "simulator") {
            setActiveTab("simulator");
          }
          break;
        case "s":
          e.preventDefault();
          setTradeType("SELL");
          setSuccessNotification("Selected SELL order type (Alt + S)");
          if (activeTab !== "simulator") {
            setActiveTab("simulator");
          }
          break;
        case "p":
          e.preventDefault();
          setActiveTab("simulator");
          handlePlaceTrade();
          break;
        case "c":
          e.preventDefault();
          if (openTrades.length > 0) {
            handleCloseTradeManually(openTrades[0]);
          } else {
            setSuccessNotification("No active running positions to close (Alt + C)");
          }
          break;
        case "k":
          e.preventDefault();
          setShowShortcutsModal(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openTrades, activeTab, activePair, tradeType, tradeLotSize, leverage, slPips, tpPips, balance, currencyPairs, showShortcutsModal]);

  const renderGateWall = (featureTitle: string, explanation: string) => {
    return (
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-6 animate-fadeIn shadow-2xl relative overflow-hidden w-full" id="academy-paywall-gate">
        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 bg-pink-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-72 h-72 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-5 animate-pulse">
          <BookOpen className="w-7 h-7 text-pink-400" />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 font-bold">Enrollment Gated</span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
        </div>

        <h3 className="text-xl font-black text-white tracking-tight">
          🔒 {featureTitle} Requires Admission Registration
        </h3>
        
        <p className="text-xs text-slate-300 max-w-md mt-3 leading-relaxed">
          {explanation} Complete your enrollment and unlock the verified Kenya Sandbox Retail Curriculum syllabus, live interactive lessons, exam questions, and official certification assets.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-6 bg-white/2 p-4 rounded-2xl border border-white/5 text-left">
          <div className="flex flex-col justify-center">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#94a3b8] font-bold">Registration Fee</span>
            <span className="text-3xl font-black text-pink-400 font-mono mt-1">KSh 300</span>
            <span className="text-[9px] text-[#556987] mt-0.5">Auto-exchange ~$2.31 USD</span>
          </div>

          <div className="border-l border-white/10 pl-4 flex flex-col justify-center gap-1.5 text-[10px] text-[#a8b2ca] font-semibold">
            <span className="flex items-center gap-1.5">✓ Full Academy Syllabus</span>
            <span className="flex items-center gap-1.5">✓ Live AI Interactive Mentor</span>
            <span className="flex items-center gap-1.5">✓ Compliance Exam & Quizzes</span>
          </div>
        </div>

        <div className="w-full max-w-md mt-6 space-y-3.5">
          <div className="space-y-1.5 text-left font-mono">
            <label className="block text:[10px] uppercase font-bold text-[#94a3b8] tracking-widest text-[9px] leading-tight">
              📱 Operator M-Pesa Mobile Line
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-emerald-400 font-bold text-xs">+</span>
              <input 
                type="text"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl py-2.5 pl-6 pr-3.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50 font-bold"
                placeholder="2547XXXXXXXX"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setPaymentPurpose("academy_enroll");
              setPaymentAmount(2.31);
              setPaymentMethod("mpesa");
              setActiveTab("payments");
              setTimeout(() => {
                handleInitiatePayment();
              }, 120);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3.5 rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-emerald-500/15 border border-emerald-400"
          >
            <span>Simulate M-Pesa STK Push Transfer</span>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setPaymentPurpose("academy_enroll");
              setPaymentAmount(2.31);
              setPaymentMethod("card");
              setActiveTab("payments");
            }}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>💳 Pay via Credit / Debit Card instead</span>
          </button>
        </div>
      </div>
    );
  };

  // Mathematical insights for required margin
  const activePairIsUSDExposed = activePair.symbol.startsWith("USD");
  const lotUnitEquivalent = tradeLotSize * 100000;
  const currentEstPipEarn = tradeLotSize * 10; // Approx standard value is $10/pip for standard, $1 for mini, $0.1 for micro
  const estMarginNeeded = (lotUnitEquivalent * (activePairIsUSDExposed ? 1 : activePair.price)) / leverage;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans relative overflow-x-hidden flex flex-col selection:bg-blue-500/30 selection:text-white">
      {/* Absolute ambient lights glowing backdrops matching Frosted Glass Theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[45%] h-[45%] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 flex-grow flex flex-col gap-6" id="root-container">
        
        {/* Header / Nav Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 text-white" id="brand-logo">
              FX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">FX Fluent</span>
                {isHedgeRegistered ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">🏛️ Hedge Club Class</span>
                ) : isProRegistered ? (
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">🔥 VIP Pro Class</span>
                ) : isStandardRegistered ? (
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">📈 Standard Retail</span>
                ) : isNoviceRegistered ? (
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">🌱 Micro Novice Class</span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2.5 py-0.5 rounded-full">Starter Hub</span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Master currency pairs, margins & technical risk management interactively.</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-slate-400">NY Sess:</span>
              <span className="font-semibold text-green-300">Active</span>
            </div>
            
            <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
              <span className="text-slate-400">Sim Capital:</span>
              <span className={`font-bold ${balance >= 10000 ? "text-green-400" : "text-amber-400"}`}>
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button 
                onClick={handleResetCapital} 
                className="text-slate-400 hover:text-white ml-1.5 hover:rotate-180 duration-500"
                title="Reset simulation account stats & history"
                id="reset-simulation-stats"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
              <span className="text-slate-400">Position Margin:</span>
              <span className="font-semibold text-blue-300">
                {openTrades.length} Active ({openTrades.filter(t => t.profit >= 0).length} Green)
              </span>
            </div>

            {/* Quick Share Link Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLinkDropdown(prev => !prev)}
                className={`bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md text-blue-300 hover:text-white transition duration-200 cursor-pointer active:scale-95 shrink-0 ${showLinkDropdown ? "ring-2 ring-blue-400/30" : ""}`}
                title="Find & share short app link"
                id="share-app-link-badge"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Get Short Link</span>
              </button>
              
              {showLinkDropdown && (
                <div className="absolute right-0 mt-2.5 w-72 bg-slate-900/95 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-50 text-left space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono">⚡ Share FX Fluent</span>
                    <button 
                      onClick={() => setShowLinkDropdown(false)}
                      className="text-slate-500 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400">Shortened address to find this platform:</div>
                    <div className="flex gap-1.5 items-center bg-black/40 border border-white/5 p-2 rounded-xl text-xs font-mono select-all text-slate-200 relative group overflow-hidden">
                      <span className="truncate flex-grow text-[11px]">fx-fluent.app</span>
                      <button
                        onClick={async () => {
                          try {
                            const shortLink = `${window.location.origin}${window.location.pathname}`;
                            await navigator.clipboard.writeText(shortLink);
                            setCopiedLink(true);
                            setSuccessNotification("📋 Copied platform address to clipboard!");
                            setTimeout(() => setCopiedLink(false), 2000);
                          } catch (err) {
                            console.error("Failed to copy", err);
                          }
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg shrink-0 transition cursor-pointer"
                        title="Copy direct address"
                        id="copy-short-address-btn"
                      >
                        {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 bg-white/2 p-2.5 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-relaxed">
                    <div className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                      <Link className="w-3 h-3 text-emerald-400" /> Full Live Access Code Link:
                    </div>
                    <p className="line-clamp-2 break-all font-mono text-[9px] text-slate-500">
                      {typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "https://fx-fluent.app"}
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "https://fx-fluent.app");
                          setCopiedLink(true);
                          setSuccessNotification("📋 Full browser sandbox link copied!");
                          setTimeout(() => setCopiedLink(false), 2000);
                        } catch (err) {
                          console.error("Failed to copy", err);
                        }
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold block mt-1.5 transition underline cursor-pointer text-left"
                    >
                      Copy Full Iframe Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleToggleSpeak}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md transition duration-200 cursor-pointer active:scale-95 shrink-0 border ${isSpeaking ? "bg-[#f472b6]/20 border-[#f472b6]/40 text-white font-extrabold animate-pulse ring-1 ring-[#f472b6]/25" : "bg-white/5 border-white/10 hover:bg-white/15 text-slate-300 hover:text-white"}`}
              title="AI Platform Voice Tour - Listen to audio speech walkthrough"
              id="voice-speech-narrator-trigger"
            >
              {isSpeaking ? <Volume2 className="w-3.5 h-3.5 text-pink-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isSpeaking ? "Mute Guide" : "Play Voice Tour 🎙️"}</span>
            </button>

            <button
              onClick={() => setShowShortcutsModal(true)}
              className="bg-white/5 border border-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md text-slate-300 hover:text-white transition duration-200 cursor-pointer active:scale-95 shrink-0"
              title="View Keyboard Shortcuts (or press Option / Alt + K, or ?)"
              id="keyboard-shortcuts-trigger"
            >
              <Keyboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Shortcuts <kbd className="hidden sm:inline-block bg-white/15 px-1 py-0.5 rounded text-[9px] ml-0.5 font-mono">Alt+K</kbd></span>
            </button>
          </div>
        </header>

        {/* Global Success Banner alerts */}
        {successNotification && (
          <div className="bg-blue-500/10 border border-blue-500/20 backdrop-blur-lg px-4 py-3 rounded-2xl flex items-center justify-between text-sm text-blue-300 transition-all duration-300 animate-fadeIn" id="notification-banner">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
              <span>{successNotification}</span>
            </div>
            <button onClick={() => setSuccessNotification(null)} className="text-slate-400 hover:text-white p-1" id="close-notification">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl" id="navigation-tabs">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs transition-all duration-300 relative ${activeTab === "dashboard" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/2"}`}
            id="tab-dashboard"
          >
            <LayoutDashboard className="w-4 h-4 text-pink-400" />
            <span>Dashboard</span>
            <kbd className="hidden lg:inline-block bg-white/5 px-1 rounded text-[9px] text-slate-400 font-mono font-medium border border-white/5">Alt+D</kbd>
          </button>

          <button 
            onClick={() => setActiveTab("academy")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs transition-all duration-300 ${activeTab === "academy" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/2"}`}
            id="tab-academy"
          >
            <BookOpen className="w-4 h-4" />
            <span>Academy</span>
            <kbd className="hidden lg:inline-block bg-white/5 px-1 rounded text-[9px] text-slate-400 font-mono font-medium border border-white/5">Alt+1</kbd>
          </button>
          
          <button 
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs transition-all duration-300 relative ${activeTab === "simulator" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/2"}`}
            id="tab-simulator"
          >
            <LineChart className="w-4 h-4" />
            <span>Sandbox Simulator</span>
            <kbd className="hidden lg:inline-block bg-white/5 px-1 rounded text-[9px] text-slate-400 font-mono font-medium border border-white/5">Alt+2</kbd>
            {openTrades.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {openTrades.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab("tutor")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs transition-all duration-300 ${activeTab === "tutor" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/2"}`}
            id="tab-tutor"
          >
            <MessageSquare className="w-4 h-4 animate-pulse" />
            <span>AI Mentor</span>
            <kbd className="hidden lg:inline-block bg-white/5 px-1 rounded text-[9px] text-slate-400 font-mono font-medium border border-white/5">Alt+3</kbd>
          </button>
 
          <button 
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs transition-all duration-300 ${activeTab === "quiz" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/2"}`}
            id="tab-quiz"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Exam Center</span>
            <kbd className="hidden lg:inline-block bg-white/5 px-1 rounded text-[9px] text-slate-400 font-mono font-medium border border-white/5">Alt+4</kbd>
          </button>
 
          <button 
            onClick={() => setActiveTab("payments")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs transition-all duration-300 ${activeTab === "payments" ? "bg-white/10 text-white shadow-md border border-white/15 animate-none" : "text-slate-400 hover:text-white hover:bg-white/2"}`}
            id="tab-payments"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Payments & Fees</span>
            <kbd className="hidden lg:inline-block bg-white/5 px-1 rounded text-[9px] text-slate-450 font-mono font-medium border border-white/5">Alt+5</kbd>
          </button>
 
          <button 
            onClick={() => setActiveTab("news")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs transition-all duration-300 relative ${activeTab === "news" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/2"}`}
            id="tab-news"
          >
            <Newspaper className="w-4 h-4 text-amber-400" />
            <span>Live News & Calendar</span>
            <kbd className="hidden lg:inline-block bg-white/5 px-1 rounded text-[9px] text-slate-455 font-mono font-medium border border-white/5">Alt+6</kbd>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500">
              <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75"></span>
            </span>
          </button>
        </div>

        {/* Content View Routing */}
        
        {/* VIEW 0: HOME PORTFOLIO & LEARNING DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fadeIn" id="portfolio-dashboard-view">
            {/* Elegant Header Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-[-40%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="absolute bottom-[-30%] left-[-10%] w-[350px] h-[350px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#a8b2ca] font-semibold">Interactive Academy Platform</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Welcome back, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">benedictkaloki5@gmail.com</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Track your retail simulation performance, study global currency dynamics, and manage risk parameters. Toggle through core modules below or execute live test simulator limits.
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 bg-white/5 border border-white/10 px-4 py-3.5 rounded-xl backdrop-blur-md">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Current Class Tier</div>
                  {isHedgeRegistered ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🏛️</span>
                      <span className="text-xs font-bold text-emerald-400">Hedge Club Elite</span>
                    </div>
                  ) : isProRegistered ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🔥</span>
                      <span className="text-xs font-bold text-indigo-400">VIP Pro Trader</span>
                    </div>
                  ) : isStandardRegistered ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📈</span>
                      <span className="text-xs font-bold text-blue-400">Standard Retail Client</span>
                    </div>
                  ) : isNoviceRegistered ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🌱</span>
                      <span className="text-xs font-bold text-amber-400">Micro Novice Class</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🔑</span>
                      <span className="text-xs font-bold text-slate-400">Starter Level</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setActiveTab("payments")}
                    className="text-[9px] text-[#a8b2ca] hover:text-white underline mt-1 transition"
                  >
                    Upgrade trading limits
                  </button>
                </div>
              </div>
            </div>

            {/* AI Oral Presenter & Platform Tour Guide Widget */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl animate-fadeIn" id="audio-walkthrough-guide-card">
              <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between relative z-10 w-full text-left">
                
                {/* Left side: branding, details, equalizer */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 font-bold">Auditory Tour Module</span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-pink-500/10 rounded-2xl border border-pink-500/20 shrink-0">
                      <Megaphone className="w-5.5 h-5.5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                        <span>🎙️ Live Platform Audio Speaker Guide</span>
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-1 max-w-xl leading-relaxed">
                        Hear our conversational AI Voice Narrator read out a detailed walkthrough summarizing the entire Kenya Retail Sandbox education layout, trade simulation logs, and active compliance features. Customize the speech outline text below to try individual speech combinations!
                      </p>
                    </div>
                  </div>

                  {/* Audio wave simulation visualizer bars */}
                  {isSpeaking && (
                    <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-4 animate-pulse">
                      <div className="text-[9px] font-mono text-[#a8b2ca] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Voice Audio Out stream actively routing...
                      </div>
                      <div className="flex items-end gap-1 h-4 overflow-hidden">
                        <span className="w-1 bg-[#f472b6] rounded h-3 animate-[pulse_0.8s_infinite]"></span>
                        <span className="w-1 bg-[#a78bfa] rounded h-4 animate-[pulse_1.1s_infinite_0.1s]"></span>
                        <span className="w-1 bg-[#60a5fa] rounded h-1.5 animate-[pulse_0.6s_infinite_0.2s]"></span>
                        <span className="w-1 bg-[#34d399] rounded h-3.5 animate-[pulse_1.3s_infinite_0.1s]"></span>
                        <span className="w-1 bg-[#f472b6] rounded h-2 animate-[pulse_0.7s_infinite_0.3s]"></span>
                        <span className="w-1 bg-[#60a5fa] rounded h-3 animate-[pulse_0.9s_infinite_0.2s]"></span>
                        <span className="w-1 bg-[#34d399] rounded h-2.5 animate-[pulse_1.1s_infinite_0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Custom controls dropdowns */}
                <div className="w-full lg:w-auto min-w-[340px] bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-3 shrink-0">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                      Narrator Script (Editable Text Segment)
                    </label>
                    <textarea
                      value={speakText}
                      onChange={(e) => {
                        setSpeakText(e.target.value);
                        if (isSpeaking && typeof window !== "undefined" && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        }
                      }}
                      className="w-full h-[65px] bg-[#030712] border border-white/10 rounded-lg p-2 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:border-pink-500/50"
                      placeholder="Type whatever you'd like the AI to say..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Voice Select */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Select Voice</span>
                      <select
                        value={selectedVoiceName}
                        onChange={(e) => {
                          setSelectedVoiceName(e.target.value);
                          if (isSpeaking && typeof window !== "undefined" && window.speechSynthesis) {
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                          }
                        }}
                        className="bg-[#030712] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-semibold focus:outline-none focus:border-pink-500/50"
                      >
                        {availableVoices.length > 0 ? (
                          availableVoices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name.replace("Google", "").trim()} ({voice.lang})
                            </option>
                          ))
                        ) : (
                          <option value="">Default browser speaker</option>
                        )}
                      </select>
                    </div>

                    {/* Speed/Rate adjustment */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Rate Pitch Speed</span>
                      <div className="flex items-center gap-1.5 py-1">
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={narratorRate}
                          onChange={(e) => {
                            setNarratorRate(parseFloat(e.target.value));
                            if (isSpeaking && typeof window !== "undefined" && window.speechSynthesis) {
                              window.speechSynthesis.cancel();
                              setIsSpeaking(false);
                            }
                          }}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                        <span className="text-[10px] font-mono text-pink-300 font-bold justify-end min-w-[28px] text-right">
                          {narratorRate.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1.5">
                    <button
                      onClick={handleToggleSpeak}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer border ${isSpeaking ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15" : "bg-gradient-to-r from-pink-500 to-indigo-500 border border-pink-400 hover:opacity-95 text-white shadow-md shadow-pink-500/10"}`}
                      id="speech-desk-play-btn"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-spin" />
                          <span>Stop Presentation</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Trigger Oral Playback</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSpeakText("Welcome to FX Fluent, your premier interactive educational sandbox for Kenya retail traders. Practice high-leverage positions and lot sizing safely with our spot simulator using virtual fund deposits. Unlock structured syllabus courses inside the Academy, consult our real-time AI Trading Mentor, check your financial quotient in the Exam Center, or generate viral short scripts in the Creator Studio!");
                        if (isSpeaking && typeof window !== "undefined" && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        }
                        setSuccessNotification("🔄 Restored sample walkthrough script outline.");
                      }}
                      className="px-3 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                      title="Restore original text"
                      id="speech-desk-reset-btn"
                    >
                      Reset
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Bento Stats & Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Stat 1: Demu Funds & Equity details */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition duration-300 group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7e8c9f]">Demo Balance</span>
                    <h3 className="text-2xl font-black text-white mt-1 group-hover:text-amber-400 transition-colors">
                      ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 group-hover:scale-110 transition duration-300">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-450 text-slate-400">
                  <span>Demo Equity</span>
                  <span className="font-mono text-white font-bold">
                    ${(balance + openTrades.reduce((acc, trade) => {
                      const livePair = currencyPairs.find(p => p.symbol.replace("/", "") === trade.symbol.replace("/", ""));
                      if (!livePair) return acc + trade.profit;
                      const currentDiff = trade.type === "BUY" ? livePair.price - trade.entryPrice : trade.entryPrice - livePair.price;
                      const pips = currentDiff / livePair.pipSize;
                      const standardPipVal = trade.lotSize * 10;
                      return acc + Number((pips * standardPipVal).toFixed(2));
                    }, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Stat 2: Active Positions with Running Profits */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition duration-300 group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7e8c9f]">Active Positions</span>
                    <h3 className="text-2xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors">
                      {openTrades.length} Trades
                    </h3>
                  </div>
                  <div className="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 group-hover:scale-110 transition duration-300">
                    <LineChart className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Simulated Floating Profit</span>
                  <span className={`font-mono font-black ${
                    openTrades.reduce((acc, t) => acc + t.profit, 0) >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {openTrades.reduce((acc, t) => acc + t.profit, 0) >= 0 ? "+" : ""}${openTrades.reduce((acc, t) => acc + t.profit, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stat 3: Academy Certification & Syllabus state */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition duration-300 group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7e8c9f]">Academy Curriculum</span>
                    <h3 className="text-2xl font-black text-white mt-1 group-hover:text-pink-400 transition-colors">
                      {isAcademyRegistered ? `${FOREX_LESSONS.length} Modules` : "🔒 Gated"}
                    </h3>
                  </div>
                  <div className="bg-pink-500/10 p-2.5 rounded-lg border border-pink-500/20 group-hover:scale-110 transition duration-300">
                    <BookOpen className="w-5 h-5 text-pink-400" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  {isAcademyRegistered ? (
                    <>
                      <span>Review Syllabus Selected</span>
                      <span className="font-mono text-pink-300 font-bold capitalize">{selectedLessonId.replace("-", " ")}</span>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setPaymentPurpose("academy_enroll");
                        setPaymentAmount(2.31);
                        setActiveTab("payments");
                      }}
                      className="text-pink-400 hover:text-pink-305 font-extrabold cursor-pointer uppercase text-[9px] tracking-wider w-full text-left animate-pulse"
                    >
                      ⚠️ ENROLL NOW — TAP FOR MPESA / CARD (KSH 300)
                    </button>
                  )}
                </div>
              </div>

              {/* Stat 4: Interactive License Compliance status */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition duration-300 group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7e8c9f]">Broker & QA License</span>
                    <h3 className="text-2xl font-black text-white mt-1 group-hover:text-emerald-400 transition-colors">
                      {isBrokerLicensed && isMentorLicensed ? "Certified ✓" : "Pending Specs"}
                    </h3>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 group-hover:scale-110 transition duration-300">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Completed Exams</span>
                  <span className="font-mono text-emerald-300 font-bold">{isExamRegistered ? "Licensed" : "Standard Retakes"}</span>
                </div>
              </div>

            </div>

            {/* TIKTOK CREATOR HUB CARD Row */}
            {(() => {
              // Calculate dynamic script content based on current states
              let hook = "";
              let body = "";
              let hashtags = "";
              
              if (tiktokHookStyle === "shocking") {
                if (tiktokVidType === "profit") hook = "🚨 Brokers will legacy ban me for revealing this FREE prop desk tool!";
                else if (tiktokVidType === "quiz") hook = `🚨 Only 1% of beginner traders pass this 30-second ${selectedLessonId.replace("-", " ").toUpperCase()} drill...`;
                else hook = `🚨 Stop losing trades! Master ${selectedLessonId.replace("-", " ").toUpperCase()} in 15 seconds.`;
              } else if (tiktokHookStyle === "curiosity") {
                if (tiktokVidType === "profit") hook = `🤔 Why is everyone talking about simulated FX Fluent trading limits?`;
                else if (tiktokVidType === "quiz") hook = `🤔 What license score do you need to graduate starter micro limits?`;
                else hook = `🤔 The truth about the ${selectedLessonId.replace("-", " ").toUpperCase()} module they never teach you.`;
              } else {
                if (tiktokVidType === "profit") hook = `📈 Day 1 of practicing standard risk management with simulation capital.`;
                else if (tiktokVidType === "quiz") hook = `📈 Testing my financial IQ with the official compliance syllabus exam!`;
                else hook = `📈 Just covered ${selectedLessonId.replace("-", " ").toUpperCase()} today. Here is my hot take.`;
              }

              if (tiktokVidType === "profit") {
                body = `I am practicing trades on the live spot simulator with a $${balance.toLocaleString(undefined, {maximumFractionDigits: 0})} demo balance.\nLeverage is set to ${leverage}:1 with ${openTrades.length} positions currently active.\nThis lets me simulate market spreads safely before using real capital!`;
                hashtags = "#forexforbeginners #forextrading #kenyatraders #mpesatrading #fxfluent #demotrader #viral";
              } else if (tiktokVidType === "quiz") {
                const quizScorePct = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 80;
                body = `Passed the official FX Fluent Exam for the ${selectedLessonId.replace("-", " ").toUpperCase()} module!\nScored ${quizScorePct}% on the interactive questionnaire.\nUnlocks tier certification for simulated micro trading!`;
                hashtags = "#forexquiz #tradingexam #forexeducation #tradersmindset #fxfluent #financialliteracy #fyp";
              } else {
                body = `Reviewing the ${selectedLessonId.replace("-", " ").toUpperCase()} syllabus on the academy portal.\nCombined with lessons on lot sizing, spreads, and leverage offsets.\nHighly interactive - try the AI simulator to see direct effects!`;
                hashtags = "#forextips #pipcalculation #forexmentor #aitradingtutor #learnontiktok #fxfluentacademy";
              }

              return (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-pink-950/20 border border-pink-500/25 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl" id="tiktok-creator-hub-card">
                  <div className="absolute top-[-40%] right-[-10%] w-[350px] h-[350px] bg-pink-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                    
                    {/* Left: Input Selection controls & Script Draft Pane (lg:col-span-8) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                      
                      {/* Top Heading */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 font-bold">FX Fluent Promotion Station</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                          <span>🎥 TikTok & Social Creator Studio</span>
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">
                          TikTok is the #1 tool to share your FX learning journey! Use our Creator Studio to auto-generate dynamic short video hooks and scripts based on your actual live sim performance, then copy them to launch your channel.
                        </p>
                      </div>

                      {/* Content Selection Tabs */}
                      <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 border border-white/5 rounded-xl text-xs">
                        <button
                          onClick={() => {
                            setTiktokVidType("profit");
                            setSuccessNotification("TikTok concept switched: Sim-Profit Showcase");
                          }}
                          className={`py-2 px-1.5 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${tiktokVidType === "profit" ? "bg-pink-500/25 text-pink-300 border border-pink-500/30 font-extrabold" : "text-slate-400 hover:text-white"}`}
                        >
                          💸 Profit Showcase
                        </button>
                        <button
                          onClick={() => {
                            setTiktokVidType("quiz");
                            setSuccessNotification("TikTok concept switched: Exam Certificate");
                          }}
                          className={`py-2 px-1.5 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${tiktokVidType === "quiz" ? "bg-pink-500/25 text-pink-300 border border-pink-500/30 font-extrabold" : "text-slate-400 hover:text-white"}`}
                        >
                          📝 Exam Passed
                        </button>
                        <button
                          onClick={() => {
                            setTiktokVidType("lesson");
                            setSuccessNotification("TikTok concept switched: Lesson Hack Tip");
                          }}
                          className={`py-2 px-1.5 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${tiktokVidType === "lesson" ? "bg-pink-500/25 text-pink-300 border border-pink-500/30 font-extrabold" : "text-slate-400 hover:text-white"}`}
                        >
                          💡 Lesson Insights
                        </button>
                      </div>

                      {/* Parameter Controls Row & Layout Selector */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Hook Select */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-extrabold tracking-wide text-slate-400">Choose Video Hook style</span>
                          <select
                            value={tiktokHookStyle}
                            onChange={(e) => setTiktokHookStyle(e.target.value)}
                            className="bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-semibold"
                          >
                            <option value="shocking">🚨 Shocking Alert Hook</option>
                            <option value="curiosity">🤔 Curiosity Gap Hook</option>
                            <option value="humble">📈 Humble Progress Hook</option>
                          </select>
                        </div>

                        {/* Audio Track */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-extrabold tracking-wide text-slate-400">Select Trending Audio</span>
                          <select
                            value={tiktokMusicTrack}
                            onChange={(e) => setTiktokMusicTrack(e.target.value)}
                            className="bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-semibold"
                          >
                            <option value="Forex Market Phonk - Sped Up">🎵 Forex Phonk - Sped Up (Trending)</option>
                            <option value="Ambient Chill Lo-Fi Study Beats">🎵 Ambient Lo-Fi Chill Beats</option>
                            <option value="Gym Motivation Hardcore Rap">🎵 Gym Motivation Hardcore Rap</option>
                          </select>
                        </div>

                        {/* TTS Voice Style */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-extrabold tracking-wide text-slate-400">TTS Narrator Accent</span>
                          <select
                            value={tiktokVoiceStyle}
                            onChange={(e) => setTiktokVoiceStyle(e.target.value)}
                            className="bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-semibold"
                          >
                            <option value="Jessie (Siri-like English Pro)">🎙️ Jessie (High pitch UK)</option>
                            <option value="Joey (Deep Hype Male Narrator)">🎙️ Joey (Deep Motivational Hype)</option>
                            <option value="Aria (Soft Calm Whispering)">🎙️ Aria (Soft Calm Study Advisor)</option>
                          </select>
                        </div>
                      </div>

                      {/* Complete Copyable Script Pane */}
                      <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-[10px] font-mono tracking-widest uppercase text-[#a8b2ca]">Video Script Blueprint</span>
                          <button
                            onClick={async () => {
                              try {
                                const fullDraftText = `[TRENDING SOUND: ${tiktokMusicTrack}]\n[TTS ACCENT: ${tiktokVoiceStyle}]\n\n*HOOK SCROLL-STOPPER*:\n"${hook}"\n\n*EXPLANATION BODY*:\n"${body}"\n\n*HASHTAGS DIRECTIVE*:\n${hashtags}`;
                                await navigator.clipboard.writeText(fullDraftText);
                                setCopiedTiktokScript(true);
                                setSuccessNotification("📋 TikTok template copied! Go to upload now.");
                                setTimeout(() => setCopiedTiktokScript(false), 2500);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="text-[10px] flex items-center gap-1.5 bg-pink-500/15 hover:bg-pink-500/30 text-pink-300 font-bold px-2 py-1 rounded border border-pink-500/20 active:scale-95 transition cursor-pointer"
                            id="copy-tiktok-script"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedTiktokScript ? "Copied Blueprint!" : "Copy Full Script"}</span>
                          </button>
                        </div>

                        {/* Main Script visualization */}
                        <div className="text-xs space-y-2.5 max-h-[175px] overflow-y-auto leading-relaxed text-slate-300 font-mono pr-2">
                          <div>
                            <span className="text-[10px] text-pink-400 uppercase font-black tracking-wider block mb-0.5">⏱️ [0:00 - 0:03] Scroll Stopper (Visual / Text overlay):</span>
                            <div className="bg-white/5 p-2 rounded border border-white/5 italic text-[11px] text-white font-sans">
                              "{hook}"
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-indigo-400 uppercase font-black tracking-wider block mb-0.5">🎬 [0:03 - 0:12] Body Explanation (Narrator TTS):</span>
                            <p className="bg-white/2 p-2 rounded text-[11px] whitespace-pre-line leading-normal">
                              {body}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block mb-0.5">🏷️ Optimized Tags for TikTok algorithmic indexing:</span>
                            <span className="text-[10px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 px-2 py-1.5 rounded block whitespace-pre-line overflow-x-auto select-all">
                              {hashtags}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-[11px] text-[#a8b2ca]">
                          <span className="flex items-center gap-1 italic text-[10px]">
                            💡 Pro-Tip: Overlay your mobile app screen with a green-screen video filter!
                          </span>

                          <a
                            href="https://www.tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-black hover:bg-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition shadow flex items-center gap-1 active:scale-95 cursor-pointer"
                          >
                            <span>Open TikTok Platform ↗</span>
                          </a>
                        </div>

                      </div>

                    </div>

                    {/* Right: Simulated Mobile Preview screen mimicking real Tiktok playback (lg:col-span-4) */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center">
                      <div className="w-[190px] aspect-[9/16] bg-slate-950 border border-white/15 rounded-[22px] p-2 flex flex-col justify-between relative overflow-hidden shadow-2xl group select-none">
                        
                        {/* Simulated Image Background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-pink-950 to-slate-950 opacity-65 z-0"></div>
                        
                        {/* Glowing orb simulator line */}
                        <div className="absolute bottom-[30%] left-[20%] w-36 h-36 bg-pink-500/15 rounded-full blur-2xl z-0 animate-pulse"></div>

                        {/* Top controls */}
                        <div className="flex justify-between items-center text-[8px] text-white/70 font-bold z-10 px-1 pt-1 font-sans">
                          <span className="text-[7px]">🔴 LIVE</span>
                          <div className="flex gap-2">
                            <span>Following</span>
                            <span className="underline decoration-pink-500 decoration-2">For You</span>
                          </div>
                          <span>🔍</span>
                        </div>

                        {/* Middle: Video dynamic text bubble overlays */}
                        <div className="z-10 flex flex-col gap-2 my-auto px-1.5 pt-4">
                          <div className="bg-black/75 p-2 rounded-lg border border-pink-500/40 text-[9px] font-black text-white text-center leading-normal tracking-wide shadow-lg animate-bounce duration-1000">
                             {hook.replace(/🚨|🤔|📈/g, "")}
                          </div>

                          <div className="bg-pink-500/80 text-white font-mono font-bold text-[8px] text-center py-1 rounded tracking-widest px-1">
                            {tiktokVidType === "profit" && `EQUITY: $${balance.toLocaleString()}`}
                            {tiktokVidType === "quiz" && `CERTIFIED EXAM: ${quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 80}% PASS`}
                            {tiktokVidType === "lesson" && `TOPIC: ${selectedLessonId.toUpperCase()}`}
                          </div>
                        </div>

                        {/* Bottom overlays & sound details */}
                        <div className="z-10 flex flex-col gap-1.5 text-left px-1">
                          
                          {/* Profile Tag */}
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center text-[7px] text-white font-black">
                              F
                            </div>
                            <div className="min-w-0">
                              <span className="block text-[8px] font-black text-white leading-none">@fx_fluent_app</span>
                              <span className="text-[6px] text-white/85">Kenya Retail Sandbox</span>
                            </div>
                          </div>

                          {/* Dynamic text description */}
                          <p className="text-[7px] text-white/90 line-clamp-2 leading-relaxed font-sans font-normal">
                            Learning spreads and margins using our interactive simulated system. {hashtags}
                          </p>

                          {/* Sound effect name */}
                          <div className="flex items-center gap-1 text-[7px] text-[#f472b6]">
                            <span className="animate-spin text-[8px]">🎵</span>
                            <span className="truncate font-medium italic text-[6px]">{tiktokMusicTrack}</span>
                          </div>

                        </div>

                        {/* Right interaction triggers buttons */}
                        <div className="absolute right-1 bottom-[20%] z-10 flex flex-col items-center gap-3 text-white">
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] bg-red-500/10 p-1.5 rounded-full text-red-500 hover:text-red-400">❤️</span>
                            <span className="text-[6px] text-white/90 mt-0.5">2.4k</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] bg-black/50 p-1.5 rounded-full text-slate-300">💬</span>
                            <span className="text-[6px] text-white/90 mt-0.5">188</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] bg-black/50 p-1.5 rounded-full text-yellow-500">⭐</span>
                            <span className="text-[6px] text-white/90 mt-0.5">340</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] bg-black/50 p-1.5 rounded-full text-blue-400">🚀</span>
                            <span className="text-[6px] text-white/90 mt-0.5">99+</span>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* HIGH-RES APP LOCATOR & DIGITAL DIRECT REFERRAL HUB */}
            {(() => {
              const liveAppUrl = typeof window !== "undefined" ? window.location.href : "https://ais-pre-vedoqvri5sinxe66ttp2j5-472053032637.europe-west1.run.app";
              const secondaryShortUrl = "https://ais-pre-vedoqvri5sinxe66ttp2j5-472053032637.europe-west1.run.app";

              const outboundTemplates = [
                {
                  id: "whatsapp",
                  serviceName: "WhatsApp M-Pesa Peer Group",
                  platformIcon: "💬",
                  colorTheme: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
                  glowColor: "from-emerald-500/10",
                  text: `🔥 Kenya Retail FX Sandbox Alert! I am training my leverage and spreads calculations on the FX Fluent app. Virtual Demo Balance is currently at $${balance.toLocaleString()}. Check out standard pips math and pass the compliance exams risk-free here:\n\n👉 Join free: ${liveAppUrl}\n\n[Signature Note]: "${customNote}"`
                },
                {
                  id: "telegram",
                  serviceName: "Telegram Trading Channels",
                  platformIcon: "✈️",
                  colorTheme: "text-sky-400 border-sky-500/30 bg-sky-500/5",
                  glowColor: "from-sky-500/10",
                  text: `📊 Forex Alpha Upgrade: Skip high-risk broker fees. FX Fluent has live spot metrics simulation, interactive quizzes for leverage, and M-Pesa test transfers simulated. Use my direct invite finder link below to test your financial trading quotient.\n\n👉 Find App here: ${secondaryShortUrl}\n\n[Signature Note]: "${customNote}"`
                },
                {
                  id: "twitter",
                  serviceName: "Twitter / X Retail Broadcast",
                  platformIcon: "𝕏",
                  colorTheme: "text-slate-200 border-white/20 bg-white/5",
                  glowColor: "from-white/10",
                  text: `Practicing standard retail micro-lots with @fx_fluent_app live sandbox. Real-time JPY spreads calculations, compliance syllabus tracking, mock STK push simulation logs. Check your trading credentials free!\n\n🎓 Discovery Link: ${liveAppUrl}`
                },
                {
                  id: "email",
                  serviceName: "Standard Academic Email Flyer",
                  platformIcon: "✉️",
                  colorTheme: "text-pink-400 border-pink-500/30 bg-pink-500/5",
                  glowColor: "from-pink-500/10",
                  text: `Subject: Educational Platform Invitation - Kenya FX Retail Sandbox\n\nHello fellow trader,\n\nI highly recommend practicing with the interactive FX Fluent App. It features customized lessons, an AI Tutor coach, compliance exam checklists, and virtual balance management for risk safety training.\n\nExplore and register for free at:\n${liveAppUrl}\n\nSincerely,\nBenedict`
                }
              ];

              const activeTemplate = outboundTemplates[shareTemplateIndex] || outboundTemplates[0];

              const handleShareRedirect = () => {
                const textParam = encodeURIComponent(activeTemplate.text);
                if (activeTemplate.id === "whatsapp") {
                  window.open(`https://api.whatsapp.com/send?text=${textParam}`, "_blank");
                } else if (activeTemplate.id === "telegram") {
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(liveAppUrl)}&text=${textParam}`, "_blank");
                } else if (activeTemplate.id === "twitter") {
                  window.open(`https://twitter.com/intent/tweet?text=${textParam}`, "_blank");
                } else {
                  window.open(`mailto:?subject=Interactive%20Forex%20Sandbox%20App&body=${textParam}`, "_blank");
                }
              };

              return (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#0c142c] border border-white/15 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl" id="referral-app-locator-hub">
                  <div className="absolute top-[-40%] left-[-10%] w-[380px] h-[380px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none"></div>
                  <div className="absolute bottom-[-30%] right-[-10%] w-[380px] h-[380px] bg-pink-500/5 rounded-full blur-[90px] pointer-events-none"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 text-left">
                    
                    {/* Left Grid: Sharing options and templates chooser (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-4">
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold">App Discovery & Outreach Desk</span>
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                          <span>🔗 Global Platform Finder & Referral Link Hub</span>
                        </h3>
                        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
                          Empower other traders to find our Kenya financial sandbox platform instantly. Use the templates below to generate visually complete, pre-formatted promotional cards with one click.
                        </p>
                      </div>

                      {/* Chooser Tabs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {outboundTemplates.map((tpl, idx) => (
                          <button
                            key={tpl.id}
                            onClick={() => {
                              setShareTemplateIndex(idx);
                              setSuccessNotification(`Outreach template switched to: ${tpl.serviceName}`);
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all duration-200 cursor-pointer ${shareTemplateIndex === idx ? "bg-blue-500/10 border-blue-500/40 text-white ring-1 ring-blue-500/25 font-bold" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                            id={`share-selector-${tpl.id}`}
                          >
                            <span className="text-base shrink-0">{tpl.platformIcon}</span>
                            <div className="min-w-0">
                              <span className="text-[10px] block font-black leading-none text-white truncate">{tpl.serviceName.split(" ")[0]}</span>
                              <span className="text-[8px] text-[#94a3b8] mt-0.5 block truncate">{tpl.id === "whatsapp" ? "Send Peer chat" : "Publish alert"}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Custom input comment field */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-[9px] uppercase font-extrabold text-[#7e8c9f] font-mono tracking-wider">
                            ✍️ Custom Signature Comment Note (Injected into flyer text)
                          </label>
                          <input
                            type="text"
                            value={customNote}
                            onChange={(e) => setCustomNote(e.target.value)}
                            maxLength={75}
                            placeholder="Type a personal note (e.g. Try standard pip simulator!)"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(activeTemplate.text);
                                setShareCopiedState(true);
                                setSuccessNotification("📋 Referral flyer text saved to clipboard successfully!");
                                setTimeout(() => setShareCopiedState(false), 2000);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition cursor-pointer font-bold"
                            id="btn-copy-outreach-text"
                          >
                            {shareCopiedState ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{shareCopiedState ? "Copied!" : "Copy Text Flyer"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Preview Text Box */}
                      <div className="bg-slate-950/70 border border-white/5 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                          <span>Live Message Payload Preview</span>
                          <span className="text-blue-400 font-extrabold">{activeTemplate.serviceName} Compatible</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/10 text-[11px] font-mono text-slate-200 whitespace-pre-line leading-relaxed h-[110px] overflow-y-auto select-all">
                          {activeTemplate.text}
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5 font-bold text-xs">
                          <span className="text-[10px] text-slate-400">
                            🌍 Shared App Link: <span className="font-mono text-[9px] text-[#ced7e0] leading-none select-all">{liveAppUrl}</span>
                          </span>
                          <button
                            onClick={handleShareRedirect}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-95 font-black text-[10px] px-3.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider shadow-sm flex items-center gap-1 font-bold"
                          >
                            <span>Share Outbound {activeTemplate.platformIcon} ↗</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Right Grid: Beautiful Digital Finder QR Asset Screen (lg:col-span-4) */}
                    <div className="lg:col-span-4 bg-slate-950/70 border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden group">
                      
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-50"></div>
                      
                      <div className="space-y-1 z-10">
                        <span className="text-[8px] font-mono uppercase bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full inline-block">
                          Direct App QR Matrix
                        </span>
                        <h4 className="text-xs font-bold text-white tracking-tight">Scan With Mobile Device</h4>
                      </div>

                      {/* Visual representations of modern QR matrix */}
                      <div className="my-4 p-4 bg-white rounded-xl relative overflow-hidden group-hover:scale-105 transition-transform duration-300 flex flex-col items-center shadow-lg border-2 border-slate-700/50">
                        <div className="w-[124px] h-[124px] grid grid-cols-5 gap-1.5">
                          {Array.from({ length: 25 }).map((_, i) => {
                            // Synthesize decorative QR scan block patterns
                            const isCorner = i === 0 || i === 4 || i === 20 || i === 24 || i === 1 || i === 3 || i === 21 || i === 23 || i === 5 || i === 9 || i === 15 || i === 19;
                            const isPoint = i === 12 || (i % 3 === 0 && i % 4 !== 0);
                            
                            let boxColor = "bg-slate-900";
                            if (isCorner) {
                              boxColor = qrColor === "pink" ? "bg-pink-500" : qrColor === "emerald" ? "bg-emerald-500" : "bg-indigo-600";
                            } else if (isPoint) {
                              boxColor = "bg-slate-800";
                            } else if (i % 2 === 0) {
                              boxColor = "bg-slate-900/60";
                            } else {
                              boxColor = "bg-slate-200";
                            }

                            return (
                              <div
                                key={i}
                                className={`rounded-[3px] transition duration-300 ${boxColor}`}
                              ></div>
                            );
                          })}
                        </div>
                        
                        {/* Styled overlay code address locator icon badge */}
                        <div className="absolute w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center text-[10px] font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/25 shadow">
                          FX
                        </div>
                      </div>

                      {/* Interactive styling togglers */}
                      <div className="w-full space-y-2 z-10">
                        <div className="flex justify-between items-center text-[9px] text-[#a8b2ca] font-mono px-1">
                          <span>Aesthetic Accent Theme</span>
                          <span className="font-extrabold uppercase text-white font-mono">{qrColor}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => setQrColor("emerald")}
                            className={`py-1 rounded text-[9px] font-bold border transition cursor-pointer ${qrColor === "emerald" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-white/2 border-white/5 text-slate-500"}`}
                          >
                            🟢 Emerald
                          </button>
                          <button
                            onClick={() => setQrColor("pink")}
                            className={`py-1 rounded text-[9px] font-bold border transition cursor-pointer ${qrColor === "pink" ? "bg-pink-500/10 border-pink-500/40 text-pink-400" : "bg-white/2 border-white/5 text-slate-500"}`}
                          >
                            🔴 Pink
                          </button>
                          <button
                            onClick={() => setQrColor("indigo")}
                            className={`py-1 rounded text-[9px] font-bold border transition cursor-pointer ${qrColor === "indigo" ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400" : "bg-white/2 border-white/5 text-slate-500"}`}
                          >
                            🔵 Indigo
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Live Markets quick order desk & economic pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Live Ticker Quick-desk (lg:col-span-8) */}
              <div className="lg:col-span-8 bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
                    <h3 className="text-sm font-extrabold text-white">Live Market Watch Watchlist</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab("simulator")}
                    className="text-[11px] text-indigo-400 hover:text-white flex items-center gap-1 font-bold group"
                  >
                    <span>Launch Full Interactive Chart</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currencyPairs.map((pair) => {
                    const latestPrice = pair.price;
                    const changeVal = (pair.price - pair.history[0]).toFixed(pair.pipSize === 0.01 ? 2 : 4);
                    const percentChange = ((pair.price - pair.history[0]) / pair.history[0] * 100).toFixed(2);
                    const isUp = pair.trend === "UP" || Number(changeVal) >= 0;

                    return (
                      <div 
                        key={pair.symbol} 
                        className="bg-white/2 border border-white/5 rounded-xl p-4 hover:border-white/10 transition duration-150 flex flex-col justify-between gap-3 group"
                        id={`dashboard-watchlist-${pair.symbol.replace("/", "-")}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-black text-white tracking-tight">{pair.symbol}</span>
                            <span className="block text-[10px] text-slate-450 text-slate-400 truncate max-w-[150px]">{pair.name}</span>
                          </div>

                          <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                            isUp ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"
                          }`}>
                            {isUp ? "+" : ""}{percentChange}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold text-slate-400">Live Bid</span>
                            <div className="text-base font-black font-mono text-white tracking-widest leading-none mt-0.5">
                              {latestPrice.toFixed(pair.pipSize === 0.01 ? 2 : 4)}
                            </div>
                          </div>

                          {/* Action shortcuts */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPairSymbol(pair.symbol);
                                setActiveTab("simulator");
                              }}
                              className="bg-white/5 hover:bg-white/20 text-white border border-white/10 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition duration-150"
                              title="Trade this pair in Simulator"
                            >
                              Simulate Spot
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPairSymbol(pair.symbol);
                                setActiveTab("tutor");
                              }}
                              className="bg-[#1e1b4b]/40 hover:bg-[#312e81] text-indigo-300 border border-[#312e81]/50 p-1.5 rounded-lg text-[10px] font-bold transition duration-150"
                              title="Consult AI Trading mentor about pair"
                            >
                              💡 Ask AI
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Economic calendar & system actions sidebar (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                
                {/* Micro Live News alerts desk */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3.5 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Newspaper className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Latest Volatility Alerts</h4>
                    </div>
                    <button 
                      onClick={() => setActiveTab("news")}
                      className="text-[10px] text-amber-400 hover:text-white font-bold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newsFeed.slice(0, 3).map((item) => (
                      <div 
                        key={item.id} 
                        className="p-2.5 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition flex flex-col gap-1 text-[11px]"
                      >
                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                          <span className="font-extrabold uppercase text-slate-400">{item.source}</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] uppercase ${
                            item.impact === "HIGH" ? "bg-red-500/10 text-red-400 border border-red-500/25" : "bg-slate-500/10 text-slate-400"
                          }`}>
                            {item.impact}
                          </span>
                        </div>
                        <span className="text-white font-bold tracking-tight line-clamp-1 group-hover:text-amber-400">
                          {item.headline}
                        </span>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 font-normal leading-normal">
                          {item.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Economic Release Signal Box */}
                <div className="bg-[#1e1b4b]/20 border border-indigo-500/20 rounded-2xl p-4 flex flex-col gap-3.5 relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-1.5 border-b border-indigo-500/10 pb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">Trading Desk Guidance</h4>
                  </div>

                  <p className="text-[11px] text-[#a8b2ca] leading-relaxed">
                    "Maintain risk parameters. Check Stop-Loss bounds. Try simulating an <span className="text-indigo-300 font-bold">M-Pesa Class purchase</span> inside the payments desk to trigger advanced lot features on G-20 assets."
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-500/10">
                    <button
                      onClick={() => setActiveTab("tutor")}
                      className="bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-[#4338ca] text-center p-2 rounded-lg text-[10px] font-bold transition duration-150"
                    >
                      🗣️ AI Trading Tutor
                    </button>
                    <button
                      onClick={() => setActiveTab("quiz")}
                      className="bg-[#1e293b] hover:bg-white/5 text-slate-300 border border-white/10 text-center p-2 rounded-lg text-[10px] font-bold transition duration-150"
                    >
                      📝 Take Quiz Exam
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 1: ACADEMY INSTRUCTION MODULES */}
        {activeTab === "academy" && (
          !isAcademyRegistered ? (
            renderGateWall("Interactive Academy Courses", "Register with the Kenyan retail sandbox educational standard to unlock all modular courses, leverage guides, and pip calculation sandbox simulators.")
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="academy-view">
            
            {/* Left selector menu of curriculum topics */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 tracking-wider uppercase">Syllabus Curriculum</h3>
                <div className="space-y-2.5">
                  {FOREX_LESSONS.map((lesson, idx) => {
                    const isSelected = selectedLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${isSelected ? "bg-blue-500/10 border-blue-500/40 text-white" : "bg-white/2 border-white/5 hover:bg-white/5 text-slate-300 hover:text-white"}`}
                        id={`lesson-selector-${lesson.id}`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-sm tracking-tight">{lesson.title}</div>
                          <div className="text-xs text-slate-400 truncate mt-1">{lesson.description}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${lesson.difficulty === "Beginner" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"}`}>
                            {lesson.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">⏱️ {lesson.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive margin calculator educational tool box */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold">Interactive Calculation Sandbox</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time trade calculation helps prevent margin calls. Move the variables below to see how contract sizes impact account exposure!
                </p>

                {/* Lever Calculator Config */}
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1.5">
                      <span className="text-slate-400">Practicing Lot Size:</span>
                      <span className="font-bold text-white">{lotCalculatorSize} ({lotCalculatorSize >= 1.0 ? "Standard Lot" : lotCalculatorSize >= 0.1 ? "Mini Lot" : "Micro Lot"})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setLotCalculatorSize(prev => Math.max(0.01, Number((prev - 0.01).toFixed(2))))}
                        className="bg-white/10 hover:bg-white/15 p-1 rounded border border-white/5 text-slate-400 hover:text-white active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="range" 
                        min="0.01" 
                        max="2.00" 
                        step="0.01" 
                        value={lotCalculatorSize}
                        onChange={(e) => setLotCalculatorSize(parseFloat(e.target.value))}
                        className="flex-1 accent-blue-500 cursor-pointer"
                      />
                      <button 
                        onClick={() => setLotCalculatorSize(prev => Math.min(2.0, Number((prev + 0.01).toFixed(2))))}
                        className="bg-white/10 hover:bg-white/15 p-1 rounded border border-white/5 text-slate-400 hover:text-white active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1.5">
                      <span className="text-slate-400">Leverage Setting:</span>
                      <span className="font-bold text-white">{calculatorLeverage}:1 Leverage</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[10, 50, 100, 200, 500].map(lev => (
                        <button
                          key={lev}
                          onClick={() => setCalculatorLeverage(lev)}
                          className={`py-1 rounded text-[10px] text-center border font-bold transition-all duration-200 ${calculatorLeverage === lev ? "bg-blue-500 border-blue-400 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/15 hover:text-white"}`}
                        >
                          {lev}:1
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live math result boxes */}
                <div className="bg-[#020617]/40 rounded-xl p-3 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Capital Controlled:</span>
                    <span className="font-bold text-blue-300">${(lotCalculatorSize * 100000).toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required Downpayment (Margin):</span>
                    <span className="font-bold text-emerald-400">${((lotCalculatorSize * 100000) / calculatorLeverage).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Approx Value Per Pip:</span>
                    <span className="font-semibold text-white">${(lotCalculatorSize * 10).toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg flex gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>At 500:1 leverage you only need extremely low cash deposit, but a tiny 20-pip sudden drop can wipe your account!</span>
                </div>
              </div>
            </div>

            {/* Displaying Current selected academy lessons text */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {FOREX_LESSONS.filter(l => l.id === selectedLessonId).map(lesson => (
                <div key={lesson.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl flex flex-col gap-6" id="academy-content">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-blue-400 font-bold tracking-widest uppercase mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Academy Module
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{lesson.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">{lesson.description}</p>
                  </div>

                  <div className="space-y-6">
                    {lesson.sections.map((sect, sIdx) => (
                      <div key={sIdx} className="bg-white/2 border border-white/5 rounded-xl p-5 hover:border-slate-800 transition-colors duration-200">
                        <h4 className="text-base font-bold text-white mb-2 pb-1.5 border-b border-white/5 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">{sIdx + 1}</span>
                          {sect.title}
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{sect.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Summary / Practice trigger banner */}
                  <div className="mt-4 p-5 bg-white/5 border border-blue-500/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-white">Understand this concept?</h4>
                      <p className="text-xs text-slate-400 mt-1">Simulate live currency mock trades or verify your lessons with quizzes instantly.</p>
                    </div>
                    <div className="flex gap-2.5 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => {
                          setSelectedPairSymbol("EUR/USD");
                          setActiveTab("simulator");
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-xs text-white rounded-lg font-bold transition-all duration-200"
                        id="academy-test-trade"
                      >
                        Trade Sandbox
                      </button>
                      <button
                        onClick={() => {
                          setActiveQuizCategory(selectedLessonId);
                          handleLoadQuiz(selectedLessonId);
                          setActiveTab("quiz");
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/15 text-xs text-slate-300 hover:text-white rounded-lg font-bold border border-white/10 transition-all duration-200"
                        id="academy-test-exam"
                      >
                        Take Exam
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )
        )}

        {/* VIEW 2: INTERACTIVE SIMULATOR (MARKET & Sandbox) */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="simulator-view">
            
            {/* Left sidebar: Select Pairs */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 tracking-wider uppercase">Currency Assortments</h3>
                <div className="space-y-2">
                  {currencyPairs.map(pair => {
                    const isSelected = selectedPairSymbol === pair.symbol;
                    const prevPrice = pair.history[pair.history.length - 2] || pair.price;
                    const priceDiff = pair.price - prevPrice;
                    const isPositive = priceDiff >= 0;

                    return (
                      <button
                        key={pair.symbol}
                        onClick={() => setSelectedPairSymbol(pair.symbol)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${isSelected ? "bg-white/10 border-white/20 text-white" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                        id={`pair-button-${pair.symbol}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm tracking-tight text-white">{pair.symbol}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {isPositive ? "↑" : "↓"} {pair.trend}
                          </span>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <span className="font-mono text-base font-semibold">{pair.price.toFixed(pair.pipSize === 0.01 ? 3 : 5)}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Spread: {pair.spread} pips</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Education Box detailing Forex exceptions (such as JPY 2nd decimals) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-xl text-xs space-y-2.5 text-slate-400">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <h4>Educational Guide</h4>
                </div>
                <p className="leading-relaxed">
                  Notice that <span className="text-white font-semibold">USD/JPY</span> has only 3 decimals! That is because its Pip lies on the 2nd decimal place (0.01), unlike Eur/Usd which represents the 4th decimal place.
                </p>
                <div className="bg-[#020617]/40 p-3 rounded-lg border border-white/5 text-[11px] space-y-1">
                  <div>• EUR/USD value of 1 pip: <span className="font-mono text-emerald-400">0.0001</span></div>
                  <div>• USD/JPY value of 1 pip: <span className="font-mono text-emerald-400">0.01</span></div>
                </div>
              </div>
            </div>

            {/* Middle Block: Interactive SVG Chart Candle curves */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl flex flex-col gap-4">
                
                {/* Chart Header details */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white tracking-tight">{activePair.symbol}</h3>
                      <span className="text-xs text-slate-400">1 Hour Ticks Sandbox Chart</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-slate-400">Spread: <span className="font-bold text-white font-mono">{activePair.spread} JPs</span></span>
                      <span className="text-slate-400">Pip Scale: <span className="font-bold text-white font-mono">{activePair.pipSize}</span></span>
                      <span className="text-slate-400">Volatility: <span className="font-bold text-blue-300 uppercase">{activePair.volatility > 0.05 ? "High" : "Low"}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button 
                      onClick={() => setShowIndicators(p => !p)}
                      className={`px-2.5 py-1.5 rounded-lg border transition-all duration-200 font-medium ${showIndicators ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"}`}
                      title="Toggle EMA and bounds indicators"
                      id="toggle-indicators"
                    >
                      Overlays
                    </button>
                    <button 
                      onClick={() => {
                        // Generate random instant spike to demonstrate traders behavior!
                        setCurrencyPairs(curr => curr.map(p => {
                          if (p.symbol === activePair.symbol) {
                            const change = (Math.random() > 0.5 ? 1 : -1) * (p.pipSize * (15 + Math.random() * 10));
                            return {
                              ...p,
                              price: Number((p.price + change).toFixed(p.pipSize === 0.01 ? 3 : 5)),
                              history: [...p.history.slice(1), p.price + change]
                            };
                          }
                          return p;
                        }));
                        setSuccessNotification(`⚡ Simulate volatility flash-spike on ${activePair.symbol}! Notice how open parameters act.`);
                      }}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors text-slate-300 hover:text-white font-medium"
                      title="Triggers sudden fast rate move"
                      id="trigger-news-flash"
                    >
                      Flash Spill
                    </button>
                  </div>
                </div>

                {/* Candlestick Visualization Stage container */}
                <div className="relative h-64 bg-[#020617]/65 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                  
                  {/* Grid Lines watermark */}
                  <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none opacity-10">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="border-r border-white"></div>)}
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="border-b border-white"></div>)}
                  </div>

                  {/* Draw Custom responsive Candlestick using React SVG */}
                  {activePair.candles && activePair.candles.length > 0 ? (
                    <svg className="w-full h-full p-4" viewBox="0 0 500 200" preserveAspectRatio="none">
                      {(() => {
                        // Dynamically calculate coordinate limits in SVG space
                        const highs = activePair.candles.map(c => c.high);
                        const lows = activePair.candles.map(c => c.low);
                        const maxVal = Math.max(...highs) * 1.001;
                        const minVal = Math.min(...lows) * 0.999;
                        const range = maxVal - minVal;

                        const getY = (priceVal: number) => {
                          return 200 - ((priceVal - minVal) / (range || 1)) * 160 - 20; // leaves top/down padding margins safely
                        };

                        const pointsEMA: string[] = [];
                        const widthStep = 500 / (activePair.candles.length || 1);

                        return (
                          <>
                            {/* Horizontal Guides with live labels */}
                            <line x1="0" y1={getY((maxVal + minVal)/2)} x2="500" y2={getY((maxVal + minVal)/2)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3,3" />
                            <text x="5" y={getY((maxVal + minVal)/2) - 4} fill="#64748b" className="text-[9px] font-mono">Mid: {((maxVal + minVal)/2).toFixed(activePair.pipSize === 0.01 ? 2 : 4)}</text>

                            {/* Indicators Overlays layer bounds */}
                            {showIndicators && (
                              <>
                                {/* Simulated support overlay */}
                                <line x1="0" y1={getY(supportLine)} x2="500" y2={getY(supportLine)} stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="4,4" />
                                <text x="440" y={getY(supportLine) + 12} fill="#10b981" className="text-[8px] font-bold">Support Floor</text>

                                {/* Simulated resistance overlay */}
                                <line x1="0" y1={getY(resistanceLine)} x2="500" y2={getY(resistanceLine)} stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1.5" strokeDasharray="4,4" />
                                <text x="430" y={getY(resistanceLine) - 4} fill="#ef4444" className="text-[8px] font-bold">Resistance Ceiling</text>
                              </>
                            )}

                            {/* Loop and draw Candlestick shapes */}
                            {activePair.candles.map((candle, idx) => {
                              const x = idx * widthStep + widthStep / 2;
                              const isBullish = candle.close >= candle.open;
                              
                              const candleColor = isBullish ? "#10b981" : "#ef4444";
                              const yHigh = getY(candle.high);
                              const yLow = getY(candle.low);
                              const yOpen = getY(candle.open);
                              const yClose = getY(candle.close);

                              const rectTop = Math.min(yOpen, yClose);
                              const rectHeight = Math.max(Math.abs(yOpen - yClose), 2); // default minimum pixel height

                              // Save points for imaginary EMA indicator curve calculation
                              pointsEMA.push(`${x},${(yOpen + yClose) / 2 + 5}`);

                              return (
                                <g key={idx} className="hover:opacity-85 cursor-pointer">
                                  {/* Shadow wick lines */}
                                  <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={candleColor} strokeWidth="1.5" />
                                  {/* Wide box body */}
                                  <rect 
                                    x={x - widthStep * 0.25} 
                                    y={rectTop} 
                                    width={widthStep * 0.5} 
                                    height={rectHeight} 
                                    fill={candleColor} 
                                    rx="2"
                                  />
                                </g>
                              );
                            })}

                            {/* Order entry level guides (painted directly on screen for maximum educational clarity) */}
                            {openTrades.filter(t => t.pair === activePair.symbol).map(t => {
                              const orderY = getY(t.openPrice);
                              if (orderY < 0 || orderY > 200) return null;
                              return (
                                <g key={t.id} className="animate-pulse">
                                  <line x1="0" y1={orderY} x2="500" y2={orderY} stroke={t.type === "BUY" ? "#3b82f6" : "#f59e0b"} strokeWidth="1" strokeDasharray="2,2" />
                                  <rect x="5" y={orderY - 14} width="110" height="12" fill="rgba(2, 6, 23, 0.85)" rx="3" stroke={t.type === "BUY" ? "#3b82f6" : "#f59e0b"} strokeWidth="0.5" />
                                  <text x="8" y={orderY - 5} fill="#94a3b8" className="text-[7px] font-bold">LIVE {t.type} Entry ({t.lotSize} lots)</text>
                                </g>
                              );
                            })}

                            {/* EMA line Overlay indicator */}
                            {showIndicators && showEMA && pointsEMA.length > 1 && (
                              <path 
                                d={`M ${pointsEMA.join(" L ")}`}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                                opacity="0.65"
                                strokeDasharray="1"
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>
                  ) : (
                    <div className="text-slate-500 text-xs">Loading Live Sandbox candles charts...</div>
                  )}

                  {/* Indicator labels */}
                  {showIndicators && (
                    <div className="absolute top-2 left-2 bg-black/50 border border-white/5 px-2 py-1 rounded text-[9px] text-[#f59e0b] font-bold">
                      ⚡ 20 Exponential Moving Average Overlay active
                    </div>
                  )}

                  {/* Price bubble indicator */}
                  <div className={`absolute right-2 px-2.5 py-1 rounded font-mono text-xs font-bold leading-normal text-white ${activePair.trend === "UP" ? "bg-green-600/80" : "bg-red-600/80"}`}>
                    Price: {activePair.price.toFixed(activePair.pipSize === 0.01 ? 3 : 5)}
                  </div>
                </div>

                {/* Educational analysis advice */}
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 text-xs flex items-start gap-3">
                  <div className="p-1 text-blue-400 bg-blue-500/10 rounded border border-blue-500/20 shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-200">Analyzing the Chart Overlays</h5>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      A green candle indicates a bullish period where buyers pushed the close price above the open rate. Dashed lines represent estimated Support (prices bouncing off floors) and Resistance (prices capping out). Try setting a Stop Loss below support to protect trade losses!
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Sandbox Right terminal control: Order placements */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Sandbox Order Book</h3>
                
                {/* Placement Selector tab */}
                <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/5 rounded-xl">
                  <button
                    onClick={() => setTradeType("BUY")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${tradeType === "BUY" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <span>🚀 Buy Rate</span>
                    <kbd className="hidden md:inline-block bg-black/20 px-1 rounded text-[8px] font-mono opacity-80">Alt+B</kbd>
                  </button>
                  <button
                    onClick={() => setTradeType("SELL")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${tradeType === "SELL" ? "bg-red-500 text-white" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    <span>🔥 Sell Rate</span>
                    <kbd className="hidden md:inline-block bg-black/20 px-1 rounded text-[8px] font-mono opacity-80">Alt+S</kbd>
                  </button>
                </div>

                {/* Lot size inputting variables */}
                <div className="text-xs space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between font-medium text-slate-400 mb-1.5">
                      <span>Enter Trade Size (Lots):</span>
                      <span className="font-bold text-white">{tradeLotSize} Lot ({tradeLotSize === 0.01 ? "Micro Lot" : tradeLotSize === 0.1 ? "Mini Lot" : "Standard Lot"})</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 px-1 py-1 pr-1 border border-white/5 rounded-lg bg-black/20">
                      {[0.01, 0.10, 1.00].map(size => (
                        <button
                          key={size}
                          onClick={() => setTradeLotSize(size)}
                          className={`py-1 rounded text-[10px] text-center font-bold border transition-all duration-200 ${tradeLotSize === size ? "bg-blue-500 border-blue-400 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"}`}
                        >
                          {size === 0.01 ? "0.01 Micro" : size === 0.1 ? "0.10 Mini" : "1.00 Std"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Leverage toggles on sand boxes */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-400 mb-1.5">
                      <span>Leverage Power:</span>
                      <span className="font-bold text-white">{leverage}:1 Multiplier</span>
                    </div>
                    <select 
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="w-full bg-[#020617] border border-white/10 p-2 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900"
                    >
                      <option value="10">10:1 (Low Risk - Institutional)</option>
                      <option value="50">50:1 (Recommended retail bound)</option>
                      <option value="100">100:1 (Standard beginner balance)</option>
                      <option value="200">200:1 (High leverage limits)</option>
                      <option value="500">500:1 (Excessive Risk - Extreme!)</option>
                    </select>
                  </div>

                  {/* Stop Loss boundaries */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-400 mb-1.5">
                      <span>Safeguard Stop Loss:</span>
                      <span className="font-bold text-white">{slPips} pips ({tradeType === "BUY" ? "-" : "+"}{(slPips * activePair.pipSize).toFixed(activePair.pipSize === 0.01 ? 2 : 4)})</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      step="5" 
                      value={slPips}
                      onChange={(e) => setSlPips(parseInt(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>

                  {/* Take profit boundaries */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-400 mb-1.5">
                      <span>Take Profit Target:</span>
                      <span className="font-bold text-white">{tpPips} pips ({tradeType === "BUY" ? "+" : "-"}{(tpPips * activePair.pipSize).toFixed(activePair.pipSize === 0.01 ? 2 : 4)})</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      step="10" 
                      value={tpPips}
                      onChange={(e) => setTpPips(parseInt(e.target.value))}
                      className="w-full accent-green-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Breakdown cost analysis */}
                <div className="border-t border-white/10 pt-3 text-[11px] space-y-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>Active Spot Rate:</span>
                    <span className="font-bold font-mono text-slate-200">{activePair.price.toFixed(activePair.pipSize === 0.01 ? 3 : 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est Required Deposit (Margin):</span>
                    <span className="font-bold font-mono text-emerald-400">${estMarginNeeded.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated earnings per pip move:</span>
                    <span className="font-bold font-mono text-blue-300">${currentEstPipEarn.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Position entry execution trigger */}
                <button
                  onClick={handlePlaceTrade}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer border ${tradeType === "BUY" ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white" : "bg-red-500 hover:bg-red-600 border-red-400 text-white"} active:scale-95 shadow-lg flex items-center justify-center gap-2`}
                  id="place-trade-trigger"
                >
                  <span>Submit Simulated {tradeType} Position</span>
                  <kbd className="hidden sm:inline-block bg-black/25 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10 opacity-90">Alt+P</kbd>
                </button>
              </div>
            </div>

            {/* Bottom active positions row */}
            <div className="lg:col-span-12 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Your Running Positions</h3>
                    <kbd className="hidden sm:inline-block bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400">Alt+C to close latest</kbd>
                  </div>
                  <div className="text-xs text-slate-400 italic">Position profits scale instantly with simulated currency tick rates. Take Profits (TP) & Stop Losses (SL) trigger on tick.</div>
                </div>

                {openTrades.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs bg-[#020617]/40 rounded-xl border border-white/5">
                    No active sandbox positions. Choose a lot size and pair above to test strategies!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 min-w-max">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-2.5 pb-2">Direction / Pair</th>
                          <th className="py-2.5 pb-2">Lot Contract Size</th>
                          <th className="py-2.5 pb-2">Buy Entry Price</th>
                          <th className="py-2.5 pb-2">Live Market Price</th>
                          <th className="py-2.5 pb-2">Stop Loss / Take Profit limits</th>
                          <th className="py-2.5 pb-2 text-right">Running Earnings (Float)</th>
                          <th className="py-2.5 pb-2 text-center">Operation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {openTrades.map(trade => {
                          const isProfit = trade.profit >= 0;
                          return (
                            <tr key={trade.id} className="hover:bg-white/2 transition-colors">
                              <td className="py-3 font-semibold flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${trade.type === "BUY" ? "bg-emerald-400 animate-ping" : "bg-red-400 animate-ping"}`}></span>
                                <span className={`font-bold uppercase ${trade.type === "BUY" ? "text-emerald-400" : "text-red-400"}`}>{trade.type}</span>
                                <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono">{trade.pair}</span>
                              </td>
                              <td className="py-3 font-mono font-medium">{trade.lotSize} Lots</td>
                              <td className="py-3 font-mono">{trade.openPrice}</td>
                              <td className="py-3 font-mono">
                                {(currencyPairs.find(p => p.symbol === trade.pair)?.price || trade.openPrice).toFixed(trade.pair.endsWith("JPY") ? 3 : 5)}
                              </td>
                              <td className="py-3 font-mono text-[11px] text-slate-400">
                                <span className="text-red-400">SL:</span> {trade.stopLoss || "None"} | <span className="text-green-400">TP:</span> {trade.takeProfit || "None"}
                              </td>
                              <td className={`py-3 font-mono font-bold text-right ${isProfit ? "text-green-400" : "text-red-400"}`}>
                                {isProfit ? "+" : ""}${trade.profit.toFixed(2)} USD
                              </td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => handleCloseTradeManually(trade)}
                                  className="bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-300 px-3 py-1 rounded text-[11px] font-bold transition-all duration-200"
                                  id={`close-trade-${trade.id}`}
                                >
                                  Close
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Historic Trade Tracker */}
            {closedTrades.length > 0 && (
              <div className="lg:col-span-12 flex flex-col gap-4 animate-fadeIn">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                  <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-3">Closed Simulation History</h3>
                  <div className="overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-400">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-2.5">Position Specs</th>
                          <th className="py-2.5">Open Price</th>
                          <th className="py-2.5">Close Price</th>
                          <th className="py-2.5 text-right">Resulting Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {closedTrades.map((hist, idx) => {
                          const win = hist.profit >= 0;
                          return (
                            <tr key={idx} className="hover:bg-white/2">
                              <td className="py-2.5 font-bold">
                                <span className={win ? "text-green-400" : "text-red-400"}>{hist.type}</span> {hist.pair} ({hist.lotSize} standard lots)
                              </td>
                              <td className="py-2.5 font-mono">{hist.openPrice}</td>
                              <td className="py-2.5 font-mono">{hist.closePrice}</td>
                              <td className={`py-2.5 font-mono font-bold text-right ${win ? "text-green-400" : "text-red-400"}`}>
                                {win ? "+" : ""}${hist.profit.toFixed(2)} USD
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 3: AI TUTOR MENTOR TALK */}
        {activeTab === "tutor" && (
          !isAcademyRegistered ? (
            renderGateWall("AI Trading Mentor Sessions", "Unlock our deep conversational AI mentor assistant to ask arbitrary trading queries, evaluate custom spread ratios, or receive personalized portfolio checks.")
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl flex flex-col gap-5 xl:h-[600px] animate-fadeIn" id="tutor-view">
            
            {/* Header branding details of AI */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-xl shadow-blue-500/20">
                  <Sparkles className="w-5 h-5" id="ai-active-indicator" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-extrabold text-sm text-white">ForexMentor Studio</h3>
                    {isMentorLicensed ? (
                      <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded shadow-sm">Premium License <span className="hidden sm:inline">Active</span></span>
                    ) : (
                      <span className="text-[9px] uppercase font-semibold text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded">Standard Free</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    Direct Server-Side Gemini LLM active
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setTutorMessages([
                  { role: "model", text: "💬 Chat history wiped clean. Ask me anything about pips, leverage, margins, or risk limits!" }
                ])}
                className="text-slate-500 hover:text-white p-2 text-xs border border-white/5 rounded-lg hover:bg-white/5"
                title="Wipe current conversational states"
                id="wipe-conversation"
              >
                Clear Chats
              </button>
            </div>

            {/* Splitting view on large screens for quick helper guides alongside Chat bubbles */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-hidden">
              
              {/* Left Column: Preset instant recommendation buttons */}
              <div className="lg:col-span-4 flex flex-col gap-4.5 bg-white/2 border border-white/5 p-4 rounded-xl text-xs overflow-y-auto">
                <div>
                  <h4 className="font-bold text-white mb-1">Recommended Quick-Asks</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Beginners often struggle with standard forex mathematical rules. Toggle any to load answers instantly:</p>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => askTutorPreset("Can you explain what a PIP is using airport foreign exchange cash as an analogy?")}
                    className="w-full text-left p-3 rounded-lg border border-white/5 bg-slate-900/45 hover:border-slate-800 text-slate-300 hover:text-white duration-200"
                  >
                    💡 "Airport Cash" Pip analogy
                  </button>
                  <button 
                    onClick={() => askTutorPreset("How does JPY pip arithmetic work differently from EUR/USD standard pairs?")}
                    className="w-full text-left p-3 rounded-lg border border-white/5 bg-slate-900/45 hover:border-slate-800 text-slate-300 hover:text-white duration-200"
                  >
                    📈 Japanese Yen (JPY) pip calculation exception
                  </button>
                  <button 
                    onClick={() => askTutorPreset("Why is leverage considered a double-edged sword? Show standard mathematical risk examples comparing 1:1 and 1:100 leverage.")}
                    className="w-full text-left p-3 rounded-lg border border-white/5 bg-slate-900/45 hover:border-slate-800 text-slate-300 hover:text-white duration-200"
                  >
                    🔥 Leverage: Standard comparison study
                  </button>
                  <button 
                    onClick={() => askTutorPreset("What is position margin, and how do I prevent the feared margin call?")}
                    className="w-full text-left p-3 rounded-lg border border-white/5 bg-slate-900/45 hover:border-slate-800 text-slate-300 hover:text-white duration-200"
                  >
                    🛡️ Positioning margins & preventing liquidations
                  </button>
                </div>

                {isMentorLicensed ? (
                  <div className="text-[11px] text-amber-300 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 mt-auto leading-relaxed space-y-1 shadow-inner animate-fadeIn">
                    <div className="flex items-center gap-1 font-extrabold text-[12px] text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" /> Premium Mentor Active
                    </div>
                    <div>Your student profile is linked to unrestricted Gemini API cycles, deeper margin heuristics, and optimized real-time alerts.</div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-blue-500/5 p-3.5 rounded-xl border border-blue-500/10 mt-auto leading-relaxed flex flex-col gap-2 animate-fadeIn">
                    <div className="text-slate-350 font-bold">💡 Unlock Professional AI Companion</div>
                    <span>Unlocks personalized broker advisory feedback loops and unrestricted syllabus explanation parameters.</span>
                    <button
                      onClick={() => {
                        setPaymentPurpose("mentor_license");
                        setPaymentAmount(40);
                        setActiveTab("payments");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-1.5 px-3 rounded-lg text-center cursor-pointer transition-colors text-[10px]"
                    >
                      Activate Premium Mentor ($40)
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Screen area */}
              <div className="lg:col-span-8 flex flex-col justify-between border-l border-white/5 pl-0 lg:pl-6 h-[400px] lg:h-auto overflow-hidden">
                
                {/* Scrollable messages panel */}
                <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin">
                  {tutorMessages.map((msg, index) => {
                    const isTutor = msg.role === "model";
                    return (
                      <div key={index} className={`flex ${isTutor ? "justify-start" : "justify-end"} anim-pop`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${isTutor ? "bg-white/5 border border-white/10 text-slate-200" : "bg-blue-500 text-white shadow-md shadow-blue-500/10"}`}>
                          
                          {/* Formatting helper parsed locally for elegant rendering */}
                          <div className="whitespace-pre-line proset">
                            {msg.text}
                          </div>

                          {isTutor && msg.isOffline && (
                            <div className="mt-2 pt-1 border-t border-white/10 text-[9px] text-[#f59e0b] font-semibold">
                              💡 Offline demo mode active (Gemini fallback lessons loaded)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {tutorLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-300"></span>
                          <span>Tutor is formulating analogy...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input writing tray */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    triggerTutorQuery();
                  }}
                  className="bg-[#020617] border border-white/10 p-1.5 rounded-xl flex items-center justify-between gap-2"
                >
                  <input 
                    type="text" 
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder="Ask standard questions (such as 'pips math helper' or 'airport limits')..."
                    className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500 text-white"
                    disabled={tutorLoading}
                    id="tutor-chat-input"
                  />
                  <button 
                    type="submit" 
                    disabled={tutorLoading || !tutorInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 text-white p-2 rounded-lg cursor-pointer transition-colors"
                    id="submit-tutor-message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>

            </div>

          </div>
          )
        )}

        {/* VIEW 4: INTERACTIVE EXAMS (QUIZZES) */}
        {activeTab === "quiz" && (
          !isAcademyRegistered ? (
            renderGateWall("Interactive Certification Exams", "Unlock the verified Sandbox Exam Center to evaluate your knowledge across basic terminology, high-leverage positions, and micro-lot sizes.")
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-xl flex flex-col gap-6 animate-fadeIn" id="quiz-view">
            
            {/* Exam syllabus selector tab row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-extrabold text-base text-white">Interactive Certification Exam</h3>
                <p className="text-xs text-slate-400 mt-0.5">Choose your testing topic and evaluate your absolute trade readiness!</p>
                {isExamRegistered ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full shadow-inner animate-pulse">
                      <Award className="w-3.5 h-3.5 text-amber-450" /> Certified Registrant Profile Active
                    </span>
                    <span className="text-[10px] text-slate-505 font-mono">ID: certified-fxf-{(10234 + fundingTransactions.length * 21).toString()}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      Standard Mock Access
                    </span>
                    <button
                      onClick={() => {
                        setPaymentPurpose("exam_fee");
                        setPaymentAmount(25);
                        setActiveTab("payments");
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline transition-colors cursor-pointer"
                    >
                      Pay Certificate Exam Registration Fee to Unlock Verifiable Badge ($25)
                    </button>
                  </div>
                )}
              </div>

              {/* Selector buttons targeting the active lessons */}
              <div className="flex flex-wrap gap-2 text-xs">
                {FOREX_LESSONS.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLoadQuiz(lesson.id)}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all duration-300 ${activeQuizCategory === lesson.id ? "bg-blue-500 border-blue-400 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"}`}
                    id={`quiz-tab-${lesson.id}`}
                  >
                    {lesson.title.slice(3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Screen Display */}
            {quizLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <span className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin"></span>
                <span className="text-xs text-slate-400">Writings active exam formulas via Gemini...</span>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 py-4">
                
                {/* Question Score status indicators */}
                {!quizCompleted ? (
                  <>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span className="font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider text-[9px]">
                        Testing In Progress
                      </span>
                      <span>
                        Question <span className="text-white font-bold">{currentQuizIndex + 1}</span> of <span className="text-white font-bold">{quizQuestions.length}</span>
                      </span>
                    </div>

                    {/* Active Question Title banner */}
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-5">
                      <h4 className="text-base font-extrabold text-white leading-relaxed">
                        {quizQuestions[currentQuizIndex].question}
                      </h4>
                    </div>

                    {/* Radio selector Option blocks */}
                    <div className="space-y-3">
                      {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                        const isSelected = selectedAnswerIndex === idx;
                        const isCorrectAnswer = quizQuestions[currentQuizIndex].correctIndex === idx;
                        
                        let optionStyle = "bg-white/2 border-white/5 hover:bg-white/5 hover:border-slate-700 text-slate-300";
                        if (isSelected && !quizAnswered) {
                          optionStyle = "bg-blue-500/10 border-blue-500/30 text-blue-300";
                        } else if (quizAnswered) {
                          if (isCorrectAnswer) {
                            optionStyle = "bg-green-500/10 border-green-500/30 text-green-300";
                          } else if (isSelected) {
                            optionStyle = "bg-red-500/10 border-red-500/30 text-red-300";
                          } else {
                            optionStyle = "bg-white/2 border-white/5 opacity-40 text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(idx)}
                            disabled={quizAnswered}
                            className={`w-full text-left p-4 rounded-xl border font-semibold text-xs transition-all duration-200 flex items-center justify-between gap-3 ${optionStyle}`}
                            id={`option-button-${idx}`}
                          >
                            <span>{option}</span>
                            <span className="shrink-0 font-mono text-xs opacity-50 uppercase tracking-widest text-right">
                              {sIdxToLetter(idx)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Progress feedback explanation */}
                    {quizAnswered && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 anim-pop">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {selectedAnswerIndex === quizQuestions[currentQuizIndex].correctIndex ? (
                            <span className="text-green-400 flex items-center gap-1">✔ Correct Answer!</span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">❌ Incorrect selection.</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {quizQuestions[currentQuizIndex].explanation}
                        </p>
                      </div>
                    )}

                    {/* Action flow controllers */}
                    <div className="flex justify-end pt-2">
                      {!quizAnswered ? (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={selectedAnswerIndex === null}
                          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 py-3 px-6 rounded-xl font-bold text-xs hover:scale-102 active:scale-98 cursor-pointer transition-all duration-200 text-white shadow-lg"
                          id="submit-answer-trigger"
                        >
                          Submit Chosen Answer
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="bg-white text-slate-900 hover:bg-slate-200 py-3 px-6 rounded-xl font-bold text-xs hover:scale-102 active:scale-98 cursor-pointer transition-all duration-200"
                          id="next-question-trigger"
                        >
                          {currentQuizIndex + 1 < quizQuestions.length ? "Proceed Next Question" : "Review Exam Results"}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  // Quiz completed view
                  <div className="py-8 flex flex-col items-center justify-center gap-6 text-center anim-pop" id="quiz-complete-stage">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-400">
                      <Award className="w-9 h-9" />
                    </div>

                    <div>
                      <h4 className="text-2xl font-black text-white">Exam Series Complete!</h4>
                      <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                        You scored <span className="font-bold text-white text-sm">{quizScore}</span> correct out of <span className="font-semibold text-white text-sm">{quizQuestions.length}</span> questions in the <span className="text-blue-400 uppercase font-bold text-[11px]">{activeQuizCategory}</span> syllabus topic.
                      </p>
                    </div>

                    {/* Certificate grade level */}
                    <div className="bg-[#020617]/50 rounded-2xl p-5 border border-white/5 max-w-md w-full text-xs">
                      {quizScore === quizQuestions.length ? (
                        <div className="space-y-1">
                          <div className="font-bold text-emerald-400 text-sm">Perfect Score! 🌟</div>
                          <p className="text-slate-400 leading-relaxed mt-1">Excellent understanding of standard margins, pips conversion scales, and technical risk barriers. Move on to live simulated positions!</p>
                        </div>
                      ) : quizScore >= 2 ? (
                        <div className="space-y-1">
                          <div className="font-bold text-blue-400 text-sm">Passed! 📈</div>
                          <p className="text-slate-400 leading-relaxed mt-1">Good grasp of terminology. Consider reviewing the pips calculators or talk to the AI tutor on concepts you missed!</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-bold text-amber-400 text-sm">Incomplete understanding 💡</div>
                          <p className="text-slate-400 leading-relaxed mt-1">Forex math takes some regular practice. Read through the lessons again or look up analog summaries inside the Academy tab.</p>
                        </div>
                      )}
                    </div>

                    {/* Official certificate printout layout */}
                    {isExamRegistered ? (
                      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-amber-500/30 text-center max-w-md w-full space-y-4 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
                        <span className="text-[9px] font-extrabold text-amber-400 tracking-widest uppercase block font-mono">Verifiable Graduation Certificate</span>
                        <div className="text-white text-base font-serif italic">This certifies that</div>
                        <div className="text-lg font-bold text-slate-100 tracking-tight">{cardName || "Benedict Kaloki"}</div>
                        <div className="text-[11px] text-slate-350 leading-relaxed max-w-xs mx-auto">
                          has successfully satisfied the standard registration compliance criteria and completed the FX Fluent Academy Certification Exam in <span className="text-blue-400 uppercase font-bold text-[10px]">{activeQuizCategory}</span> syllabus module with a grade performance of <span className="text-white font-bold">{Math.round((quizScore / quizQuestions.length) * 100)}%</span>.
                        </div>
                        <div className="flex justify-between items-end pt-4 border-t border-white/10 text-[9px] text-slate-500 font-mono">
                          <span className="text-left font-semibold">Authorized: Forex Tutor</span>
                          <span className="text-right font-semibold">License ID: FXF-{(10234 + fundingTransactions.length * 21).toString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/2 border border-dashed border-white/10 p-5 rounded-xl max-w-md w-full text-center space-y-2">
                        <div className="text-xs font-bold text-slate-350">💡 Standard Mock Certificate Locked</div>
                        <p className="text-[11px] text-slate-450 leading-relaxed">
                          You passed the exam, but did not register. Pay the certificate registration fee to generate your signed certificate, official license code, and graduation badge!
                        </p>
                        <button
                          onClick={() => {
                            setPaymentPurpose("exam_fee");
                            setPaymentAmount(25);
                            setActiveTab("payments");
                          }}
                          className="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-[10px] font-bold py-1.5 px-3 rounded-lg border border-blue-500/20 cursor-pointer text-center"
                        >
                          Unlock Official Certificate ($25)
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleLoadQuiz(activeQuizCategory)}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs py-2.5 px-4 rounded-xl font-bold transition-colors text-white"
                        id="retry-quiz"
                      >
                        Try This Exam Again
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPairSymbol("EUR/USD");
                          setActiveTab("simulator");
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-xs py-2.5 px-4 rounded-xl font-bold text-white shadow"
                        id="quiz-complete-to-sandbox"
                      >
                        Practice Inside Simulator
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No quiz sheets are active right now. Choose a topic syllabus at the top header list!
              </div>
            )}
          </div>
          )
        )}

        {/* VIEW 5: FOREX MANAGER PAYMENTS & FUNDING TERMINAL */}
        {activeTab === "payments" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="payments-view">
            
            {/* Left Column: Interactive Simulated Terminal */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-20%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 mb-5">
                  <Wallet className="w-5.5 h-5.5 text-emerald-400" />
                  <div>
                    <h3 className="font-extrabold text-white text-base">Manager Funding & Payment Gateway</h3>
                    <p className="text-xs text-slate-400">Initiate direct transfers to the Forex Manager sandbox receiver (+254759722562)</p>
                  </div>
                </div>

                {/* Simulated Payment Flow Control Panel */}
                {paymentStep === "idle" && (
                  <div className="space-y-5">
                    {/* Select Purpose of Payment */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">1. Select Payment Type</label>
                      <div className="grid grid-cols-2 gap-2 bg-white/2 p-1 rounded-xl border border-white/5">
                        <button
                          onClick={() => {
                            setPaymentPurpose("funding");
                            setPaymentAmount(100);
                          }}
                          className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${paymentPurpose === "funding" ? "bg-white/10 text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-white"}`}
                        >
                          💸 Trading Deposit
                        </button>
                        <button
                          onClick={() => {
                            setPaymentPurpose("exam_fee");
                            setPaymentAmount(25);
                          }}
                          className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${paymentPurpose !== "funding" ? "bg-white/10 text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-white"}`}
                        >
                          🎓 Registration Fees
                        </button>
                      </div>
                    </div>

                    {/* Registration Fee package selector */}
                    {paymentPurpose !== "funding" && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Section A: Class of Trade Licenses */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-extrabold text-[#94a3b8] uppercase tracking-widest font-mono">
                            🏆 Class of Trade License Fees (KSh 100 - KSh 10,000)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("class_novice");
                                setPaymentAmount(0.77);  // 100 / 130
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-32 ${paymentPurpose === "class_novice" ? "bg-amber-500/10 border-amber-500/40 text-white ring-1 ring-amber-500/20" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                            >
                              <div>
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  🌱 Novice Class
                                </span>
                                <span className="text-[9px] text-slate-450 leading-tight mt-1 mb-2 block">Micro-lot sizing controls</span>
                              </div>
                              <div className="flex flex-col mt-auto">
                                <span className="font-mono text-xs font-bold text-amber-400">KSh 100</span>
                                <span className="text-[8px] text-slate-500 font-mono">~$0.77 USD</span>
                                {isNoviceRegistered && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase">✓ Paid</span>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("class_standard");
                                setPaymentAmount(7.69);  // 1000 / 130
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-32 ${paymentPurpose === "class_standard" ? "bg-blue-500/10 border-blue-500/40 text-white ring-1 ring-blue-500/20" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                            >
                              <div>
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  📈 Retail Class
                                </span>
                                <span className="text-[9px] text-slate-450 leading-tight mt-1 mb-2 block">Standard retail trading tier</span>
                              </div>
                              <div className="flex flex-col mt-auto">
                                <span className="font-mono text-xs font-bold text-blue-400">KSh 1,000</span>
                                <span className="text-[8px] text-slate-500 font-mono">~$7.69 USD</span>
                                {isStandardRegistered && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase">✓ Paid</span>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("class_pro");
                                setPaymentAmount(38.46);  // 5000 / 130
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-32 ${paymentPurpose === "class_pro" ? "bg-indigo-500/10 border-indigo-500/40 text-white ring-1 ring-indigo-500/20" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                            >
                              <div>
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  🔥 Pro VIP Class
                                </span>
                                <span className="text-[9px] text-slate-450 leading-tight mt-1 mb-2 block">Exotics spread discounts</span>
                              </div>
                              <div className="flex flex-col mt-auto">
                                <span className="font-mono text-xs font-bold text-indigo-400">KSh 5,000</span>
                                <span className="text-[8px] text-slate-500 font-mono">~$38.46 USD</span>
                                {isProRegistered && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase">✓ Paid</span>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("class_hedge");
                                setPaymentAmount(76.92);  // 10000 / 130
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-32 ${paymentPurpose === "class_hedge" ? "bg-emerald-500/10 border-emerald-500/40 text-white ring-1 ring-emerald-500/20" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                            >
                              <div>
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  🏛️ Hedge Class
                                </span>
                                <span className="text-[9px] text-slate-450 leading-tight mt-1 mb-2 block">Institutional zero-latency rules</span>
                              </div>
                              <div className="flex flex-col mt-auto">
                                <span className="font-mono text-xs font-bold text-emerald-400">KSh 10,000</span>
                                <span className="text-[8px] text-slate-500 font-mono">~$76.92 USD</span>
                                {isHedgeRegistered && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase">✓ Paid</span>
                                )}
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Section B: Academic Utilities */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-extrabold text-[#94a3b8] uppercase tracking-widest font-mono">
                            🎓 Educational & Companion Utilities
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("academy_enroll");
                                setPaymentAmount(2.31);
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${paymentPurpose === "academy_enroll" ? "bg-pink-500/10 border-pink-500/40 text-white ring-1 ring-pink-500/25" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                              id="pay-opt-academy-enroll"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  🏫 Academy Enrollment
                                </span>
                                <span className="text-[9px] text-[#94a3b8] leading-tight mt-1 mb-2 block">Unlocks all curriculum & tutors</span>
                              </div>
                              <div className="mt-auto">
                                <span className="font-mono text-xs font-bold text-pink-400">KSh 300</span>
                                <span className="text-[8px] text-slate-500 block">~$2.31 USD</span>
                                {isAcademyRegistered && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase block">✓ Paid & Active</span>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("exam_fee");
                                setPaymentAmount(25);
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${paymentPurpose === "exam_fee" ? "bg-blue-500/10 border-blue-500/40 text-white ring-1 ring-blue-500/25" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                              id="pay-opt-exam-fee"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  📜 Certification Exam
                                </span>
                                <span className="text-[9px] text-slate-450 leading-tight mt-1 mb-2 block">Graduation & digital badge</span>
                              </div>
                              <div className="mt-auto">
                                <span className="font-mono text-xs font-bold text-blue-400">KSh 3,250</span>
                                <span className="text-[8px] text-slate-500 block">~$25.00 USD</span>
                                {isExamRegistered && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase block">✓ Paid</span>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("mentor_license");
                                setPaymentAmount(40);
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${paymentPurpose === "mentor_license" ? "bg-indigo-500/10 border-indigo-500/40 text-white ring-1 ring-indigo-500/25" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                              id="pay-opt-mentor-license"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  🌟 AI Mentor Pro
                                </span>
                                <span className="text-[9px] text-slate-450 leading-tight mt-1 mb-2 block">Active voice heuristics coach</span>
                              </div>
                              <div className="mt-auto">
                                <span className="font-mono text-xs font-bold text-indigo-400">KSh 5,200</span>
                                <span className="text-[8px] text-slate-500 block">~$40.00 USD</span>
                                {isMentorLicensed && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase block">✓ Paid</span>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPaymentPurpose("broker_reg");
                                setPaymentAmount(15);
                              }}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${paymentPurpose === "broker_reg" ? "bg-emerald-500/10 border-emerald-500/40 text-white ring-1 ring-emerald-500/25" : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300"}`}
                              id="pay-opt-broker-reg"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] block text-white flex items-center gap-1">
                                  🏛️ Broker Setup
                                </span>
                                <span className="text-[9px] text-slate-450 leading-tight mt-1 mb-2 block">Standard broker compliance layout</span>
                              </div>
                              <div className="mt-auto">
                                <span className="font-mono text-xs font-bold text-emerald-400">KSh 1,950</span>
                                <span className="text-[8px] text-slate-500 block">~$15.00 USD</span>
                                {isBrokerLicensed && (
                                  <span className="text-[8px] font-bold text-green-400 mt-1 uppercase block">✓ Cleared</span>
                                )}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/5 rounded-xl">
                      <button
                        onClick={() => { setPaymentMethod("mpesa"); setStkErrorMessage(""); }}
                        className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${paymentMethod === "mpesa" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>M-Pesa Checkout</span>
                      </button>
                      <button
                        onClick={() => { setPaymentMethod("card"); setStkErrorMessage(""); }}
                        className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${paymentMethod === "card" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card Payment</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {paymentMethod === "mpesa" ? (
                        <div className="space-y-3.5 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number for STK Push</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold">+</span>
                              <input
                                type="text"
                                value={paymentPhone}
                                onChange={(e) => setPaymentPhone(e.target.value.replace(/\D/g, ""))}
                                className="w-full bg-[#030712] border border-white/10 rounded-xl py-2.5 pl-7 pr-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 font-bold"
                                placeholder="e.g. 254759722562"
                              />
                            </div>
                            <span className="block text-[10px] text-emerald-400/80 mt-1">Simulated test client triggers Safaricom STK checkout popup.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3.5 animate-fadeIn">
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cardholder Full Name</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="w-full bg-[#030712] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 font-medium"
                              placeholder="e.g. Benedict Kaloki"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Debit Card Number</label>
                            <input
                              type="text"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 "))}
                              className="w-full bg-[#030712] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 font-mono"
                              placeholder="4111 2222 3333 4444"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-[#030712] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Security Code (CVV)</label>
                            <input
                              type="password"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                              className="w-full bg-[#030712] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                              placeholder="***"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {paymentPurpose === "funding" ? "Transfer Amount (USD)" : "Selected Fee Price (USD - LOCKED)"}
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">1 USD = 130 KES</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold font-mono">$</span>
                          <input
                            type="number"
                            value={paymentAmount || ""}
                            onChange={(e) => {
                              if (paymentPurpose === "funding") {
                                setPaymentAmount(Math.max(0, parseFloat(e.target.value) || 0));
                              }
                            }}
                            disabled={paymentPurpose !== "funding"}
                            className={`w-full bg-[#030712] border border-white/10 rounded-xl py-2.5 pl-7 pr-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-550 font-bold ${paymentPurpose !== "funding" ? "opacity-60 cursor-not-allowed select-none bg-slate-900 border-white/5" : ""}`}
                            placeholder="Amount in USD"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 bg-white/2 p-2.5 rounded-lg border border-white/5">
                          <span>Equivalent in Kenyan Shillings:</span>
                          <span className="font-extrabold text-emerald-400 font-mono">KSh {getShillingsForPurpose(paymentPurpose).toLocaleString()} KES</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleInitiatePayment}
                      className={`w-full py-3.5 rounded-xl text-xs font-extrabold text-white transition-all duration-300 active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer ${paymentPurpose !== "funding" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10 border border-indigo-500" : paymentMethod === "mpesa" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 border border-emerald-400" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/10 border border-blue-400"}`}
                      id="submit-sandbox-payment"
                    >
                      <span>
                        {paymentPurpose === "funding" 
                          ? `Simulate ${paymentMethod === "mpesa" ? "M-Pesa STK" : "Debit Card"} Deposit`
                          : `Register for ${
                              paymentPurpose === "class_novice" ? "Micro/Novice Class of Trade" :
                              paymentPurpose === "class_standard" ? "Standard Retail Class of Trade" :
                              paymentPurpose === "class_pro" ? "Professional/VIP Class of Trade" :
                              paymentPurpose === "class_hedge" ? "Elite Institutional Hedge Class" :
                              paymentPurpose === "exam_fee" ? "Certification Exam" :
                              paymentPurpose === "mentor_license" ? "AI Mentor Pro" :
                              paymentPurpose === "academy_enroll" ? "Academy Course Enrollment" : "Broker Setup"
                            }`
                        }
                      </span>
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* STK Pending State */}
                {paymentStep === "stk_pending" && (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping opacity-60"></div>
                      <Coins className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-white text-sm">Initiating Daraja STK Push Request</h4>
                      <p className="text-xs text-slate-400 max-w-sm">Generating API payloads for phone network +{paymentPhone}... Requesting remote authorization parameters...</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider animate-pulse">POST /oauth/v1/generate_token ...</span>
                  </div>
                )}

                {/* PIN verification State on Simulated Phone Screen */}
                {paymentStep === "pin_verification" && (
                  <div className="flex flex-col items-center py-4">
                    
                    {/* Retro Simulated Safaricom M-Pesa Phone Screen */}
                    <div className="w-72 bg-slate-950 border border-slate-800 rounded-3xl p-4 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                      
                      {/* Phone top notch */}
                      <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></span>
                        <span className="w-4 h-1 bg-slate-800 rounded"></span>
                      </div>

                      <div className="bg-[#1e3a1e]/15 border border-emerald-500/20 rounded-xl p-3 text-center space-y-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400">M-Pesa Safe Checkout</span>
                        <p className="text-[11px] text-slate-200 leading-tight">
                          Pay <span className="text-emerald-300 font-extrabold">KSh {getShillingsForPurpose(paymentPurpose).toLocaleString()}</span> to <span className="text-white font-bold">Forex Manager receiver +{paymentPhone}</span>?
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] text-slate-450 uppercase tracking-wider text-center font-bold">Enter Operator SIM-PIN</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={simulatedPin}
                          onChange={(e) => setSimulatedPin(e.target.value.replace(/\D/g, ""))}
                          className="w-32 bg-[#050b05] border border-emerald-500/30 rounded-lg py-2 text-center text-sm font-bold tracking-widest text-emerald-400 mx-auto block focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder="••••"
                        />
                        {pinError && (
                          <p className="text-[9px] text-red-400 text-center leading-tight mx-auto max-w-[200px]">{pinError}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={handleResetPaymentPortal}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] py-2 rounded-lg font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleVerifyMpesaPin}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] py-2 rounded-lg font-bold"
                        >
                          Approve STK
                        </button>
                      </div>
                    </div>

                    <div className="text-center mt-4 space-y-1">
                      <p className="text-xs text-slate-300">📱 Mobile Push simulation interactive simulator activated.</p>
                      <p className="text-[10px] text-slate-400">Type any 4 digits (such as <kbd className="bg-white/5 border border-white/5 font-mono px-1 py-0.5 rounded text-[9px]">1234</kbd>) and click Approve to settle virtual funds.</p>
                    </div>
                  </div>
                )}

                {/* Processing Settle state */}
                {paymentStep === "processing" && (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">Processing Transaction Ledgers</h4>
                      <p className="text-xs text-slate-400">Signing smart settlement contract parameters... Syncing student demo banks database.</p>
                    </div>
                  </div>
                )}

                {/* Success Receipt State */}
                {paymentStep === "success" && (
                  <div className="space-y-5 py-2 animate-fadeIn">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-[#10b981] text-base">Payment Processed Successfully</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {fundingTransactions[0]?.purpose === "funding"
                          ? "Virtual funds cleared and settled in full. Thank you for replenishing your learning sandbox trading capital!"
                          : "Educational fee cleared. Your registered profile status has been unlocked and synchronized successfully!"
                        }
                      </p>
                    </div>

                    {/* Receipt Body */}
                    <div className="bg-[#030712] border border-white/10 rounded-2xl p-4 text-xs space-y-3 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Receipt Invoice ID</span>
                        <span className="text-slate-350 font-bold">{fundingTransactions[0]?.id || "TX-MOCK8921"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Method Type</span>
                        <span className="text-slate-350 capitalize font-bold">{fundingTransactions[0]?.method || "mpesa"} {fundingTransactions[0]?.method === "mpesa" ? "STK" : "Gateway"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-505">Fee/Capital Purpose</span>
                        <span className="text-indigo-400 font-bold text-right max-w-[180px] truncate">{fundingTransactions[0]?.pkgName || "Registration Fee"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500">Total KES Transfer</span>
                        <span className="text-emerald-400 font-extrabold">KSh {(paymentAmount * 130).toLocaleString()} KES</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-500">
                          {fundingTransactions[0]?.purpose === "funding" ? "Credited Sim Capital" : "Registration Status"}
                        </span>
                        <span className="text-blue-400 font-extrabold">
                          {fundingTransactions[0]?.purpose === "funding" ? `$${paymentAmount.toFixed(2)} USD` : "PAID & CLEARED ✔"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleResetPaymentPortal}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs py-2.5 rounded-xl text-slate-300 font-bold"
                      >
                        New Payment
                      </button>
                      <button
                        onClick={() => setActiveTab("simulator")}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-xs py-2.5 rounded-xl text-white font-bold transition-all"
                      >
                        Trade with New Funds
                      </button>
                    </div>
                  </div>
                )}

                {/* Error status state */}
                {paymentStep === "error" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">Transfer Initiation Failed</h4>
                      <p className="text-xs text-red-300 leading-relaxed font-medium">{stkErrorMessage}</p>
                    </div>
                    <button
                      onClick={handleResetPaymentPortal}
                      className="bg-white/5 hover:bg-white/10 px-5 py-2 rounded-xl text-xs font-bold text-slate-300 border border-white/10 mt-2"
                    >
                      Retry Settle Configuration
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Transaction History Matrix & API Spec Sheet */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Transactions Record Ledger list */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2.5">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Transfer Ledger</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Real-time simulator updates</span>
                </div>

                <div className="space-y-3.5 max-h-[180px] overflow-y-auto">
                  {fundingTransactions.map((tx) => (
                    <div key={tx.id} className="bg-white/2 hover:bg-white/4 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-2.5 transition">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${tx.method === "mpesa" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                            {tx.method} STK
                          </span>
                          <span className="font-mono text-[9px] text-slate-500 truncate">{tx.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono font-medium truncate">{tx.phoneOrCard}</div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">{tx.timestamp}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-white text-xs">+${tx.amountUsd.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-medium">KSh {tx.amountKes.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Integration Guideline Code Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl relative">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2 mb-3.5">
                  Safaricom Daraja API Implementation Note
                </h3>

                <p className="text-[11px] text-slate-450 leading-normal mb-3">
                  This payments tab renders a real-time responsive mock checkout flow to emulate sending funds. For <strong>live production operations</strong>, developers invoke Safaricom's **Daraja API Express STK Push** payload schema. To secure these endpoints and restrict client-side access, implement the proxy endpoint server-side as follow:
                </p>

                {/* API JSON payload view snippet */}
                <div className="bg-black/45 border border-white/5 rounded-xl p-3 font-mono text-[9px] text-slate-350 space-y-1 overflow-x-auto leading-relaxed">
                  <div className="text-amber-400">// server.ts Endpoint snippet (Safaricom STK API)</div>
                  <div><span className="text-blue-400">app</span>.<span className="text-emerald-400">post</span>(<span className="text-green-300">"/api/mpesa-stk"</span>, <span className="text-purple-400">async</span> (req, res) =&gt; &#123;</div>
                  <div className="pl-3.5"><span className="text-purple-400">const</span> accessToken = <span className="text-purple-400">await</span> <span className="text-emerald-400">fetchMpesaToken</span>();</div>
                  <div className="pl-3.5"><span className="text-purple-400">const</span> stkUrl = <span className="text-green-300">"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"</span>;</div>
                  <div className="pl-3.5"><span className="text-purple-400">const</span> payload = &#123;</div>
                  <div className="pl-7"><span className="text-blue-400">BusinessShortCode</span>: process.env.MPESA_SHORTCODE,</div>
                  <div className="pl-7"><span className="text-blue-400">Amount</span>: req.body.amountKes,</div>
                  <div className="pl-7"><span className="text-blue-400">PhoneNumber</span>: req.body.phone, <span className="text-slate-500">// {paymentPhone}</span></div>
                  <div className="pl-7"><span className="text-blue-400">CallBackURL</span>: <span className="text-green-300">"https://my-app.com/api/stk-callback"</span></div>
                  <div className="pl-3.5">&#125;;</div>
                  <div>&#125;);</div>
                </div>

                <div className="mt-3 bg-white/2 p-2.5 rounded-lg border border-white/5 space-y-1 text-[10px] text-slate-400">
                  <p className="font-bold text-slate-300">API Gateway Parameters required in .env:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li><code className="text-[9px] text-emerald-400">MPESA_CONSUMER_KEY</code> - Daraja developer key</li>
                    <li><code className="text-[9px] text-emerald-400">MPESA_CONSUMER_SECRET</code> - Daraja developer secret</li>
                    <li><code className="text-[9px] text-emerald-400">MPESA_SHORTCODE</code> - Paybill or Till number</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 6: REAL-TIME FOREX NEWS FEED & ECONOMIC CALENDAR */}
        {activeTab === "news" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="news-calendar-view">
            
            {/* LEFT SIDE: Forex News Terminal (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Terminal Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/25 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">FX News Network</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">Macroeconomic News Feed</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      Real-time market intelligence, global central bank releases, and consumer price indices. Volatility triggers automatically adjust Sandbox trading prices.
                    </p>
                  </div>
                  
                  {/* Market Sentiment Overview widgets */}
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl backdrop-blur-md">
                    <Activity className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Terminal Vibe</div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="text-emerald-400">Moderately Bullish</span>
                        <span className="text-[10px] text-slate-400 font-normal">(USD Dominant)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters bar */}
              <div className="bg-slate-900/60 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
                
                {/* Search input field */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Newspaper className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="Search headlines or assets..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all duration-300"
                  />
                  {newsSearch && (
                    <button onClick={() => setNewsSearch("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-[10px]" id="clear-news-search">
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter tags controls */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg">
                    <button
                      onClick={() => setNewsImpactFilter("ALL")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${newsImpactFilter === "ALL" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      All Impact
                    </button>
                    <button
                      onClick={() => setNewsImpactFilter("HIGH")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${newsImpactFilter === "HIGH" ? "bg-red-500/20 text-red-300 border border-red-500/20" : "text-slate-400 hover:text-red-400"}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      High
                    </button>
                    <button
                      onClick={() => setNewsImpactFilter("MEDIUM")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${newsImpactFilter === "MEDIUM" ? "bg-amber-500/20 text-amber-300 border border-amber-500/20" : "text-slate-400 hover:text-amber-400"}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Med
                    </button>
                  </div>

                  <select
                    value={newsCategoryFilter}
                    onChange={(e) => setNewsCategoryFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Topics</option>
                    <option value="central-banks">Central Banks</option>
                    <option value="inflation">Inflation & CPI</option>
                    <option value="employment">Employment</option>
                    <option value="geopolitics">Geopolitics</option>
                    <option value="technical">Technical Breakouts</option>
                  </select>
                </div>
              </div>

              {/* News list items */}
              <div className="flex flex-col gap-3.5" id="news-stories-container">
                {newsFeed
                  .filter(item => {
                    const matchesSearch = item.headline.toLowerCase().includes(newsSearch.toLowerCase()) || 
                                          item.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
                                          item.source.toLowerCase().includes(newsSearch.toLowerCase());
                    const matchesImpact = newsImpactFilter === "ALL" || item.impact === newsImpactFilter;
                    const matchesCat = newsCategoryFilter === "ALL" || item.category === newsCategoryFilter;
                    return matchesSearch && matchesImpact && matchesCat;
                  })
                  .map((story) => {
                    const isHighImpact = story.impact === "HIGH";
                    const isMedImpact = story.impact === "MEDIUM";
                    
                    // Sentiment specific colorings
                    const sentimentColors = 
                      story.sentiment === "BULLISH" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                      story.sentiment === "BEARISH" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                      "text-slate-400 bg-slate-500/10 border-slate-500/20";

                    return (
                      <div 
                        key={story.id}
                        className="bg-slate-900 border border-white/10 transition-all duration-300 rounded-xl p-4 hover:border-white/20 hover:bg-slate-900/90 relative overflow-hidden group"
                        id={`story-card-${story.id}`}
                      >
                        {/* High Impact Left Accent Alert Ribbon */}
                        {isHighImpact && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500 animate-pulse"></div>
                        )}
                        {isMedImpact && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500"></div>
                        )}

                        <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">{story.source}</span>
                            <span className="text-[10px] text-slate-400 font-mono">• {story.timestamp}</span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${sentimentColors}`}>
                              {story.sentiment} Sentiment
                            </span>
                            <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                              isHighImpact ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              isMedImpact ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-slate-500/10 text-slate-400 border border-white/5"
                            }`}>
                              {story.impact} Impact
                            </span>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
                          {story.headline}
                        </h3>

                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {story.summary}
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-semibold text-slate-400">Target Currency:</span>
                            <span className="bg-white/5 text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/5">{story.targetCurrency}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-slate-400 italic">
                            <span>Topic Category:</span>
                            <span className="capitalize font-mono non-italic font-medium text-amber-400/80">{story.category.replace("-", " ")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {newsFeed.filter(item => {
                  const matchesSearch = item.headline.toLowerCase().includes(newsSearch.toLowerCase()) || 
                                        item.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
                                        item.source.toLowerCase().includes(newsSearch.toLowerCase());
                  const matchesImpact = newsImpactFilter === "ALL" || item.impact === newsImpactFilter;
                  const matchesCat = newsCategoryFilter === "ALL" || item.category === newsCategoryFilter;
                  return matchesSearch && matchesImpact && matchesCat;
                }).length === 0 && (
                  <div className="bg-white/2 border border-white/5 rounded-xl p-8 text-center text-xs text-slate-500">
                    No news headlines correspond to active search parameters inside this news bracket.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Economic Calendar & Shock Generator (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* LIVE ECONOMIC CALENDAR CARD */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-300">Economic Calendar</h3>
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-extrabold animate-pulse uppercase">LIVE CLOCK</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">
                  Economic calendar reports provide macro signals. When upcoming countdowns hit 0, values release live and immediately drive price impacts!
                </p>

                <div className="space-y-3" id="economic-calendar-list">
                  {economicCalendar.map((event) => {
                    const isHigh = event.importance === "HIGH";
                    const isUpcoming = event.state === "upcoming";
                    return (
                      <div 
                        key={event.id}
                        className={`p-3 rounded-xl border flex flex-col gap-2 ${
                          isUpcoming 
                            ? "bg-white/2 hover:bg-white/5 border-white/5" 
                            : "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10"
                        }`}
                        id={`calendar-event-${event.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold bg-white/5 px-2 py-0.5 rounded text-white border border-white/10">{event.currency}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              isHigh ? "bg-red-500/25 text-red-300" : "bg-slate-500/25 text-slate-300"
                            }`}>
                              {event.importance}
                            </span>
                          </div>

                          <span className={`text-[10px] font-mono font-bold ${isUpcoming ? "text-amber-400" : "text-emerald-400"}`}>
                            {isUpcoming ? event.time : "Released ✓"}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-200">
                          {event.event}
                        </div>

                        <div className="grid grid-cols-3 gap-1 pt-1.5 text-[10px] font-mono text-slate-400 border-t border-white/5">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Actual</span>
                            <span className={`font-bold ${!isUpcoming ? "text-emerald-400 text-xs" : "text-slate-500"}`}>
                              {isUpcoming ? "Pending" : event.actual}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Consensus</span>
                            <span className="font-bold text-slate-300">{event.forecast}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Previous</span>
                            <span className="font-bold text-slate-400">{event.previous}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NEWS-SHOCK VOLATILITY ENGINE SIMULATOR */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400 animate-pulse" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-300">Macro Volatility Simulator</h3>
                  </div>
                  <span className="text-[9px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded uppercase border border-red-500/20">HOT</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-normal">
                  Forex prices respond aggressively to news. Simulate a high-impact news shock event below to observe the immediate rate reaction!
                </p>

                <div className="space-y-2.5">
                  
                  {/* Trigger US Jobs Alert */}
                  <button
                    onClick={() => {
                      const shockChange = -(60 + Math.random() * 20) * 0.0001; // US Dollar spikes, reducing EURUSD
                      setCurrencyPairs(prev => prev.map(p => {
                        if (p.symbol === "EURUSD") {
                          const nextPrice = Number((p.price + shockChange).toFixed(5));
                          return {
                            ...p,
                            price: nextPrice,
                            trend: "DOWN",
                            history: [...p.history.slice(1), nextPrice]
                          };
                        }
                        if (p.symbol === "GBPUSD") {
                          const nextPrice = Number((p.price + shockChange * 1.1).toFixed(5));
                          return {
                            ...p,
                            price: nextPrice,
                            trend: "DOWN",
                            history: [...p.history.slice(1), nextPrice]
                          };
                        }
                        return p;
                      }));

                      setNewsFeed(prev => [
                        {
                          id: `shock-${Date.now()}`,
                          source: "Bloomberg Breaking",
                          headline: "US Non-Farm Payrolls Surge by 310,000, Demolishing 185K Estimate!",
                          timestamp: "Just now",
                          impact: "HIGH",
                          category: "employment",
                          sentiment: "BEARISH",
                          targetCurrency: "USD",
                          summary: "A colossal growth in employment prints across construction and finance sectors. Wage growth ticked higher to 4.4% supportive of persistent pricing structures, prompting spot traders to chase the USD rally. Major currency pairs face severe sell shocks."
                        },
                        ...prev
                      ]);

                      setSuccessNotification("⚡ US NFP Shock Triggered: USD rallied! EURUSD & GBPUSD prices plunged of current levels.");
                    }}
                    className="w-full text-left bg-white/2 hover:bg-red-500/5 hover:border-red-500/20 border border-white/5 p-2.5 rounded-xl transition duration-200 cursor-pointer text-xs group relative flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-white block">Trigger US Jobs Report Surprise</span>
                      <span className="text-[10px] text-slate-400">Non-Farm Payroll blowout (+310K) • Strong USD</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition animate-bounce" />
                  </button>

                  {/* Trigger ECB Rate Shock */}
                  <button
                    onClick={() => {
                      const shockChange = (45 + Math.random() * 15) * 0.0001; // EUR surges
                      setCurrencyPairs(prev => prev.map(p => {
                        if (p.symbol === "EURUSD") {
                          const nextPrice = Number((p.price + shockChange).toFixed(5));
                          return {
                            ...p,
                            price: nextPrice,
                            trend: "UP",
                            history: [...p.history.slice(1), nextPrice]
                          };
                        }
                        return p;
                      }));

                      setNewsFeed(prev => [
                        {
                          id: `shock-${Date.now()}`,
                          source: "Reuters Central Bank Desk",
                          headline: "ECB Announces Unexpected 25 bps Refinancing Interest Rate Hike!",
                          timestamp: "Just now",
                          impact: "HIGH",
                          category: "central-banks",
                          sentiment: "BULLISH",
                          targetCurrency: "EUR",
                          summary: "To aggressively combat service price inertia, the ECB hiked margins in a 6-2 split vote. Lagarde declared the task far from absolute, sending bonds yields flying and sparking a huge rally for the EUR."
                        },
                        ...prev
                      ]);

                      setSuccessNotification("🏛️ European Central Bank Hikes Rates! EURUSD jumped +45 pips instantly.");
                    }}
                    className="w-full text-left bg-white/2 hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-white/5 p-2.5 rounded-xl transition duration-200 cursor-pointer text-xs group relative flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-white block">Trigger ECB Sudden Rate Hike</span>
                      <span className="text-[10px] text-slate-400">Restricts policy unexpectedly • Strong EUR</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                  </button>

                  {/* Trigger UK Inflation Surprise */}
                  <button
                    onClick={() => {
                      const shockChange = -(55 + Math.random() * 15) * 0.0001; // GBPUSD drops
                      setCurrencyPairs(prev => prev.map(p => {
                        if (p.symbol === "GBPUSD") {
                          const nextPrice = Number((p.price + shockChange).toFixed(5));
                          return {
                            ...p,
                            price: nextPrice,
                            trend: "DOWN",
                            history: [...p.history.slice(1), nextPrice]
                          };
                        }
                        return p;
                      }));

                      setNewsFeed(prev => [
                        {
                          id: `shock-${Date.now()}`,
                          source: "Financial Times Live",
                          headline: "UK inflation crashes to 1.8% in April, clearing base targets early",
                          timestamp: "Just now",
                          impact: "HIGH",
                          category: "inflation",
                          sentiment: "BEARISH",
                          targetCurrency: "GBP",
                          summary: "The Office for National Statistics reports that UK inflation has slumped below BoE's core targets, clearing the track for a massive round of monetary refinancing rate cuts starting next week. Sterling sells off heavily."
                        },
                        ...prev
                      ]);

                      setSuccessNotification("📉 UK Inflation Slumps Below Target! GBPUSD plunged -55 pips on rate cut bets.");
                    }}
                    className="w-full text-left bg-white/2 hover:bg-red-500/5 hover:border-red-500/20 border border-white/5 p-2.5 rounded-xl transition duration-200 cursor-pointer text-xs group relative flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-white block">Trigger UK Inflation Meltdown</span>
                      <span className="text-[10px] text-slate-400">CPI collapses to 1.8% • Weak GBP rate cuts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition" />
                  </button>

                  {/* Trigger BoJ Hawk Intervention */}
                  <button
                    onClick={() => {
                      // USDJPY drops (meaning Yen gets stronger)
                      setCurrencyPairs(prev => prev.map(p => {
                        if (p.symbol === "USDJPY") {
                          const nextPrice = Number((p.price - 1.25).toFixed(3)); // JPY rallies heavily, so USDJPY falls
                          return {
                            ...p,
                            price: nextPrice,
                            trend: "DOWN",
                            history: [...p.history.slice(1), nextPrice]
                          };
                        }
                        return p;
                      }));

                      setNewsFeed(prev => [
                        {
                          id: `shock-${Date.now()}`,
                          source: "Nikkei Asia",
                          headline: "Bank of Japan Direct Intervention Confirmed: Massive Yen Purchase Action!",
                          timestamp: "Just now",
                          impact: "HIGH",
                          category: "central-banks",
                          sentiment: "BULLISH",
                          targetCurrency: "JPY",
                          summary: "The Ministry of Finance confirms that structural central bank purchase limits have been leveraged to protect the Yen parity boundary. Huge short-side liquidations hit USDJPY."
                        },
                        ...prev
                      ]);

                      setSuccessNotification("🇯🇵 Bank of Japan Confirms Direct Intervention! USDJPY collapsed -1.25 Yen instantly.");
                    }}
                    className="w-full text-left bg-white/2 hover:bg-blue-500/5 hover:border-blue-500/20 border border-white/5 p-2.5 rounded-xl transition duration-200 cursor-pointer text-xs group relative flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-white block">Trigger BoJ Yen Intervention</span>
                      <span className="text-[10px] text-slate-400">Ministry of Finance purchases Yen • USDJPY plunges</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
                  </button>
                  
                </div>

                <div className="bg-slate-950/45 p-2.5 rounded-lg text-[10px] text-slate-400 border border-white/5 text-center leading-normal">
                  💡 <span className="text-slate-200 font-bold">Try this out:</span> Open simulator positions in EUR or USD, navigate here and trigger a shock, then toggle back to check your position's immediate margin shift!
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Styled Footer */}
      <footer className="w-full border-t border-white/5 mt-auto bg-black/15 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Active Students</span>
              <span className="text-sm font-bold text-slate-200">2,845 Studying Now</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Session status</span>
              <span className="text-sm font-bold text-green-400">NY Market Open</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Risk Warning</span>
              <span className="text-[10px] text-slate-400">Practice only with virtual capital. Simulated positions execute virtual trades without funds.</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-medium">Join +15k students studying FX globally.</span>
            <div className="flex -space-x-2.5">
              <div className="w-7 h-7 rounded-full border-2 border-[#020617] bg-slate-500"></div>
              <div className="w-7 h-7 rounded-full border-2 border-[#020617] bg-blue-600"></div>
              <div className="w-7 h-7 rounded-full border-2 border-[#020617] bg-emerald-500"></div>
            </div>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal Dialog */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" id="shortcuts-modal-overlay">
          <div className="bg-slate-900 border border-white/15 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
            
            {/* Modal Ambient backglow glow */}
            <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Modal Title bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 z-10">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold text-white">Keyboard Shortcuts Cheat Sheet</h3>
              </div>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition duration-200 cursor-pointer"
                id="close-shortcuts-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info tip */}
            <p className="text-xs text-slate-400">
              Increase your trading flow speed within the FX Fluent Live Simulator. Use execution commands on standard keys or fast modifier pairs.
            </p>

            {/* List with keys categorisation */}
            <div className="space-y-4 py-2 text-xs overflow-y-auto max-h-[300px] z-10">
              
              <div>
                <h4 className="font-bold text-slate-400 mb-2 border-b border-white/5 pb-1">Navigation & Menus</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-medium">Switch to Academy Modules</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">1</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-medium">Switch to Live Market Sandbox</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">2</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-medium">Switch to AI Trading Mentor</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">3</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-medium">Switch to Interactive Exams</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">4</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-400 font-medium">Switch to Manager Payments</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">5</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-400 font-medium">Switch to News Terminal & economic calendar</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">6</kbd>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 mb-2 border-b border-white/5 pb-1">Simulated Trading Actions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-medium">Set simulated order to BUY</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">B</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-medium">Set simulated order to SELL</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">S</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5 bg-emerald-500/5 border-emerald-500/10">
                    <span className="text-emerald-300 font-semibold">Place Trade / Order Submission</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] text-emerald-300">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] text-emerald-300">P</kbd>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5 bg-red-500/5 border-red-500/10">
                    <span className="text-red-300 font-semibold">Close latest open position</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-red-500/20 px-1.5 py-0.5 rounded text-[10px] text-red-300">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-red-500/20 px-1.5 py-0.5 rounded text-[10px] text-red-300">C</kbd>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 mb-2 border-b border-white/5 pb-1">General Shortcuts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white/2 hover:bg-white/5 transition duration-150 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-medium">Toggle Shortcuts Cheat Sheet</span>
                    <span className="font-mono flex items-center gap-1">
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Alt</kbd>
                      <span>+</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">K</kbd>
                      <span className="text-slate-450 text-[10px] px-0.5">or</span>
                      <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">?</kbd>
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer tips */}
            <div className="border-t border-white/10 pt-3 flex justify-between items-center z-10 text-[10px] text-slate-500">
              <span>Press <kbd className="bg-white/5 border border-white/5 px-1 py-0.5 rounded text-[9px] font-mono">Esc</kbd> key to close</span>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="bg-blue-500 hover:bg-blue-600 active:scale-95 duration-150 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                id="close-shortcuts-modal-footer"
              >
                Understood, thank you!
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Helper to list letter indexes
function sIdxToLetter(i: number): string {
  if (i === 0) return "Option A";
  if (i === 1) return "Option B";
  if (i === 2) return "Option C";
  return "Option D";
}
