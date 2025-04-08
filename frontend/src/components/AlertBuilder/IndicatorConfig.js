import React from "react";
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { getIndicatorById } from "./indicatorsRegistry";

console.log("Loading file:", "indicatorsConfig.js");

console.log("IndicatorConfig imported getIndicatorById:", typeof getIndicatorById);

function IndicatorConfig({ indicator, config, onUpdate }) {
  console.log("IndicatorConfig rendering:", { indicator, config });

  console.log("Looking up indicator with id:", indicator);
  
  // Add error handling around the registry lookup
  let indicatorDef = null;
  try {
    indicatorDef = typeof indicator === 'string' 
      ? getIndicatorById(indicator) 
      : indicator;
    console.log("Loaded indicator definition:", indicatorDef);
  } catch (error) {
    console.error("Error loading indicator definition:", error);
  }
  
  // If we can't find the indicator, show a fallback UI
  if (!indicatorDef) {
    console.warn("Indicator definition not found for:", indicator);
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Symbol"
            value={config.symbol || ""}
            onChange={(e) => onUpdate({ symbol: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Timeframe"
            value={config.timeframe || "15m"}
            onChange={(e) => onUpdate({ timeframe: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>
    );
  }
  
  // Continue with your full implementation...
  // For now just render some basic fields to test
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Symbol"
          value={config.symbol || ""}
          onChange={(e) => onUpdate({ symbol: e.target.value })}
          variant="outlined"
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={config.timeframe || "15m"}
            label="Timeframe"
            onChange={(e) => onUpdate({ timeframe: e.target.value })}
          >
            <MenuItem value="1m">1 minute</MenuItem>
            <MenuItem value="5m">5 minutes</MenuItem>
            <MenuItem value="15m">15 minutes</MenuItem>
            <MenuItem value="1h">1 hour</MenuItem>
            <MenuItem value="4h">4 hours</MenuItem>
            <MenuItem value="1d">1 day</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Condition"
          value={config.condition || ""}
          onChange={(e) => onUpdate({ condition: e.target.value })}
          variant="outlined"
          size="small"
        />
      </Grid>
    </Grid>
  );
}

export default IndicatorConfig;