import React, { useState, useEffect  } from "react";
import { 
  Card, Grid, Icon, Divider, TextField, Select, MenuItem, FormControl, 
  InputLabel, Box, Autocomplete, ToggleButton, ToggleButtonGroup, InputAdornment,
  Paper, Collapse, IconButton
} from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import IndicatorConfig from "./IndicatorConfig";
import { getIndicatorCategories, getIndicatorCategoriesSync, getPopularIndicatorsSync, getIndicatorById, getIndicatorByIdSync } from "./indicatorsRegistry";

// Unique ID generator for items
const getItemId = () => `item-${Math.random().toString(36).substr(2, 9)}`;
const getGroupId = () => `group-${Math.random().toString(36).substr(2, 9)}`;

// Mock data - replace with actual data from your database
const supportedSymbols = [
  { value: "BTC/USD", label: "Bitcoin (BTC/USD)" },
  { value: "ETH/USD", label: "Ethereum (ETH/USD)" },
  { value: "SOL/USD", label: "Solana (SOL/USD)" },
  { value: "DOGE/USD", label: "Dogecoin (DOGE/USD)" },
  { value: "XRP/USD", label: "Ripple (XRP/USD)" },
];

const supportedAccounts = [
  { value: "@realDonaldTrump", label: "Donald Trump (@realDonaldTrump)" },
  { value: "@POTUS", label: "President of the United States (@POTUS)" },
  { value: "@federalreserve", label: "Federal Reserve (@federalreserve)" },
  { value: "@SECGov", label: "SEC (@SECGov)" },
];

