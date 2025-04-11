import React, { useState, useEffect } from "react";
import { Paper, Grid, Icon, TextField, FormControl, InputLabel, Select, MenuItem, Autocomplete, Collapse, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getIndicatorByIdSync } from "./indicatorsRegistry";
import { getBlockBorderColor, getBlockHeaderColor, getBlockIconColor, getBlockHoverBorderColor, darkenColor } from "./utils/colorUtils";
import IndicatorConfig from "./IndicatorConfig";
import { getSymbolsSync, getSymbols, getAccounts, getTimeframes, getAccountsSync, getTimeframesSync } from "../../services/dataService";

// Signal Block Component
function SignalBlock({ 
  block, 
  onRemove, 
  onUpdate, 
  expandedByDefault = false,
  isSelected = false,
  onToggleSelect
}) {
  // Use localStorage to persist expanded state if we have an ID
  const storageKey = `signal-expanded-${block.id}`;
  const initialExpanded = block.id ? 
    localStorage.getItem(storageKey) === 'true' || expandedByDefault : 
    expandedByDefault;
  
  const [expanded, setExpanded] = useState(initialExpanded);

  // Add state for the reference data
  const [symbols, setSymbols] = useState(getSymbolsSync());
  const [accounts, setAccounts] = useState(getAccountsSync());
  const [timeframes, setTimeframes] = useState(getTimeframesSync());
  
  // Fetch data asynchronously when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the async versions to fetch updated data
        const [symbolsData, accountsData, timeframesData] = await Promise.all([
          getSymbols(),
          getAccounts(),
          getTimeframes()
        ]);
        
        setSymbols(symbolsData);
        setAccounts(accountsData);
        setTimeframes(timeframesData);
      } catch (error) {
        console.error("Error loading reference data:", error);
        // Sync data will still be used as fallback
      }
    };
    
    fetchData();
  }, []);

  // Update localStorage when expanded state changes
  useEffect(() => {
    if (block.id) {
      localStorage.setItem(storageKey, expanded.toString());
    }
  }, [expanded, block.id, storageKey]);
  
  // Generate a summary of the block configuration
  const getConfigSummary = () => {
    if (!block.config) return '';
    
    const parts = [];
    
    if (block.type === 'indicator') {
      if (block.config.symbol) parts.push(block.config.symbol);
      if (block.config.timeframe) parts.push(block.config.timeframe);
      
      // Add condition-specific parameters
      const indicator = getIndicatorByIdSync(block.content);
      if (indicator) {
        const condition = indicator.conditions?.find(c => c.value === block.config.condition);
        if (condition?.label) parts.push(condition.label);
        
        if (condition?.requiresThreshold && block.config.threshold) {
          parts.push(`${block.config.threshold}`);
        }
      }
    } 
    else if (block.type === 'social') {
      // Summary for social signals
      if (block.config.account) parts.push(block.config.account);
      
      if (block.config.keywords) {
        // Format keywords for display
        const keywords = block.config.keywords.split(',').map(k => k.trim());
        if (keywords.length > 0) {
          if (keywords.length === 1) {
            parts.push(`"${keywords[0]}"`);
          } else if (keywords.length <= 3) {
            parts.push(`"${keywords.join('", "')}"`)
          } else {
            parts.push(`"${keywords[0]}", "${keywords[1]}" +${keywords.length - 2} more`);
          }
        }
      }
    }
    else if (block.type === 'economic') {
      // Summary for economic signals
      if (block.config.event) parts.push(block.config.event);
      if (block.config.impact) parts.push(`${block.config.impact} impact`);
    }
    
    return parts.join(' • ');
  };

  return (
    <Paper
      elevation={2} // Keep the default elevation
      className="signal-block"
      data-block-id={block.id}
      sx={{
        mb: 2,
        borderRadius: 2,
        position: 'relative',
        borderLeft: `4px solid ${getBlockBorderColor(block.type)}`,
        transition: 'all 0.2s ease',
        outline: isSelected ? '2px solid rgba(25, 118, 210, 0.7)' : 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          transform: 'translateY(-1px)',
          borderColor: getBlockHoverBorderColor(block.type)
        },
        cursor: 'pointer'
      }}
    >
      {/* Block Header */}
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={1.5}
        sx={{
          backgroundColor: getBlockHeaderColor(block.type),
          borderTopRightRadius: 8,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: darkenColor(getBlockHeaderColor(block.type), 0.05)
          }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <MDBox display="flex" alignItems="center">
          <Icon 
            sx={{ 
              mr: 1,
              color: getBlockIconColor(block.type),
              fontSize: '1.25rem'
            }}
          >
            {block.icon}
          </Icon>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {block.content}
            </MDTypography>
            
            {/* Show configuration summary when collapsed */}
            {!expanded && (
              <MDTypography variant="caption" color="text" sx={{ display: 'block', mt: 0.5 }}>
                {getConfigSummary()}
              </MDTypography>
            )}
          </MDBox>
        </MDBox>
        <MDBox display="flex" alignItems="center">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(block.id);
            }}
            color={isSelected ? "primary" : "default"}
          >
            <Icon>{isSelected ? 'check_box' : 'check_box_outline_blank'}</Icon>
          </IconButton>
          
          {/* Make expand icon more prominent */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <Icon>{expanded ? 'expand_less' : 'expand_more'}</Icon>
          </IconButton>
          
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Icon>delete</Icon>
          </IconButton>
        </MDBox>
      </MDBox>

      {/* Block Content - Collapsible with improved animation */}
      <Collapse 
        in={expanded} 
        timeout={300}
        sx={{
          '& .MuiCollapse-wrapperInner': {
            transition: 'opacity 0.3s',
            opacity: expanded ? 1 : 0
          }
        }}
      >
        <MDBox p={2}>
          {/* For indicator blocks, use the dynamic config component */}
          {block.type === "indicator" && (
            <IndicatorConfig 
              indicator={block.content}
              config={block.config}
              onUpdate={onUpdate}
            />
          )}

          {block.type === "social" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                    <Autocomplete
                      options={accounts}
                      getOptionLabel={(option) => option.label || option}
                      isOptionEqualToValue={(option, value) => option.value === value || option.value === value.value}
                      value={accounts.find(a => a.value === block.config.account) || null}
                      onChange={(e, newValue) => onUpdate({ account: newValue?.value || "" })}
                      renderInput={(params) => <TextField {...params} label="Account" />}
                      renderOption={(props, option) => (
                        <li {...props} style={{ opacity: option.deprecated ? 0.6 : 1 }}>
                          {option.label} 
                          {option.deprecated && (
                            <span style={{ marginLeft: 8, color: 'red', fontSize: '0.75rem' }}>
                              (deprecated)
                            </span>
                          )}
                        </li>
                      )}
                    />
                  </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Keywords (comma separated)"
                  value={block.config.keywords}
                  onChange={(e) => onUpdate({ keywords: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          )}

          {block.type === "economic" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Event</InputLabel>
                  <Select
                    value={block.config.event}
                    label="Event"
                    onChange={(e) => onUpdate({ event: e.target.value })}
                  >
                    <MenuItem value="Earnings">Earnings Report</MenuItem>
                    <MenuItem value="FedRate">Fed Rate Decision</MenuItem>
                    <MenuItem value="GDP">GDP Release</MenuItem>
                    <MenuItem value="Jobs">Jobs Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Impact</InputLabel>
                  <Select
                    value={block.config.impact}
                    label="Impact"
                    onChange={(e) => onUpdate({ impact: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </MDBox>
      </Collapse>
    </Paper>
  );
}

export default SignalBlock;