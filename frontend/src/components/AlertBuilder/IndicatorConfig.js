import React, { useState, useEffect } from "react";
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Autocomplete } from "@mui/material";
import { getSymbols, getTimeframes } from "../../services/dataService";
import { getIndicatorById } from "./indicatorsRegistry";

// Import the supportedSymbols array
import { supportedSymbols } from "./index";  // Make sure this path is correct

console.log("Loading file:", "indicatorsConfig.js");

console.log("IndicatorConfig imported getIndicatorById:", typeof getIndicatorById);

function IndicatorConfig({ indicator, config, onUpdate }) {

  const [symbols, setSymbols] = useState([]);
  const [timeframes, setTimeframes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [symbolsData, timeframesData] = await Promise.all([
          getSymbols(),
          getTimeframes()
        ]);
        
        setSymbols(symbolsData);
        setTimeframes(timeframesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log("IndicatorConfig rendering:", { indicator, config });

  console.log("Looking up indicator with id:", indicator);
  
  // Add error handling around the registry lookup
  let indicatorDef = null;
  try {
    indicatorDef = typeof indicator === 'string' 
      ? getIndicatorById(indicator) 
      : indicator;
    console.log("Loaded indicator definition:", indicatorDef);
    console.log("Available conditions:", indicatorDef?.conditions);
  } catch (error) {
    console.error("Error loading indicator definition:", error);
  }
  
  if (loading) {
    return <div>Loading...</div>; // Or a nice loading spinner
  }
  
  // Continue with your full implementation...
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth size="small">
          <Autocomplete
            options={symbols}
            getOptionLabel={(option) => option.label || option}
            isOptionEqualToValue={(option, value) => option.value === value || option.value === value.value}
            value={symbols.find(s => s.value === config.symbol) || null}
            onChange={(e, newValue) => onUpdate({ symbol: newValue?.value || "" })}
            renderInput={(params) => <TextField {...params} label="Symbol" />}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={config.timeframe || "15m"}
            label="Timeframe"
            onChange={(e) => onUpdate({ timeframe: e.target.value })}
          >
            {timeframes.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Condition</InputLabel>
          <Select
            value={config.condition || (indicatorDef.conditions[0]?.value || "")}
            label="Condition"
            onChange={(e) => onUpdate({ condition: e.target.value })}
          >
            {indicatorDef.conditions?.map((condition) => (
              <MenuItem key={condition.value} value={condition.value}>
                {condition.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      {/* Add threshold field for indicators that require it */}
      {indicatorDef?.conditions?.find(c => c.value === config.condition)?.requiresThreshold && (
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Threshold"
            type="number"
            value={config.threshold || 70}
            onChange={(e) => onUpdate({ threshold: e.target.value })}
            variant="outlined"
            size="small"
            helperText={indicatorDef.id === "rsi" ? "70+ typically overbought, 30- oversold" : ""}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default IndicatorConfig;