// Signal categories for the palette
const signalCategories = [
  {
    id: "marketIndicators",
    title: "Market Indicators",
    items: [
      { id: "rsi", content: "RSI", icon: "trending_up", type: "indicator" },
      { id: "macd", content: "MACD", icon: "show_chart", type: "indicator" },
      { id: "bollinger", content: "Bollinger Bands", icon: "waterfall_chart", type: "indicator" },
      { id: "volume", content: "Volume", icon: "ssid_chart", type: "indicator" }
    ]
  },
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

// Initial workflow state with root group
const initialWorkflow = {
  rootGroup: {
    id: "root",
    type: "AND",
    blocks: [],
    groups: []
  }
};

// Helper functions for different item type colors
const getBlockBorderColor = (type) => {
  switch(type) {
    case 'indicator': return 'rgba(25, 118, 210, 0.3)';  // Blue
    case 'social': return 'rgba(76, 175, 80, 0.3)';      // Green
    case 'economic': return 'rgba(255, 152, 0, 0.3)';    // Orange
    default: return 'rgba(158, 158, 158, 0.3)';          // Gray
  }
};

const getBlockHeaderColor = (type) => {
  switch(type) {
    case 'indicator': return 'rgba(232, 244, 253, 0.8)';  // Light blue
    case 'social': return 'rgba(237, 247, 237, 0.8)';     // Light green
    case 'economic': return 'rgba(255, 243, 224, 0.8)';   // Light orange
    default: return 'rgba(238, 238, 238, 0.8)';           // Light gray
  }
};

const getBlockIconColor = (type) => {
  switch(type) {
    case 'indicator': return 'primary.main';  // Blue
    case 'social': return 'success.main';     // Green
    case 'economic': return 'warning.main';   // Orange
    default: return 'text.secondary';         // Gray
  }
};

const getBlockHoverBorderColor = (type) => {
  switch(type) {
    case 'indicator': return 'rgba(25, 118, 210, 0.7)';  // Darker blue
    case 'social': return 'rgba(76, 175, 80, 0.7)';      // Darker green
    case 'economic': return 'rgba(255, 152, 0, 0.7)';    // Darker orange
    default: return 'rgba(158, 158, 158, 0.7)';          // Darker gray
  }
};

// Add this helper function to darken colors
function darkenColor(rgba, amount) {
  // Extract values from rgba string
  const match = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) return rgba;
  
  const r = Math.max(0, parseInt(match[1]) - amount * 255);
  const g = Math.max(0, parseInt(match[2]) - amount * 255);
  const b = Math.max(0, parseInt(match[3]) - amount * 255);
  const a = parseFloat(match[4]);
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

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
    if (block.config.symbol) parts.push(block.config.symbol);
    if (block.config.timeframe) parts.push(block.config.timeframe);
    
    // Add condition-specific parameters
    if (block.type === 'indicator') {
      const indicator = getIndicatorByIdSync(block.content);
      if (indicator) {
        const condition = indicator.conditions?.find(c => c.value === block.config.condition);
        if (condition?.label) parts.push(condition.label);
        
        if (condition?.requiresThreshold && block.config.threshold) {
          parts.push(`${block.config.threshold}`);
        }
      }
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Reduced shadow on hover
          transform: 'translateY(-1px)', // Subtler lift on hover
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
                    options={supportedAccounts}
                    getOptionLabel={(option) => option.label || option}
                    isOptionEqualToValue={(option, value) => option.value === value || option.value === value.value}
                    value={supportedAccounts.find(a => a.value === block.config.account) || null}
                    onChange={(e, newValue) => onUpdate({ account: newValue?.value || "" })}
                    renderInput={(params) => <TextField {...params} label="Account" />}
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

// Function to render indicator-specific controls
function renderIndicatorSpecificControls(block, onUpdate) {
  if (block.content === "RSI") {
    return (
      <>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Condition</InputLabel>
            <Select
              value={block.config.condition || "crossesAbove"}
              label="Condition"
              onChange={(e) => onUpdate({ condition: e.target.value })}
            >
              <MenuItem value="crossesAbove">Crosses Above</MenuItem>
              <MenuItem value="crossesBelow">Crosses Below</MenuItem>
              <MenuItem value="staysAbove">Stays Above</MenuItem>
              <MenuItem value="staysBelow">Stays Below</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Value"
            type="number"
            value={block.config.threshold || 70}
            onChange={(e) => onUpdate({ threshold: e.target.value })}
            variant="outlined"
            size="small"
            helperText="70+ typically overbought, 30- oversold"
          />
        </Grid>
      </>
    );
  } else if (block.content === "MACD") {
    return (
      <Grid item xs={12} sm={8}>
        <FormControl fullWidth size="small">
          <InputLabel>Condition</InputLabel>
          <Select
            value={block.config.condition || "lineAboveSignal"}
            label="Condition"
            onChange={(e) => onUpdate({ condition: e.target.value })}
          >
            <MenuItem value="lineAboveSignal">MACD Line Crosses Above Signal Line</MenuItem>
            <MenuItem value="lineBelowSignal">MACD Line Crosses Below Signal Line</MenuItem>
            <MenuItem value="histogramPositive">Histogram Becomes Positive</MenuItem>
            <MenuItem value="histogramNegative">Histogram Becomes Negative</MenuItem>
            <MenuItem value="histogramIncreasing">Histogram Increasing</MenuItem>
            <MenuItem value="histogramDecreasing">Histogram Decreasing</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    );
  }else if (block.content === "Bollinger Bands") {
    return (
      <>
        <Grid item xs={12} sm={8}>
          <FormControl fullWidth size="small">
            <InputLabel>Condition</InputLabel>
            <Select
              value={block.config.condition || "priceAboveUpper"}
              label="Condition"
              onChange={(e) => onUpdate({ condition: e.target.value })}
            >
              <MenuItem value="priceAboveUpper">Price Crosses Above Upper Band</MenuItem>
              <MenuItem value="priceBelowLower">Price Crosses Below Lower Band</MenuItem>
              <MenuItem value="priceToMiddleFromAbove">Price Returns to Middle Band from Above</MenuItem>
              <MenuItem value="priceToMiddleFromBelow">Price Returns to Middle Band from Below</MenuItem>
              <MenuItem value="bandsSqueezing">Bands Narrowing (Volatility Decreasing)</MenuItem>
              <MenuItem value="bandsExpanding">Bands Widening (Volatility Increasing)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Standard Deviations"
            type="number"
            value={block.config.standardDeviations || 2}
            onChange={(e) => onUpdate({ standardDeviations: e.target.value })}
            variant="outlined"
            size="small"
            helperText="Usually 2.0"
          />
        </Grid>
      </>
    );
  } else if (block.content === "Volume") {
    return (
      <>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Condition</InputLabel>
            <Select
              value={block.config.condition || "increasesBy"}
              label="Condition"
              onChange={(e) => onUpdate({ condition: e.target.value })}
            >
              <MenuItem value="increasesBy">Increases By</MenuItem>
              <MenuItem value="decreasesBy">Decreases By</MenuItem>
              <MenuItem value="exceedsAverage">Exceeds Moving Average By</MenuItem>
              <MenuItem value="fallsBelowAverage">Falls Below Moving Average By</MenuItem>
              <MenuItem value="exceeds">Exceeds Value</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={block.config.condition?.includes("Average") ? "Percentage" : 
                  block.config.condition === "exceeds" ? "Value" : "Percentage"}
            type="number"
            value={block.config.percentage || 20}
            onChange={(e) => onUpdate({ percentage: e.target.value })}
            variant="outlined"
            size="small"
            InputProps={block.config.condition !== "exceeds" ? {
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            } : undefined}
          />
        </Grid>
      </>
    );
  }
  return null;
}

// Logic Group Component
function LogicGroup({ 
  group, 
  onAddBlock,
  onAddGroup, 
  onRemoveGroup, 
  onChangeType,
  onRemoveBlock,
  onUpdateBlock,
  selectedBlocks,
  onToggleSelectBlock,
  onGroupSelectedBlocks,
  level = 0,
  isRoot = false 
}) {
  const [expanded, setExpanded] = useState(true); // Start expanded
  // Function to get the connector line style
  const getConnectorStyle = (index, total) => ({
    position: 'absolute',
    left: '-20px',
    top: index === 0 ? '50%' : 0,
    height: index === total - 1 ? '50%' : '100%',
    width: '20px',
    borderLeft: '2px solid',
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottom: index !== total - 1 ? 'none' : '2px solid rgba(0,0,0,0.1)',
    zIndex: 0
  });

  return (
    <MDBox 
      position="relative"
      p={2} 
      mb={2}
      borderRadius={2}
      sx={{ 
        backgroundColor: level === 0 
          ? "transparent" 
          : level === 1 
            ? "rgba(224, 242, 254, 0.6)" // Light blue for first level
            : "rgba(209, 233, 252, 0.8)", // Slightly darker blue for deeper nesting
        border: level === 0 
          ? "none" 
          : `1px solid ${level === 1 ? "rgba(25, 118, 210, 0.3)" : "rgba(25, 118, 210, 0.5)"}`,
        boxShadow: level > 0 ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', // Reduced shadow
        // Add a left border that gets thicker with nesting
        borderLeft: level > 0 ? `${Math.min(level + 2, 5)}px solid rgba(25, 118, 210, ${0.3 + (level * 0.1)})` : 'none',
        overflow: 'hidden' // This will prevent child elements from creating overflow
      }}
    >
      {/* Logic Operator Toggle */}
      <MDBox 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={expanded ? 3 : 0}
        bgcolor={level === 0 ? "rgba(0,0,0,0.02)" : "rgba(214, 236, 251, 0.5)"}
        p={1.5}
        borderRadius={2}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: level === 0 ? "rgba(0,0,0,0.04)" : "rgba(200, 229, 248, 0.5)",
          },
          border: level > 0 ? '1px solid rgba(25, 118, 210, 0.1)' : 'none' // Subtle border for nested groups
        }}
      >
        <MDBox display="flex" alignItems="center">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{ mr: 1 }}
          >
            <Icon>{expanded ? 'expand_more' : 'chevron_right'}</Icon>
          </IconButton>
          <MDTypography variant="button" fontWeight="medium" color="text" mr={2}>
            Logic:
          </MDTypography>
          <ToggleButtonGroup
            value={group.type}
            exclusive
            onChange={(e, newValue) => onChangeType(group.id, newValue)}
            size="small"
            color="primary"
            sx={{
              bgcolor: "white",
              '& .MuiToggleButton-root': {
                border: '1px solid rgba(142, 192, 241, 0.3)',
              },
              '& .MuiToggleButton-root.Mui-selected': {
                backgroundColor: 'rgba(142, 192, 241, 0.7)', // Lighter blue
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(142, 192, 241, 0.8)',
                }
              }
            }}
          >
            <ToggleButton value="AND">
              <MDTypography variant="button" fontWeight="medium">ALL conditions (AND)</MDTypography>
            </ToggleButton>
            <ToggleButton value="OR">
              <MDTypography variant="button" fontWeight="medium">ANY condition (OR)</MDTypography>
            </ToggleButton>
          </ToggleButtonGroup>
        </MDBox>
        
        {!isRoot && (
          <IconButton 
            color="error" 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveGroup(group.id);
            }}
          >
            <Icon>delete</Icon>
          </IconButton>
        )}
      </MDBox>
      {/* Blocks Container with Connector Lines */}
      <Collapse in={expanded}>
        <MDBox 
          position="relative" 
          ml={4}
          sx={{ 
            '& .signal-block': {
              // Make signal blocks inside groups have softer appearance
              boxShadow: 'none',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(0,0,0,0.08)',
              borderLeftWidth: '4px',  // Keep the left indicator border
            }
          }}
        >
          {group.blocks.map((block, index) => (
            <MDBox key={block.id} position="relative">
              {/* Visual connector line */}
              {index > 0 && (
                <Box sx={getConnectorStyle(index, group.blocks.length)} />
              )}
              <SignalBlock 
                block={block} 
                onRemove={() => onRemoveBlock(group.id, block.id)}
                onUpdate={(config) => onUpdateBlock(group.id, block.id, config)}
                isSelected={selectedBlocks.includes(block.id)}
                onToggleSelect={(blockId) => {
                  console.log("onToggleSelect called in LogicGroup", {
                    groupId: group.id,
                    blockId,
                    onToggleSelectBlock: onToggleSelectBlock,
                    isFunction: typeof onToggleSelectBlock === 'function'
                  });
                  onToggleSelectBlock(group.id, blockId);
                }}
              />
            </MDBox>
            
          ))}
          
          {/* Nested groups */}
          {group.groups.map((subGroup, index) => (
            <MDBox key={subGroup.id} position="relative">
              {/* Visual connector line */}
              {(index > 0 || group.blocks.length > 0) && (
                <Box sx={getConnectorStyle(
                  group.blocks.length + index, 
                  group.blocks.length + group.groups.length
                )} />
              )}
              <LogicGroup
                group={subGroup}
                onAddBlock={onAddBlock}
                onAddGroup={onAddGroup}
                onRemoveGroup={onRemoveGroup}
                onChangeType={onChangeType}
                onRemoveBlock={onRemoveBlock}
                onUpdateBlock={onUpdateBlock}
                selectedBlocks={selectedBlocks}
                onToggleSelectBlock={onToggleSelectBlock}
                onGroupSelectedBlocks={onGroupSelectedBlocks}
                level={level + 1}
                isRoot={false}
              />
            </MDBox>
          ))}
        </MDBox>
      </Collapse>

      {!expanded && group.blocks.length + group.groups.length > 0 && (
        <MDBox mt={1} ml={4}>
          <MDTypography variant="caption" color="text">
            {group.blocks.length + group.groups.length} condition{group.blocks.length + group.groups.length > 1 ? 's' : ''} 
            {group.blocks.length > 0 && (
              <> ({group.blocks.map(b => b.content).join(', ')})</>
            )}
          </MDTypography>
        </MDBox>
      )}
      
      {/* Group action buttons */}
      <MDBox mt={3} ml={4} display="flex" gap={2}>
        <MDButton 
          variant="outlined" 
          color="info" 
          size="small"
          startIcon={<Icon>add</Icon>}
          onClick={() => onAddBlock(group.id)}
        >
          Add Signal
        </MDButton>
        
        {selectedBlocks.length > 1 && selectedBlocks.every(id => 
          // Check if all selected blocks are in this group
          group.blocks.some(block => block.id === id)
        ) && (
          <MDButton 
            variant="outlined" 
            color="secondary" 
            size="small"
            startIcon={<Icon>group_work</Icon>}
            onClick={() => onGroupSelectedBlocks(group.id, selectedBlocks)}
          >
            Group Selected ({selectedBlocks.length})
          </MDButton>
        )}
        
        {level < 1 && (
          <MDButton 
            variant="outlined" 
            color="secondary" 
            size="small"
            startIcon={<Icon>folder</Icon>}
            onClick={() => onAddGroup(group.id)}
          >
            Add Group
          </MDButton>
        )}
      </MDBox>
    </MDBox>
  );
}

