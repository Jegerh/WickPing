// Create this complete new file at: services/dataService.js
// This is the entire content of the new file

console.log("Loading file:", "dataService.js");

// Static reference data (will be replaced with API calls later)
const staticSymbols = [
  { value: "BTC/USD", label: "Bitcoin (BTC/USD)" },
  { value: "ETH/USD", label: "Ethereum (ETH/USD)" },
  { value: "SOL/USD", label: "Solana (SOL/USD)" },
  { value: "DOGE/USD", label: "Dogecoin (DOGE/USD)" },
  { value: "XRP/USD", label: "Ripple (XRP/USD)" },
];

const staticAccounts = [
  { value: "@elonmusk", label: "Elon Musk (@elonmusk)", platform: "twitter" },
  { value: "@michaelsaylor", label: "Michael Saylor (@michaelsaylor)", platform: "twitter" },
  { value: "@cz_binance", label: "CZ Binance (@cz_binance)", platform: "twitter" },
  { value: "@VitalikButerin", label: "Vitalik Buterin (@VitalikButerin)", platform: "twitter" },
];

const staticTimeframes = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "1d", label: "1 day" },
];

// Complete indicators registry
const staticIndicators = {
  // All indicators from your current indicatorsRegistry.js should be copied here
  "RSI": {
    id: "rsi",
    content: "RSI",
    icon: "trending_up",
    type: "indicator",
    category: "momentum",
    description: "Relative Strength Index measures the speed and change of price movements",
    conditions: [
      { value: "crossesAbove", label: "Crosses Above", requiresThreshold: true },
      { value: "crossesBelow", label: "Crosses Below", requiresThreshold: true },
      { value: "staysAbove", label: "Stays Above", requiresThreshold: true },
      { value: "staysBelow", label: "Stays Below", requiresThreshold: true },
    ],
    defaultConfig: {
      timeframe: "15m",
      condition: "crossesAbove",
      threshold: 70,
      period: 14
    },
    parameters: [
      { id: "period", label: "Period", type: "number", default: 14, min: 1, max: 100 },
      { id: "threshold", label: "Value", type: "number", default: 70, min: 0, max: 100, 
        helperText: "70+ typically overbought, 30- oversold" }
    ]
  },
  
  "MACD": {
    id: "macd",
    content: "MACD",
    icon: "show_chart",
    type: "indicator",
    category: "trend",
    description: "Moving Average Convergence Divergence identifies changes in trend strength and direction",
    conditions: [
      { value: "lineAboveSignal", label: "Line Crosses Above Signal Line" },
      { value: "lineBelowSignal", label: "Line Crosses Below Signal Line" },
      { value: "histogramPositive", label: "Histogram Becomes Positive" },
      { value: "histogramNegative", label: "Histogram Becomes Negative" },
      { value: "zeroLineAbove", label: "Crosses Above Zero Line" },
      { value: "zeroLineBelow", label: "Crosses Below Zero Line" },
    ],
    defaultConfig: {
      timeframe: "15m",
      condition: "lineAboveSignal",
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    },
    parameters: [
      { id: "fastPeriod", label: "Fast EMA Period", type: "number", default: 12, min: 1, max: 100 },
      { id: "slowPeriod", label: "Slow EMA Period", type: "number", default: 26, min: 1, max: 100 },
      { id: "signalPeriod", label: "Signal Period", type: "number", default: 9, min: 1, max: 100 }
    ]
  },
  
  "Bollinger Bands": {
    id: "bollinger",
    content: "Bollinger Bands",
    icon: "waterfall_chart",
    type: "indicator",
    category: "volatility",
    description: "Measures market volatility and provides relative high and low price levels",
    conditions: [
      { value: "priceAboveUpper", label: "Price Crosses Above Upper Band" },
      { value: "priceBelowLower", label: "Price Crosses Below Lower Band" },
      { value: "priceToMiddleFromAbove", label: "Price Returns to Middle Band from Above" },
      { value: "priceToMiddleFromBelow", label: "Price Returns to Middle Band from Below" },
      { value: "bandsSqueezing", label: "Bands Narrowing (Volatility Decreasing)" },
      { value: "bandsExpanding", label: "Bands Widening (Volatility Increasing)" },
    ],
    defaultConfig: {
      timeframe: "15m",
      condition: "priceAboveUpper",
      period: 20,
      standardDeviations: 2
    },
    parameters: [
      { id: "period", label: "MA Period", type: "number", default: 20, min: 1, max: 100 },
      { id: "standardDeviations", label: "Standard Deviations", type: "number", default: 2, min: 0.1, max: 5, step: 0.1,
        helperText: "Usually 2.0" }
    ]
  },
  
  "Stochastic Oscillator": {
    id: "stochastic",
    content: "Stochastic",
    icon: "timeline",
    type: "indicator",
    category: "momentum",
    description: "Compares closing price to price range over time to identify momentum changes",
    conditions: [
      { value: "kAboveD", label: "%K Crosses Above %D" },
      { value: "kBelowD", label: "%K Crosses Below %D" },
      { value: "overbought", label: "Enters Overbought Zone" },
      { value: "oversold", label: "Enters Oversold Zone" },
      { value: "exitOverbought", label: "Exits Overbought Zone" },
      { value: "exitOversold", label: "Exits Oversold Zone" },
    ],
    defaultConfig: {
      timeframe: "15m",
      condition: "kAboveD",
      kPeriod: 14,
      dPeriod: 3,
      overboughtLevel: 80,
      oversoldLevel: 20
    },
    parameters: [
      { id: "kPeriod", label: "%K Period", type: "number", default: 14, min: 1, max: 100 },
      { id: "dPeriod", label: "%D Period", type: "number", default: 3, min: 1, max: 100 },
      { id: "overboughtLevel", label: "Overbought Level", type: "number", default: 80, min: 50, max: 100 },
      { id: "oversoldLevel", label: "Oversold Level", type: "number", default: 20, min: 0, max: 50 }
    ]
  },
  
  "Volume": {
    id: "volume",
    content: "Volume",
    icon: "ssid_chart",
    type: "indicator",
    category: "volume",
    description: "Measures trading volume and its relationship to price movement",
    conditions: [
      { value: "increasesBy", label: "Increases By", requiresThreshold: true },
      { value: "decreasesBy", label: "Decreases By", requiresThreshold: true },
      { value: "exceedsAverage", label: "Exceeds Moving Average By", requiresThreshold: true },
      { value: "fallsBelowAverage", label: "Falls Below Moving Average By", requiresThreshold: true },
      { value: "exceeds", label: "Exceeds Value" }
    ],
    defaultConfig: {
      timeframe: "15m",
      condition: "increasesBy",
      percentage: 20,
      period: 20
    },
    parameters: [
      { id: "percentage", label: "Percentage", type: "number", default: 20, min: 1, max: 100 },
      { id: "period", label: "MA Period", type: "number", default: 20, min: 1, max: 100,
        showWhen: (config) => ["exceedsAverage", "fallsBelowAverage"].includes(config.condition) }
    ]
  },
  
  "Moving Average": {
    id: "moving-average",
    content: "Moving Average",
    icon: "trending_flat",
    type: "indicator",
    category: "trend",
    description: "Smooths price data to identify the direction of the trend",
    conditions: [
      { value: "priceAboveMA", label: "Price Crosses Above MA" },
      { value: "priceBelowMA", label: "Price Crosses Below MA" },
      { value: "fastMAAboveSlowMA", label: "Fast MA Crosses Above Slow MA" },
      { value: "fastMABelowSlowMA", label: "Fast MA Crosses Below Slow MA" }
    ],
    defaultConfig: {
      timeframe: "15m",
      condition: "priceAboveMA",
      period: 20,
      maType: "SMA",
      fastPeriod: 50,
      slowPeriod: 200
    },
    parameters: [
      { id: "period", label: "Period", type: "number", default: 20, min: 1, max: 200 },
      { id: "maType", label: "MA Type", type: "select", default: "SMA", options: [
        { value: "SMA", label: "Simple" },
        { value: "EMA", label: "Exponential" },
        { value: "WMA", label: "Weighted" }
      ]},
      { id: "fastPeriod", label: "Fast Period", type: "number", default: 50, min: 1, max: 200,
        showWhen: (config) => ["fastMAAboveSlowMA", "fastMABelowSlowMA"].includes(config.condition) },
      { id: "slowPeriod", label: "Slow Period", type: "number", default: 200, min: 1, max: 500,
        showWhen: (config) => ["fastMAAboveSlowMA", "fastMABelowSlowMA"].includes(config.condition) }
    ]
  },
  
  "ATR": {
    id: "atr",
    content: "ATR",
    icon: "ssid_chart",
    type: "indicator",
    category: "volatility",
    description: "Average True Range measures market volatility",
    conditions: [
      { value: "increasesAbove", label: "Increases Above", requiresThreshold: true },
      { value: "decreasesBelow", label: "Decreases Below", requiresThreshold: true },
      { value: "percentageIncrease", label: "Percentage Increase", requiresThreshold: true },
      { value: "percentageDecrease", label: "Percentage Decrease", requiresThreshold: true }
    ],
    defaultConfig: {
      timeframe: "15m",
      condition: "increasesAbove",
      period: 14,
      threshold: 1.0
    },
    parameters: [
      { id: "period", label: "Period", type: "number", default: 14, min: 1, max: 100 },
      { id: "threshold", label: "Threshold", type: "number", default: 1.0, min: 0, step: 0.1 }
    ]
  }
  
  // Add more indicators as needed
};

