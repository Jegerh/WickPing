console.log("Loading file:", "indicatorsRegistry.js");
// Helper function to generate indicator ID
const createIndicatorId = (name) => name.toLowerCase().replace(/\s+/g, '-');

// Main indicators registry
export const INDICATORS_REGISTRY = {
  // Trend Indicators
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
  
  // Additional indicators...
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
  
  // More indicators can be added following the same pattern...
};

console.log("INDICATORS_REGISTRY initialized:", Object.keys(INDICATORS_REGISTRY));

// Helper functions to work with the registry
export const getIndicatorCategories = () => {
  const categories = {};
  
  Object.values(INDICATORS_REGISTRY).forEach(indicator => {
    if (!categories[indicator.category]) {
      categories[indicator.category] = [];
    }
    categories[indicator.category].push(indicator);
  });
  
  return categories;
};

export const getPopularIndicators = () => {
  // Return a curated list of the most popular indicators
  return [
    INDICATORS_REGISTRY["RSI"],
    INDICATORS_REGISTRY["MACD"],
    INDICATORS_REGISTRY["Bollinger Bands"],
    INDICATORS_REGISTRY["Stochastic Oscillator"]
  ];
};

export const getIndicatorById = (id) => {
  console.log("getIndicatorById called with:", id);
  console.log("Available indicators:", Object.keys(INDICATORS_REGISTRY));
  
  // If the id matches a key directly
  if (INDICATORS_REGISTRY[id]) {
    console.log("Result (direct key match):", INDICATORS_REGISTRY[id]);
    return INDICATORS_REGISTRY[id];
  }
  
  // Otherwise, search through all indicators
  const result = Object.values(INDICATORS_REGISTRY).find(indicator => 
    indicator.id === id || indicator.content === id
  );
  
  console.log("Result (search):", result);
  return result;
};

export const getDefaultConfig = (indicatorId) => {
  const indicator = getIndicatorById(indicatorId);
  return indicator ? {...indicator.defaultConfig} : {};
};