// Signal Selector Modal
function SignalSelector({ open, onClose, onSelect, searchTerm, setSearchTerm }) {
  const [activeCategory, setActiveCategory] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const handleCategoryChange = (newCategory) => {
    setActiveCategory(newCategory);
    setCurrentPage(1);
  };

  // Filter signals based on search and category
  const getFilteredSignals = () => {
    // Get all indicators categorized by their type
    const categorizedIndicators = getIndicatorCategoriesSync();
    
    if (searchTerm) {
      // Filter all indicators across categories by search term
      let results = [];
      Object.keys(categorizedIndicators).forEach(category => {
        const matchingIndicators = categorizedIndicators[category].filter(item => 
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (matchingIndicators.length > 0) {
          results.push({
            id: category,
            title: category.charAt(0).toUpperCase() + category.slice(1) + " Indicators",
            items: matchingIndicators
          });
        }
      });
      return results;
    }
    
    // Return indicators for specific category or popular list
    switch (activeCategory) {
      case "popular":
        return [{
          id: "popularIndicators",
          title: "Popular Indicators",
          items: getPopularIndicatorsSync()
        }];
      case "trend":
        return categorizedIndicators.trend ? [{
          id: "trendIndicators",
          title: "Trend Indicators",
          items: categorizedIndicators.trend
        }] : [];
      case "momentum":
        return categorizedIndicators.momentum ? [{
          id: "momentumIndicators",
          title: "Momentum Indicators",
          items: categorizedIndicators.momentum
        }] : [];
      case "social":
        return [{
          id: "socialMedia",
          title: "Social Media",
          items: signalCategories.find(c => c.id === "socialMedia")?.items || []
        }];
      case "volatility":
        return categorizedIndicators.volatility ? [{
          id: "volatilityIndicators",
          title: "Volatility Indicators",
          items: categorizedIndicators.volatility
        }] : [];
      case "volume":
        return categorizedIndicators.volume ? [{
          id: "volumeIndicators",
          title: "Volume Indicators",
          items: categorizedIndicators.volume
        }] : [];
      default:
        // Default to all categories
        return Object.keys(categorizedIndicators).map(category => ({
          id: category,
          title: category.charAt(0).toUpperCase() + category.slice(1) + " Indicators",
          items: categorizedIndicators[category]
        })).concat(signalCategories.filter(cat => cat.id !== "marketIndicators"));
    }
  };

  // Paginate the results
  const paginateItems = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: items.slice(startIndex, endIndex),
      totalItems: items.length
    };
  };

  return (
    <MDBox 
      position="fixed" 
      top="0" 
      left="0"
      width="100%" 
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Add dark overlay
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transition: 'all 0.3s',
        zIndex: 1000
      }}
    >
      <Card 
        elevation={4} 
        sx={{ 
          width: '90%', 
          maxWidth: '600px', 
          maxHeight: '80vh',
          transform: open ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'transform 0.3s'
        }}
      >
        <MDBox p={3} sx={{ maxHeight: '80vh', overflow: 'auto' }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">Select Signal</MDTypography>
            <IconButton onClick={onClose}>
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
          
          <TextField
            fullWidth
            size="small"
            placeholder="Search signals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Icon>search</Icon></InputAdornment>
            }}
          />
          
          <MDBox display="flex" gap={1} mb={3} flexWrap="wrap">
            {["popular", "trend", "momentum", "volatility", "volume", "social"].map(category => (
              <MDButton
                key={category}
                variant={activeCategory === category ? "contained" : "outlined"}
                color="info"
                size="small"
                onClick={() => handleCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MDButton>
            ))}
          </MDBox>
          
          {getFilteredSignals().length > 0 ? (
            getFilteredSignals().map(category => {
              const paginatedData = paginateItems(category.items);
              
              return (
                <MDBox key={category.id} mb={3}>
                  <MDTypography variant="button" color="text" fontWeight="bold">
                    {category.title}
                  </MDTypography>
                  
                  <Grid container spacing={2} mt={1}>
                    {paginatedData.items.map(item => (
                      <Grid item xs={12} sm={6} key={item.id}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            borderLeft: `4px solid ${getBlockBorderColor(item.type)}`,
                            '&:hover': { 
                              boxShadow: 3,
                              backgroundColor: 'rgba(0,0,0,0.02)'
                            }
                          }}
                          onClick={() => {
                            onSelect(item);
                            onClose();
                          }}
                        >
                          <MDBox display="flex" alignItems="center">
                            <Icon 
                              sx={{ 
                                mr: 1,
                                color: getBlockIconColor(item.type)
                              }}
                            >
                              {item.icon}
                            </Icon>
                            <MDTypography variant="button" fontWeight="medium">
                              {item.content}
                            </MDTypography>
                          </MDBox>
                          {item.description && (
                            <MDTypography variant="caption" color="text" sx={{ display: 'block', mt: 0.5 }}>
                              {item.description.length > 60 
                                ? item.description.substring(0, 60) + '...' 
                                : item.description}
                            </MDTypography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {paginatedData.totalItems > itemsPerPage && (
                    <MDBox display="flex" justifyContent="center" mt={2}>
                      <MDButton
                        size="small"
                        variant="outlined"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        <Icon>chevron_left</Icon>
                      </MDButton>
                      <MDBox mx={2} display="flex" alignItems="center">
                        {currentPage} / {Math.ceil(paginatedData.totalItems / itemsPerPage)}
                      </MDBox>
                      <MDButton
                        size="small"
                        variant="outlined"
                        disabled={currentPage >= Math.ceil(paginatedData.totalItems / itemsPerPage)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        <Icon>chevron_right</Icon>
                      </MDButton>
                    </MDBox>
                  )}
                </MDBox>
              );
            })
          ) : (
            <MDBox textAlign="center" py={4}>
              <Icon color="text" sx={{ fontSize: '3rem', opacity: 0.5, mb: 2 }}>search_off</Icon>
              <MDTypography variant="body2" color="text">
                No signals found matching your criteria
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}
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

const previewStyles = `
  .preview-item:hover, .preview-group:hover {
    background-color: rgba(25, 118, 210, 0.1);
    border-radius: 3px;
    cursor: pointer;
  }
  
  .highlight {
    background-color: rgba(25, 118, 210, 0.2) !important;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.3);
  }
  
  .operator {
    font-weight: bold;
    color: #1976d2;
    padding: 0 4px;
  }

  @keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
    100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
  }

  .highlight-pulse {
    animation: highlight-pulse 1s ease-out 1;
    background-color: rgba(25, 118, 210, 0.1);
  }
`;

// Main Alert Builder Component
function AlertBuilder() {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [alertName, setAlertName] = useState("");
  const [deliveryMethods, setDeliveryMethods] = useState(["email"]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState(null);

  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewType, setPreviewType] = useState('simple');

  const getSignalCategories = () => {
    const categories = [];
    
    // Add indicator categories
    const indicatorCategories = getIndicatorCategories();
    Object.keys(indicatorCategories).forEach(category => {
      categories.push({
        id: `${category}Indicators`,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Indicators`,
        items: indicatorCategories[category]
      });
    });
    
    // Add your existing categories for social media and economic data
    categories.push({
      id: "socialMedia",
      title: "Social Media",
      items: [
        { id: "twitter", content: "Twitter/X", icon: "tag", type: "social" },
        { id: "reddit", content: "Reddit", icon: "forum", type: "social" },
        { id: "stocktwits", content: "StockTwits", icon: "message", type: "social" }
      ]
    });
    
    categories.push({
      id: "economicData",
      title: "Economic Data",
      items: [
        { id: "earnings", content: "Earnings Reports", icon: "receipt_long", type: "economic" },
        { id: "news", content: "News Releases", icon: "newspaper", type: "economic" },
        { id: "calendar", content: "Economic Calendar", icon: "event", type: "economic" }
      ]
    });
    
    return categories;
  };

  // Toggle selection of a block
  const handleToggleSelectBlock = (groupId, blockId) => {
    console.log("handleToggleSelectBlock called", { groupId, blockId, selectedBlocks });
    setSelectedBlocks(prev => {
      if (prev.includes(blockId)) {
        return prev.filter(id => id !== blockId);
      } else {
        return [...prev, blockId];
      }
    });
  };

  // Helper function to get the text representation of a condition
  const getConditionText = (block) => {
    if (block.type === "indicator") {
      const indicator = getIndicatorById(block.content);
      if (!indicator) return `${block.content} condition`;
      
      const condition = indicator.conditions.find(c => c.value === block.config.condition);
      const conditionText = condition ? condition.label : "condition met";
      
      return `${block.content} of ${block.config.symbol || "unknown symbol"} (${block.config.timeframe || "unknown timeframe"}) ${conditionText.toLowerCase()}${block.config.threshold ? " " + block.config.threshold : ""}`;
    } else if (block.type === "social") {
      return `${block.config.account || "Account"} tweets about "${block.config.keywords || "keywords"}"`;
    } else {
      return `${block.config.event || "Event"} with ${block.config.impact || "impact"} impact is released`;
    }
  };

  // Helper function to find a group by ID
  const findGroup = (currentGroup, groupId) => {
    if (currentGroup.id === groupId) {
      return currentGroup;
    }
    
    for (const subGroup of currentGroup.groups) {
      const found = findGroup(subGroup, groupId);
      if (found) return found;
    }
    
    return null;
  };

  // Group selected blocks into a new nested group
  const handleGroupSelectedBlocks = (parentGroupId, blockIds) => {
    // 1. Create a new group
    const newGroupId = getGroupId();
    const newGroup = {
      id: newGroupId,
      type: "OR", // Default to OR for the new group
      blocks: [],
      groups: []
    };
    
    // 2. Find the parent group
    const parentGroup = findGroup(workflow.rootGroup, parentGroupId);
    if (!parentGroup) return;
    
    // 3. Find all selected blocks
    const blocksToMove = parentGroup.blocks.filter(block => 
      blockIds.includes(block.id)
    );
    
    // 4. Create new workflow with the new group structure
    const updatedRootGroup = addGroupToParent(workflow.rootGroup, parentGroupId, newGroup);
    
    // 5. Move selected blocks to the new group
    let finalRootGroup = updatedRootGroup;
    for (const block of blocksToMove) {
      // Add the block to the new group
      finalRootGroup = addBlockToGroup(finalRootGroup, newGroupId, block);
      // Remove the block from the parent group
      finalRootGroup = removeBlockFromGroup(finalRootGroup, parentGroupId, block.id);
    }
    
    // 6. Update the workflow
    setWorkflow({
      ...workflow,
      rootGroup: finalRootGroup
    });
    
    // 7. Clear selections
    setSelectedBlocks([]);
  };
  
  // Open signal selector for a specific group
  const openSignalSelector = (groupId) => {
    setTargetGroupId(groupId);
    setSelectorOpen(true);
  };
  
  // Add a selected signal to the target group
  const handleAddSignal = (signal) => {
    if (!targetGroupId) return;
    
    const newBlock = {
      ...signal,
      id: getItemId(),
      config: getDefaultConfig(signal)
    };
    
    setWorkflow(prevWorkflow => ({
      ...prevWorkflow,
      rootGroup: addBlockToGroup(prevWorkflow.rootGroup, targetGroupId, newBlock)
    }));
  };
  
  // Add a block to a group
  const addBlockToGroup = (currentGroup, groupId, block) => {
    if (currentGroup.id === groupId) {
      return {
        ...currentGroup,
        blocks: [...currentGroup.blocks, block]
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        addBlockToGroup(group, groupId, block)
      )
    };
  };
  
  // Add a new logic group
  const handleAddGroup = (parentId) => {
    const newGroup = {
      id: getGroupId(),
      type: "AND",
      blocks: [],
      groups: []
    };
    
    setWorkflow({
      ...workflow,
      rootGroup: addGroupToParent(workflow.rootGroup, parentId, newGroup)
    });
  };
  
  // Add a group to a parent group
  const addGroupToParent = (currentGroup, parentId, newGroup) => {
    if (currentGroup.id === parentId) {
      return {
        ...currentGroup,
        groups: [...currentGroup.groups, newGroup]
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        addGroupToParent(group, parentId, newGroup)
      )
    };
  };
  
  // Remove a logic group
  const handleRemoveGroup = (groupId) => {
    setWorkflow({
      ...workflow,
      rootGroup: removeGroupFromHierarchy(workflow.rootGroup, groupId)
    });
  };
  
  // Remove a group from the hierarchy
  const removeGroupFromHierarchy = (currentGroup, groupId) => {
    return {
      ...currentGroup,
      groups: currentGroup.groups
        .filter(group => group.id !== groupId)
        .map(group => removeGroupFromHierarchy(group, groupId))
    };
  };
  
  // Change a group's logical operator
  const handleChangeGroupType = (groupId, newType) => {
    if (newType !== null) {
      setWorkflow({
        ...workflow,
        rootGroup: updateGroupType(workflow.rootGroup, groupId, newType)
      });
    }
  };
  
  // Update a group's logical operator type
  const updateGroupType = (currentGroup, groupId, newType) => {
    if (currentGroup.id === groupId) {
      return {
        ...currentGroup,
        type: newType
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        updateGroupType(group, groupId, newType)
      )
    };
  };

  // Remove a block from a group
  const handleRemoveBlock = (groupId, blockId) => {
    setWorkflow({
      ...workflow,
      rootGroup: removeBlockFromGroup(workflow.rootGroup, groupId, blockId)
    });
  };
  
  // Remove block from specified group
  const removeBlockFromGroup = (currentGroup, groupId, blockId) => {
    if (currentGroup.id === groupId) {
      return {
        ...currentGroup,
        blocks: currentGroup.blocks.filter(block => block.id !== blockId)
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        removeBlockFromGroup(group, groupId, blockId)
      )
    };
  };
  
  // Update block configuration
  const handleUpdateBlock = (groupId, blockId, newConfig) => {
    setWorkflow({
      ...workflow,
      rootGroup: updateBlockInGroup(workflow.rootGroup, groupId, blockId, newConfig)
    });
  };
  
  // Update block in specified group
  const updateBlockInGroup = (currentGroup, groupId, blockId, newConfig) => {
    if (currentGroup.id === groupId) {
      return {
        ...currentGroup,
        blocks: currentGroup.blocks.map(block => 
          block.id === blockId ? { ...block, config: { ...block.config, ...newConfig } } : block
        )
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        updateBlockInGroup(group, groupId, blockId, newConfig)
      )
    };
  };

  // Toggle delivery methods
  const handleDeliveryMethodsChange = (method) => {
    if (deliveryMethods.includes(method)) {
      setDeliveryMethods(deliveryMethods.filter(m => m !== method));
    } else {
      setDeliveryMethods([...deliveryMethods, method]);
    }
  };

  // Count total blocks across all groups
  const countTotalBlocks = (group) => {
    let count = group.blocks.length;
    
    for (const subGroup of group.groups) {
      count += countTotalBlocks(subGroup);
    }
    
    return count;
  };
  
  const totalBlocks = countTotalBlocks(workflow.rootGroup);
  
  // Recursively generate logic preview
  const generateLogicPreview = (group, level = 0) => {
    // Create indentation based on nesting level
    const indent = '  '.repeat(level);
    const nextIndent = '  '.repeat(level + 1);
    
    const blockConditions = group.blocks.map(block => {
      const conditionText = getConditionText(block);
      return `${nextIndent}<span id="preview-${block.id}" class="preview-item" data-block-id="${block.id}">${conditionText}</span>`;
    });
    
    const groupConditions = group.groups.map(subGroup => {
      const subCondition = generateLogicPreview(subGroup, level + 1);
      return `${nextIndent}<span id="preview-group-${subGroup.id}" class="preview-group" data-group-id="${subGroup.id}">(
  ${subCondition}
  ${nextIndent})</span>`;
    });
    
    const allConditions = [...blockConditions, ...groupConditions];
    if (allConditions.length === 0) return `${nextIndent}No conditions added`;
    
    // Join with proper indentation and operators
    return allConditions.join(`
  ${nextIndent}<span class="operator operator-${group.type.toLowerCase()}">${group.type}</span>
  `);
  };
  
  // Main alert logic preview function
  const getAlertLogicPreview = () => {
    const preview = generateLogicPreview(workflow.rootGroup);
    return `<div class="logic-preview-code">${preview}</div>`;
  };

  // Add mouse events to both the blocks and the preview text
  useEffect(() => {

    // Add click events to preview spans
    document.querySelectorAll('.preview-item, .preview-group').forEach(span => {
      const blockId = span.getAttribute('data-block-id');
      const groupId = span.getAttribute('data-group-id');
      
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (blockId) {
          const element = document.querySelector(`.signal-block[data-block-id="${blockId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-pulse');
            setTimeout(() => {
              element.classList.remove('highlight-pulse');
            }, 2000);
          }
        } else if (groupId) {
          const element = document.querySelector(`.logic-group[data-group-id="${groupId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-pulse');
            setTimeout(() => {
              element.classList.remove('highlight-pulse');
            }, 2000);
          }
        }
      });
    });

    // Add hover events to blocks
    document.querySelectorAll('.signal-block').forEach(block => {
      const blockId = block.getAttribute('data-block-id');
      block.addEventListener('mouseenter', () => {
        document.getElementById(`preview-${blockId}`)?.classList.add('highlight');
      });
      block.addEventListener('mouseleave', () => {
        document.getElementById(`preview-${blockId}`)?.classList.remove('highlight');
      });
    });
    
    // Add hover events to preview spans
    document.querySelectorAll('.preview-item, .preview-group').forEach(span => {
      const blockId = span.getAttribute('data-block-id');
      const groupId = span.getAttribute('data-group-id');
      
      span.addEventListener('mouseenter', () => {
        if (blockId) {
          document.querySelector(`.signal-block[data-block-id="${blockId}"]`)?.classList.add('highlight');
        } else if (groupId) {
          document.querySelector(`.logic-group[data-group-id="${groupId}"]`)?.classList.add('highlight');
        }
      });
      
      span.addEventListener('mouseleave', () => {
        if (blockId) {
          document.querySelector(`.signal-block[data-block-id="${blockId}"]`)?.classList.remove('highlight');
        } else if (groupId) {
          document.querySelector(`.logic-group[data-group-id="${groupId}"]`)?.classList.remove('highlight');
        }
      });
    });
  }, [workflow, previewExpanded, previewType]);

  const generateSimpleLogicPreview = (group) => {
    const blockConditions = group.blocks.map(block => {
      const conditionText = getConditionText(block);
      return `<span id="preview-simple-${block.id}" class="preview-item" data-block-id="${block.id}">${conditionText}</span>`;
    });
    
    const groupConditions = group.groups.map(subGroup => {
      const subCondition = generateSimpleLogicPreview(subGroup);
      return `<span id="preview-group-simple-${subGroup.id}" class="preview-group" data-group-id="${subGroup.id}">
        (${subCondition})
      </span>`;
    });
    
    const allConditions = [...blockConditions, ...groupConditions];
    if (allConditions.length === 0) return "No conditions added";
    
    return allConditions.join(` <span class="operator operator-${group.type.toLowerCase()}">${group.type}</span> `);
  };

  return (
    <>
      <style>{previewStyles}</style>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium">
          Create New Alert
        </MDTypography>
        <MDBox mt={2} mb={3}>
          <TextField
            fullWidth
            label="Alert Name"
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
            variant="outlined"
            placeholder="e.g., Bitcoin Price + Trump Tweet Alert"
          />
        </MDBox>
      </MDBox>

      <Grid container spacing={3}>
        <Grid item xs={12}>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Alert Builder
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Build your multi-signal alert logic
              </MDTypography>

              <MDBox
                mt={2}
                borderRadius="lg"
                sx={{ 
                  backgroundColor: "grey.50", // Lighter gray
                  minHeight: "300px",
                  border: totalBlocks === 0 ? "2px dashed" : "none",
                  borderColor: "info.main",
                  padding: 2,
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' // Subtle inset shadow
                }}
              >
                {totalBlocks === 0 && (
                  <MDBox 
                    height="100%" 
                    display="flex" 
                    flexDirection="column"
                    justifyContent="center" 
                    alignItems="center"
                    textAlign="center"
                    p={4}
                  >
                    <Icon color="info" sx={{ fontSize: '3rem', mb: 2 }}>add_alert</Icon>
                    <MDTypography variant="h6" color="text" gutterBottom>
                      Start Building Your Alert
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={3}>
                      Add signals and conditions to create custom alert logic
                    </MDTypography>
                    <MDButton 
                      variant="contained" 
                      color="info"
                      onClick={() => openSignalSelector("root")}
                      startIcon={<Icon>add</Icon>}
                    >
                      Add First Signal
                    </MDButton>
                  </MDBox>
                )}

                {totalBlocks > 0 && (
                  <LogicGroup 
                    group={workflow.rootGroup}
                    onAddBlock={openSignalSelector}
                    onAddGroup={handleAddGroup}
                    onRemoveGroup={handleRemoveGroup}
                    onChangeType={handleChangeGroupType}
                    onRemoveBlock={handleRemoveBlock}
                    onUpdateBlock={handleUpdateBlock}
                    selectedBlocks={selectedBlocks}
                    onToggleSelectBlock={handleToggleSelectBlock}
                    onGroupSelectedBlocks={handleGroupSelectedBlocks}
                    isRoot={true}
                  />
                )}
              </MDBox>

              {/* Logic preview */}
              {totalBlocks > 0 && (
                <MDBox mt={3} p={0} borderRadius="lg" bgcolor="grey.100" overflow="hidden">
                  <MDBox 
                    p={2} 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    bgcolor="rgba(0,0,0,0.03)"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setPreviewExpanded(!previewExpanded)}
                  >
                    <MDBox display="flex" alignItems="center">
                      <Icon sx={{ mr: 1 }}>{previewExpanded ? 'expand_less' : 'expand_more'}</Icon>
                      <MDTypography variant="button" fontWeight="bold">
                        Alert Logic Preview
                      </MDTypography>
                    </MDBox>
                    
                    {previewExpanded && (
                      <MDBox>
                        <ToggleButtonGroup
                          value={previewType}
                          exclusive
                          onChange={(e, newValue) => {
                            if (newValue) setPreviewType(newValue);
                          }}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ToggleButton value="simple">
                            <MDTypography variant="caption">Simple</MDTypography>
                          </ToggleButton>
                          <ToggleButton value="detailed">
                            <MDTypography variant="caption">Detailed</MDTypography>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </MDBox>
                    )}
                  </MDBox>
                  
                  <Collapse in={previewExpanded}>
                    <MDBox 
                      p={2}
                      bgcolor={previewType === 'detailed' ? 'rgba(0,0,0,0.02)' : 'transparent'}
                      sx={{
                        fontFamily: previewType === 'detailed' ? 'monospace' : 'inherit',
                        fontSize: previewType === 'detailed' ? '0.85rem' : 'inherit',
                        overflow: 'auto',
                        maxHeight: '300px',
                        whiteSpace: previewType === 'detailed' ? 'pre' : 'normal',
                        '& .highlight': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          borderRadius: '3px'
                        },
                        '& .operator': {
                          fontWeight: 'bold',
                          padding: '0 4px'
                        },
                        '& .operator-and': {
                          color: 'info.main',
                        },
                        '& .operator-or': {
                          color: 'warning.main',
                        },
                        '& .preview-item:hover, .preview-group:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.05)',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      {previewType === 'simple' ? (
                        <MDTypography 
                          variant="body2" 
                          component="div"
                          dangerouslySetInnerHTML={{ 
                            __html: generateSimpleLogicPreview(workflow.rootGroup) 
                          }}
                        />
                      ) : (
                        <MDBox
                          component="div"
                          className="logic-preview-detailed"
                          dangerouslySetInnerHTML={{ 
                            __html: getAlertLogicPreview() 
                          }}
                        />
                      )}
                    </MDBox>
                  </Collapse>
                </MDBox>
              )}

              {/* Alert delivery options */}
              <MDBox p={3} sx={{ backgroundColor: "white", borderRadius: "lg", boxShadow: "0 2px 12px 0 rgba(0,0,0,0.05)" }}>
                  <MDBox p={2}>
                    <MDTypography variant="button" fontWeight="medium">
                      Alert Delivery (Select multiple)
                    </MDTypography>
                    <MDBox mt={2} display="flex" flexWrap="wrap">
                      <MDButton 
                        variant={deliveryMethods.includes("email") ? "contained" : "outlined"}
                        color="info" 
                        size="small" 
                        sx={{ m: 0.5 }}
                        startIcon={<Icon>email</Icon>}
                        onClick={() => handleDeliveryMethodsChange("email")}
                      >
                        Email
                      </MDButton>
                      <MDButton 
                        variant={deliveryMethods.includes("sms") ? "contained" : "outlined"}
                        color="info" 
                        size="small" 
                        sx={{ m: 0.5 }}
                        startIcon={<Icon>sms</Icon>}
                        onClick={() => handleDeliveryMethodsChange("sms")}
                      >
                        SMS
                      </MDButton>
                      <MDButton 
                        variant={deliveryMethods.includes("discord") ? "contained" : "outlined"}
                        color="info" 
                        size="small" 
                        sx={{ m: 0.5 }}
                        startIcon={<Icon>forum</Icon>}
                        onClick={() => handleDeliveryMethodsChange("discord")}
                      >
                        Discord
                      </MDButton>
                      <MDButton 
                        variant={deliveryMethods.includes("telegram") ? "contained" : "outlined"}
                        color="info" 
                        size="small" 
                        sx={{ m: 0.5 }}
                        startIcon={<Icon>send</Icon>}
                        onClick={() => handleDeliveryMethodsChange("telegram")}
                      >
                        Telegram
                      </MDButton>
                    </MDBox>
                  </MDBox>
              </MDBox>

              {/* Save button */}
              <MDBox mt={3} display="flex" justifyContent="flex-end">
                <MDButton variant="text" color="error" sx={{ mr: 1 }}>
                  Cancel
                </MDButton>
                <MDButton 
                  variant="gradient" 
                  color="info"
                  disabled={!alertName || totalBlocks === 0 || deliveryMethods.length === 0}
                >
                  Save Alert
                </MDButton>
              </MDBox>
            </MDBox>
        </Grid>
      </Grid>

      {/* Signal Selector Modal */}
      <SignalSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleAddSignal}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </>
  );
}

export default AlertBuilder;
