// Helper function to generate default config for a signal
function getDefaultConfig(signal) {
    if (signal.type === "indicator") {
      if (signal.content === "RSI") {
        return {
          symbol: supportedSymbols[0].value,
          timeframe: "15m",
          condition: "crossesAbove",
          threshold: 70
        };
      } else if (signal.content === "MACD") {
        return {
          symbol: supportedSymbols[0].value,
          timeframe: "15m",
          condition: "lineAboveSignal"
        };
      } else if (signal.content === "Bollinger Bands") {
        return {
          symbol: supportedSymbols[0].value,
          timeframe: "15m",
          condition: "priceAboveUpper",
          standardDeviations: 2
        };
      } else if (signal.content === "Volume") {
        return {
          symbol: supportedSymbols[0].value,
          timeframe: "15m",
          condition: "increasesBy",
          percentage: 20
        };
      }
      return {
        symbol: supportedSymbols[0].value,
        timeframe: "15m",
      };
    } else if (signal.type === "social") {
      return {
        account: supportedAccounts[0].value,
        keywords: "bitcoin,crypto",
      };
    } else {
      return {
        event: "Earnings",
        impact: "High"
      };
    }
  }