// Define categories for easier organization
const indicatorCategories = {
  trend: "Trend Indicators",
  momentum: "Momentum Indicators",
  volatility: "Volatility Indicators",
  volume: "Volume Indicators",
  support_resistance: "Support & Resistance"
};

export const getAccounts = async () => {
  // In the future: return await fetch('/api/accounts').then(res => res.json());
  return Promise.resolve(staticAccounts);
};

// Service functions - asynchronous for future API integration
export const getSymbols = async () => {
  // Future: return await fetch('/api/symbols').then(res => res.json());
  return Promise.resolve(staticSymbols);
};

export const getTimeframes = async () => {
  // Future: return await fetch('/api/timeframes').then(res => res.json());
  return Promise.resolve(staticTimeframes);
};

export const getAllIndicators = async () => {
  // Future: return await fetch('/api/indicators').then(res => res.json());
  return Promise.resolve(staticIndicators);
};

export const getIndicatorById = async (id) => {
  // In future: return await fetch(`/api/indicators/${id}`).then(res => res.json());
  
  // First try direct lookup
  if (staticIndicators[id]) {
    return Promise.resolve(staticIndicators[id]);
  }
  
  // Then try to match by lowercase id
  const indicatorMatch = Object.values(staticIndicators).find(
    indicator => indicator.id === id.toLowerCase() || 
                indicator.id === id ||
                indicator.content.toLowerCase() === id.toLowerCase()
  );
  
  return Promise.resolve(indicatorMatch || null);
};

export const getIndicatorsByCategory = async (category) => {
  // Future: return await fetch(`/api/indicators?category=${category}`).then(res => res.json());
  return Promise.resolve(
    Object.values(staticIndicators).filter(indicator => indicator.category === category)
  );
};

export const getIndicatorCategories = async () => {
  // Future: return await fetch('/api/indicators/categories').then(res => res.json());
  
  // Group indicators by category
  const categories = {};
  
  Object.values(staticIndicators).forEach(indicator => {
    if (!categories[indicator.category]) {
      categories[indicator.category] = {
        id: indicator.category,
        name: indicatorCategories[indicator.category] || indicator.category,
        indicators: []
      };
    }
    categories[indicator.category].indicators.push(indicator);
  });
  
  return Promise.resolve(categories);
};

export const getPopularIndicators = async () => {
  // Future: return await fetch('/api/indicators/popular').then(res => res.json());
  
  // Return a curated list of popular indicators
  return Promise.resolve([
    staticIndicators["RSI"],
    staticIndicators["MACD"],
    staticIndicators["Moving Average"],
    staticIndicators["Bollinger Bands"]
  ]);
};

// Synchronous versions for immediate use
// These will help with the transition when you move to async database calls
export const getSymbolsSync = () => staticSymbols;
export const getTimeframesSync = () => staticTimeframes;
export const getAccountsSync = () => staticAccounts;

export const getIndicatorByIdSync = (id) => {
  // First try direct lookup
  if (staticIndicators[id]) {
    return staticIndicators[id];
  }
  
  // Then try to match by lowercase id
  return Object.values(staticIndicators).find(
    indicator => indicator.id === id.toLowerCase() || 
                indicator.id === id ||
                indicator.content.toLowerCase() === id.toLowerCase()
  ) || null;
};

export const getDefaultConfig = (signal) => {
  // If it's an indicator, use the existing logic
  if (typeof signal === 'string' || (signal.type === 'indicator')) {
    const id = typeof signal === 'string' ? signal : signal.content;
    const indicator = getIndicatorByIdSync(id);
    if (indicator && indicator.defaultConfig) {
      return {...indicator.defaultConfig};
    }
  }
  
  // For social media signals
  if (signal.type === 'social') {
    const accounts = getAccountsSync();
    return {
      account: accounts.length > 0 ? accounts[0].value : '',
      keywords: "bitcoin,crypto",
    };
  }
  
  // For economic data
  if (signal.type === 'economic') {
    return {
      event: "Earnings",
      impact: "High"
    };
  }
  
  // Default fallback
  return {};
};

export const getIndicatorCategoriesSync = () => {
  const categories = {};
  
  Object.values(staticIndicators).forEach(indicator => {
    if (!categories[indicator.category]) {
      categories[indicator.category] = [];
    }
    categories[indicator.category].push(indicator);
  });
  
  return categories;
};

export const signalCategories = [
  {
    id: "socialMedia",
    title: "Social Media",
    items: [
      { id: "twitter", content: "Twitter/X", icon: "tag", type: "social" },
      { id: "reddit", content: "Reddit", icon: "forum", type: "social" },
      { id: "stocktwits", content: "StockTwits", icon: "message", type: "social" }
    ]
  },
  {
    id: "economicData",
    title: "Economic Data",
    items: [
      { id: "earnings", content: "Earnings Reports", icon: "receipt_long", type: "economic" },
      { id: "news", content: "News Releases", icon: "newspaper", type: "economic" },
      { id: "calendar", content: "Economic Calendar", icon: "event", type: "economic" }
    ]
  }
];

export const getPopularIndicatorsSync = () => {
  return [
    staticIndicators["RSI"],
    staticIndicators["MACD"],
    staticIndicators["Moving Average"],
    staticIndicators["Bollinger Bands"]
  ];
};