import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { 
  Card, Grid, Icon, Divider, TextField, Select, MenuItem, FormControl, 
  InputLabel, Box, Autocomplete, ToggleButton, ToggleButtonGroup, InputAdornment 
} from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

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

// Initial data structure
const initialSources = {
  marketIndicators: [
    { id: "rsi", content: "RSI", icon: "trending_up", type: "indicator" },
    { id: "macd", content: "MACD", icon: "show_chart", type: "indicator" },
    { id: "bollinger", content: "Bollinger Bands", icon: "waterfall_chart", type: "indicator" },
    { id: "volume", content: "Volume", icon: "ssid_chart", type: "indicator" }
  ],
  socialMedia: [
    { id: "twitter", content: "Twitter/X", icon: "tag", type: "social" },
    { id: "reddit", content: "Reddit", icon: "forum", type: "social" },
    { id: "stocktwits", content: "StockTwits", icon: "message", type: "social" }
  ],
  economicData: [
    { id: "earnings", content: "Earnings Reports", icon: "receipt_long", type: "economic" },
    { id: "news", content: "News Releases", icon: "newspaper", type: "economic" },
    { id: "calendar", content: "Economic Calendar", icon: "event", type: "economic" }
  ]
};

// Initial workflow state with root group
const initialWorkflow = {
  rootGroup: {
    id: "root",
    type: "AND",
    items: [],
    groups: []
  }
};

// Condition item component
function ConditionItem({ item, onRemove, onUpdate }) {
  return (
    <MDBox 
      mb={2}
      p={2}
      borderRadius="lg"
      sx={{ 
        backgroundColor: "white", 
        boxShadow: '0 3px 5px rgba(0,0,0,0.08)',
        border: "1px solid",
        borderColor: getItemBorderColor(item.type),
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
          borderColor: getItemHoverBorderColor(item.type),
        }
      }}
    >
      <MDBox 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={1}
        bgcolor={getItemHeaderColor(item.type)}
        borderRadius="md"
        p={1}
        ml={-1}
        mr={-1}
        mt={-1}
      >
        <MDBox display="flex" alignItems="center">
          <Icon sx={{ 
            mr: 1,
            color: getItemIconColor(item.type)
          }}>{item.icon}</Icon>
          <MDTypography variant="button" fontWeight="medium" color="dark">
            {item.content}
          </MDTypography>
        </MDBox>
        <MDButton 
          variant="text" 
          color="error" 
          size="small"
          onClick={onRemove}
        >
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>

      <Divider sx={{ mb: 2 }} />

      <MDBox mt={2}>
        {/* Different config options based on signal type */}
        {item.type === "indicator" && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  options={supportedSymbols}
                  getOptionLabel={(option) => option.label || option}
                  isOptionEqualToValue={(option, value) => option.value === value || option.value === value.value}
                  value={supportedSymbols.find(s => s.value === item.config.symbol) || null}
                  onChange={(e, newValue) => onUpdate({ symbol: newValue?.value || "" })}
                  renderInput={(params) => <TextField {...params} label="Symbol" />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={item.config.timeframe}
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
            
            {/* Indicator-specific conditions */}
            {item.content === "RSI" && (
              <>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={item.config.condition || "crossesAbove"}
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
                    value={item.config.threshold || 70}
                    onChange={(e) => onUpdate({ threshold: e.target.value })}
                    variant="outlined"
                    size="small"
                    helperText="70+ typically overbought, 30- oversold"
                  />
                </Grid>
              </>
            )}
            
            {item.content === "MACD" && (
              <>
                <Grid item xs={12} sm={8}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={item.config.condition || "lineAboveSignal"}
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
              </>
            )}
            
            {item.content === "Bollinger Bands" && (
              <>
                <Grid item xs={12} sm={8}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={item.config.condition || "priceAboveUpper"}
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
                    value={item.config.standardDeviations || 2}
                    onChange={(e) => onUpdate({ standardDeviations: e.target.value })}
                    variant="outlined"
                    size="small"
                    helperText="Usually 2.0"
                  />
                </Grid>
              </>
            )}
            
            {item.content === "Volume" && (
              <>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={item.config.condition || "increasesBy"}
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
                    label={item.config.condition?.includes("Average") ? "Percentage" : 
                          item.config.condition === "exceeds" ? "Value" : "Percentage"}
                    type="number"
                    value={item.config.percentage || 20}
                    onChange={(e) => onUpdate({ percentage: e.target.value })}
                    variant="outlined"
                    size="small"
                    InputProps={item.config.condition !== "exceeds" ? {
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    } : undefined}
                  />
                </Grid>
                {item.config.condition?.includes("Average") && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Periods"
                      type="number"
                      value={item.config.periods || 20}
                      onChange={(e) => onUpdate({ periods: e.target.value })}
                      variant="outlined"
                      size="small"
                      helperText="For moving average"
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        )}

        {item.type === "social" && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  options={supportedAccounts}
                  getOptionLabel={(option) => option.label || option}
                  isOptionEqualToValue={(option, value) => option.value === value || option.value === value.value}
                  value={supportedAccounts.find(a => a.value === item.config.account) || null}
                  onChange={(e, newValue) => onUpdate({ account: newValue?.value || "" })}
                  renderInput={(params) => <TextField {...params} label="Account" />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Keywords (comma separated)"
                value={item.config.keywords}
                onChange={(e) => onUpdate({ keywords: e.target.value })}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        )}

        {item.type === "economic" && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Event</InputLabel>
                <Select
                  value={item.config.event}
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
                  value={item.config.impact}
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
    </MDBox>
  );
}

// Helper functions for different item type colors
const getItemBorderColor = (type) => {
  switch(type) {
    case 'indicator': return 'rgba(25, 118, 210, 0.3)';  // Blue for indicators
    case 'social': return 'rgba(76, 175, 80, 0.3)';      // Green for social
    case 'economic': return 'rgba(255, 152, 0, 0.3)';    // Orange for economic
    default: return 'grey.300';
  }
};

const getItemHoverBorderColor = (type) => {
  switch(type) {
    case 'indicator': return 'rgba(25, 118, 210, 0.7)';  // Darker blue
    case 'social': return 'rgba(76, 175, 80, 0.7)';      // Darker green
    case 'economic': return 'rgba(255, 152, 0, 0.7)';    // Darker orange
    default: return 'grey.500';
  }
};

const getItemHeaderColor = (type) => {
  switch(type) {
    case 'indicator': return 'rgba(232, 244, 253, 0.8)';  // Light blue bg
    case 'social': return 'rgba(237, 247, 237, 0.8)';     // Light green bg
    case 'economic': return 'rgba(255, 243, 224, 0.8)';   // Light orange bg
    default: return 'grey.100';
  }
};

const getItemIconColor = (type) => {
  switch(type) {
    case 'indicator': return 'primary.main';  // Blue icon
    case 'social': return 'success.main';     // Green icon
    case 'economic': return 'warning.main';   // Orange icon
    default: return 'text.secondary';
  }
};

function LogicalGroup({ 
  group, 
  onAddGroup, 
  onRemoveGroup, 
  onChangeType,
  onRemoveItem,
  onUpdateItem,
  level = 0,
  isRoot = false
}) {
  return (
    <MDBox 
      p={2} 
      mb={2}
      borderRadius="lg"
      sx={{ 
        backgroundColor: level === 0 ? "transparent" : "rgba(224, 242, 254, 0.6)", // Light blue for groups
        border: level === 0 ? "none" : "1px solid",
        borderColor: "info.light",
        boxShadow: level > 0 ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
      }}
    >
      {level > 0 && (
        <MDBox 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2}
          bgcolor="rgba(214, 236, 251, 0.8)"
          p={1}
          borderRadius="md"
        >
          <ToggleButtonGroup
            value={group.type}
            exclusive
            onChange={(e, newValue) => onChangeType(group.id, newValue)}
            size="small"
            color="primary"
            sx={{
              bgcolor: "white",
              '& .MuiToggleButton-root.Mui-selected': {
                backgroundColor: 'info.light',
                color: 'white'
              }
            }}
          >
            <ToggleButton value="AND">
              <MDTypography variant="button" fontWeight="medium">ALL (AND)</MDTypography>
            </ToggleButton>
            <ToggleButton value="OR">
              <MDTypography variant="button" fontWeight="medium">ANY (OR)</MDTypography>
            </ToggleButton>
          </ToggleButtonGroup>
          
          {!isRoot && (
            <MDButton 
              variant="text" 
              color="error" 
              size="small"
              onClick={() => onRemoveGroup(group.id)}
            >
              <Icon>delete</Icon>
            </MDButton>
          )}
        </MDBox>
      )}
      
      {/* Conditions area */}
      <Droppable droppableId={group.id} type="ITEM">
        {(provided) => (
          <MDBox
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{ 
              minHeight: "50px",
              padding: isRoot ? "8px" : "8px",
              backgroundColor: isRoot ? "rgba(0,0,0,0.02)" : "white",
              borderRadius: "6px",
              border: isRoot ? "1px dashed rgba(0,0,0,0.1)" : "none"
            }}
          >
            {group.items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ConditionItem 
                      item={item} 
                      onRemove={() => onRemoveItem(group.id, item.id)}
                      onUpdate={(config) => onUpdateItem(group.id, item.id, config)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </MDBox>
        )}
      </Droppable>
      
      {/* Nested groups - only show existing ones */}
      {group.groups.map(subGroup => (
        <LogicalGroup
          key={subGroup.id}
          group={subGroup}
          onAddGroup={onAddGroup}
          onRemoveGroup={onRemoveGroup}
          onChangeType={onChangeType}
          onRemoveItem={onRemoveItem}
          onUpdateItem={onUpdateItem}
          level={level + 1}
          isRoot={false}
        />
      ))}
      
      {/* Add nested group button - only show if level < 1 (root or first level) */}
      {level < 1 && (
        <MDBox display="flex" justifyContent="center" mt={2}>
          <MDButton 
            variant="outlined" 
            color="info" 
            size="small"
            startIcon={<Icon>add_circle</Icon>}
            onClick={() => onAddGroup(group.id)}
            sx={{
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }
            }}
          >
            Add Condition Group
          </MDButton>
        </MDBox>
      )}
    </MDBox>
  );
}

function AlertBuilder() {
  const [sources, setSources] = useState(initialSources);
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [alertName, setAlertName] = useState("");
  const [deliveryMethods, setDeliveryMethods] = useState(["email"]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("popular");

  // Helper function to get visible indicators based on search and selected category
  const getVisibleIndicators = () => {
    let result = [];
    
    // Handle search case
    if (searchTerm) {
      // Search across all categories
      const allSearchResults = [
        {
          id: "marketIndicators",
          title: "Market Indicators",
          items: sources.marketIndicators.filter(item => 
            item.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        },
        {
          id: "socialMedia",
          title: "Social Media",
          items: sources.socialMedia.filter(item => 
            item.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        },
        {
          id: "economicData",
          title: "Economic Data",
          items: sources.economicData.filter(item => 
            item.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
      ];
      
      // Only include categories with matching items
      result = allSearchResults.filter(category => category.items.length > 0);
    } 
    // Handle category browsing
    else {
      switch (activeCategory) {
        case "popular":
          // Show a subset of popular indicators from each category
          result = [
            {
              id: "popularIndicators",
              title: "Popular Indicators",
              items: [
                ...sources.marketIndicators.slice(0, 4),
                ...sources.socialMedia.slice(0, 1)
              ]
            }
          ];
          break;
        case "trend":
          result = [
            {
              id: "trendIndicators",
              title: "Trend Indicators",
              items: sources.marketIndicators.filter(item => 
                ["MACD", "Moving Average", "Bollinger Bands"].includes(item.content)
              )
            }
          ];
          break;
        case "momentum":
          result = [
            {
              id: "momentumIndicators",
              title: "Momentum Indicators",
              items: sources.marketIndicators.filter(item => 
                ["RSI", "Stochastic", "CCI"].includes(item.content)
              )
            }
          ];
          break;
        case "social":
          result = [
            {
              id: "socialMedia",
              title: "Social Media",
              items: sources.socialMedia
            }
          ];
          break;
        default:
          // Fall back to showing all categories
          result = [
            {
              id: "marketIndicators",
              title: "Market Indicators",
              items: sources.marketIndicators
            },
            {
              id: "socialMedia",
              title: "Social Media",
              items: sources.socialMedia
            },
            {
              id: "economicData",
              title: "Economic Data",
              items: sources.economicData
            }
          ];
      }
    }
    
    return result;
  };

  // Toggle delivery methods
  const handleDeliveryMethodsChange = (method) => {
    if (deliveryMethods.includes(method)) {
      setDeliveryMethods(deliveryMethods.filter(m => m !== method));
    } else {
      setDeliveryMethods([...deliveryMethods, method]);
    }
  };

  // Add a new logical group
  const handleAddGroup = (parentId) => {
    const newGroup = {
      id: getGroupId(),
      type: "AND",
      items: [],
      groups: []
    };
    
    setWorkflow({
      ...workflow,
      rootGroup: addGroupToParent(workflow.rootGroup, parentId, newGroup)
    });
  };
  
  // Remove a logical group
  const handleRemoveGroup = (groupId) => {
    setWorkflow({
      ...workflow,
      rootGroup: removeGroupFromHierarchy(workflow.rootGroup, groupId)
    });
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
  
  // Remove a group from the hierarchy
  const removeGroupFromHierarchy = (currentGroup, groupId) => {
    return {
      ...currentGroup,
      groups: currentGroup.groups
        .filter(group => group.id !== groupId)
        .map(group => removeGroupFromHierarchy(group, groupId))
    };
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

  // Remove an item from a group
  const handleRemoveItem = (groupId, itemId) => {
    setWorkflow({
      ...workflow,
      rootGroup: removeItemFromGroup(workflow.rootGroup, groupId, itemId)
    });
  };
  
  // Remove item from specified group
  const removeItemFromGroup = (currentGroup, groupId, itemId) => {
    if (currentGroup.id === groupId) {
      return {
        ...currentGroup,
        items: currentGroup.items.filter(item => item.id !== itemId)
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        removeItemFromGroup(group, groupId, itemId)
      )
    };
  };
  
  // Update item configuration
  const handleUpdateItem = (groupId, itemId, newConfig) => {
    setWorkflow({
      ...workflow,
      rootGroup: updateItemInGroup(workflow.rootGroup, groupId, itemId, newConfig)
    });
  };
  
  // Update item in specified group
  const updateItemInGroup = (currentGroup, groupId, itemId, newConfig) => {
    if (currentGroup.id === groupId) {
      return {
        ...currentGroup,
        items: currentGroup.items.map(item => 
          item.id === itemId ? { ...item, config: { ...item.config, ...newConfig } } : item
        )
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        updateItemInGroup(group, groupId, itemId, newConfig)
      )
    };
  };

  // Find the group by ID
  const findGroup = (currentGroup, groupId) => {
    if (currentGroup.id === groupId) {
      return currentGroup;
    }
    
    for (const group of currentGroup.groups) {
      const found = findGroup(group, groupId);
      if (found) return found;
    }
    
    return null;
  };

  // Helper function to get appropriate default config
  const getDefaultConfigForItem = (item) => {
    if (item.type === "indicator") {
      if (item.content === "RSI") {
        return {
          symbol: supportedSymbols[0].value,
          timeframe: "15m",
          condition: "crossesAbove",
          threshold: 70
        };
      } else if (item.content === "MACD") {
        return {
          symbol: supportedSymbols[0].value,
          timeframe: "15m",
          condition: "lineAboveSignal"
        };
      } else if (item.content === "Bollinger Bands") {
        return {
          symbol: supportedSymbols[0].value,
          timeframe: "15m",
          condition: "priceAboveUpper",
          standardDeviations: 2
        };
      } else if (item.content === "Volume") {
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
    } else if (item.type === "social") {
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
  };

  const onDragEnd = (result) => {
    console.log("Drag end triggered", result);
    const { source, destination } = result;
  
    // Dropped outside any droppable
    if (!destination) {
      console.log("No destination");
      return;
    }
    
    console.log("Source:", source);
    console.log("Destination:", destination);
    console.log("Type:", result.type);
    console.log("Drag result:", result);
    
    // Find the dragged item regardless of which category it's from
    let sourceItem;
    
    // Get all visible categories
    const allCategories = getVisibleIndicators();
    
    // Find the category that matches the source droppableId
    const sourceCategory = allCategories.find(category => category.id === source.droppableId);
    
    if (sourceCategory && sourceCategory.items[source.index]) {
      sourceItem = sourceCategory.items[source.index];
    } else {
      console.log("Could not find source item");
      return;
    }
    
    // Create a new item with appropriate default config
    const newItem = {
      ...sourceItem,
      id: getItemId(),
      originalId: sourceItem.id,
      config: getDefaultConfigForItem(sourceItem)
    };
    
    // Add item to workflow
    setWorkflow(prevWorkflow => {
      return {
        ...prevWorkflow,
        rootGroup: addItemToGroup(prevWorkflow.rootGroup, destination.droppableId, newItem, destination.index)
      };
    });
  };

  // Helper to find an item in a group
  const findItemInGroup = (group, groupId, itemIndex) => {
    if (group.id === groupId && group.items.length > itemIndex) {
      return group.items[itemIndex];
    }
    
    for (const subGroup of group.groups) {
      const found = findItemInGroup(subGroup, groupId, itemIndex);
      if (found) return found;
    }
    
    return null;
  };
  
  // Add item to a group
  const addItemToGroup = (currentGroup, groupId, item, index) => {
    if (currentGroup.id === groupId) {
      const newItems = Array.from(currentGroup.items);
      newItems.splice(index, 0, item);
      
      return {
        ...currentGroup,
        items: newItems
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        addItemToGroup(group, groupId, item, index)
      )
    };
  };
  
  // Reorder items within a group
  const reorderItemsInGroup = (currentGroup, groupId, sourceIndex, destinationIndex) => {
    if (currentGroup.id === groupId) {
      const newItems = Array.from(currentGroup.items);
      const [removed] = newItems.splice(sourceIndex, 1);
      newItems.splice(destinationIndex, 0, removed);
      
      return {
        ...currentGroup,
        items: newItems
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        reorderItemsInGroup(group, groupId, sourceIndex, destinationIndex)
      )
    };
  };
  
  // Move item between groups
  const moveItemBetweenGroups = (currentGroup, sourceId, destId, sourceIndex, destIndex, item) => {
    // First, create a version with the item removed from source
    const withItemRemoved = removeItemAt(currentGroup, sourceId, sourceIndex);
    
    // Then, add the item to the destination
    return addItemToGroup(withItemRemoved, destId, item, destIndex);
  };
  
  // Remove item at a specific index
  const removeItemAt = (currentGroup, groupId, index) => {
    if (currentGroup.id === groupId) {
      const newItems = Array.from(currentGroup.items);
      newItems.splice(index, 1);
      
      return {
        ...currentGroup,
        items: newItems
      };
    }
    
    return {
      ...currentGroup,
      groups: currentGroup.groups.map(group => 
        removeItemAt(group, groupId, index)
      )
    };
  };

  // Generate a preview of the alert logic
  const getAlertLogicPreview = () => {
    return generateLogicPreview(workflow.rootGroup);
  };
  
  // Recursively generate logic preview
  const generateLogicPreview = (group) => {
    const itemConditions = group.items.map(item => {
      if (item.type === "indicator") {
        if (item.content === "RSI") {
          const conditionText = {
            crossesAbove: "crosses above",
            crossesBelow: "crosses below",
            staysAbove: "stays above",
            staysBelow: "stays below"
          }[item.config.condition] || "crosses";
          
          return `RSI of ${item.config.symbol} (${item.config.timeframe}) ${conditionText} ${item.config.threshold}`;
        } 
        else if (item.content === "MACD") {
          const conditionText = {
            lineAboveSignal: "line crosses above signal line",
            lineBelowSignal: "line crosses below signal line",
            histogramPositive: "histogram becomes positive",
            histogramNegative: "histogram becomes negative",
            histogramIncreasing: "histogram is increasing",
            histogramDecreasing: "histogram is decreasing"
          }[item.config.condition] || "crosses";
          
          return `MACD of ${item.config.symbol} (${item.config.timeframe}) ${conditionText}`;
        }
        else if (item.content === "Bollinger Bands") {
          const conditionText = {
            priceAboveUpper: "price crosses above upper band",
            priceBelowLower: "price crosses below lower band",
            priceToMiddleFromAbove: "price returns to middle band from above",
            priceToMiddleFromBelow: "price returns to middle band from below",
            bandsSqueezing: "bands are narrowing (decreasing volatility)",
            bandsExpanding: "bands are widening (increasing volatility)"
          }[item.config.condition] || "condition met";
          
          return `Bollinger Bands (${item.config.standardDeviations}σ) of ${item.config.symbol} (${item.config.timeframe}) ${conditionText}`;
        }
        else if (item.content === "Volume") {
          const conditionText = {
            increasesBy: `increases by ${item.config.percentage}%`,
            decreasesBy: `decreases by ${item.config.percentage}%`,
            exceedsAverage: `exceeds ${item.config.periods}-period average by ${item.config.percentage}%`,
            fallsBelowAverage: `falls below ${item.config.periods}-period average by ${item.config.percentage}%`,
            exceeds: `exceeds ${item.config.percentage}`
          }[item.config.condition] || "changes significantly";
          
          return `Volume of ${item.config.symbol} (${item.config.timeframe}) ${conditionText}`;
        }
        else {
          return `${item.content} of ${item.config.symbol} (${item.config.timeframe}) condition met`;
        }
      } else if (item.type === "social") {
        return `${item.config.account} tweets about "${item.config.keywords}"`;
      } else {
        return `${item.config.event} with ${item.config.impact} impact is released`;
      }
    });
    
    const groupConditions = group.groups.map(subGroup => {
      const subCondition = generateLogicPreview(subGroup);
      return `(${subCondition})`;
    });
    
    const allConditions = [...itemConditions, ...groupConditions];
    
    if (allConditions.length === 0) {
      return "No conditions added";
    }
    
    return allConditions.join(` ${group.type} `);
  };
  
  // Count total items across all groups
  const countTotalItems = (group) => {
    let count = group.items.length;
    
    for (const subGroup of group.groups) {
      count += countTotalItems(subGroup);
    }
    
    return count;
  };
  
  const totalItems = countTotalItems(workflow.rootGroup);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MDBox mb={3}>
        <Card>
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
        </Card>
      </MDBox>

      <Grid container spacing={3}>
        {/* Left side - Source blocks */}
        <Grid item xs={12} md={4}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Signal Sources
              </MDTypography>
              
              <MDBox mt={2} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search indicators (RSI, MACD, etc.)..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon>search</Icon>
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <MDButton 
                          variant="text" 
                          color="secondary" 
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <Icon>clear</Icon>
                        </MDButton>
                      </InputAdornment>
                    )
                  }}
                />
              </MDBox>
              
              {/* Show category buttons for easy browsing */}
              <MDBox display="flex" flexWrap="wrap" gap={1} mb={2}>
                <MDButton 
                  variant="outlined"
                  size="small"
                  onClick={() => setActiveCategory("popular")}
                  color={activeCategory === "popular" ? "info" : "secondary"}
                >
                  Popular
                </MDButton>
                <MDButton
                  variant="outlined"
                  size="small"
                  onClick={() => setActiveCategory("trend")}
                  color={activeCategory === "trend" ? "info" : "secondary"}
                >
                  Trend
                </MDButton>
                <MDButton
                  variant="outlined"
                  size="small"
                  onClick={() => setActiveCategory("momentum")}
                  color={activeCategory === "momentum" ? "info" : "secondary"}
                >
                  Momentum
                </MDButton>
                <MDButton
                  variant="outlined"
                  size="small"
                  onClick={() => setActiveCategory("social")}
                  color={activeCategory === "social" ? "info" : "secondary"}
                >
                  Social
                </MDButton>
              </MDBox>
              
              {/* Display filtered indicators based on search and/or category */}
              <MDBox mt={2}>
                {getVisibleIndicators().map((category) => (
                  <React.Fragment key={category.id}>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      {category.title}
                    </MDTypography>
                    <Droppable droppableId={category.id} type="ITEM">
                      {(provided) => (
                        <MDBox
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          mt={1}
                          mb={2}
                        >
                          {category.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <MDBox
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  mb={1}
                                  p={1.5}
                                  borderRadius="lg"
                                  sx={{ 
                                    backgroundColor: "light.main", 
                                    border: "1px solid",
                                    borderColor: "light.main",
                                    "&:hover": { borderColor: "info.main" },
                                    cursor: "grab"
                                  }}
                                >
                                  <MDBox display="flex" alignItems="center">
                                    <Icon sx={{ mr: 1 }}>{item.icon}</Icon>
                                    <MDTypography variant="button" fontWeight="regular">
                                      {item.content}
                                    </MDTypography>
                                  </MDBox>
                                </MDBox>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </MDBox>
                      )}
                    </Droppable>
                  </React.Fragment>
                ))}
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Right side - Workflow area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Alert Workflow
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Drag signals to groups and configure conditions
              </MDTypography>

              <MDBox
                mt={2}
                p={2}
                borderRadius="lg"
                sx={{ 
                  backgroundColor: "grey.100", 
                  minHeight: "250px",
                  border: "2px dashed",
                  borderColor: totalItems ? "grey.300" : "info.main"
                }}
              >
                {totalItems === 0 && (
                  <MDBox 
                    height="100%" 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center"
                  >
                    <MDTypography variant="button" color="text" fontWeight="regular">
                      Drag signals here to build your alert
                    </MDTypography>
                  </MDBox>
                )}

                <LogicalGroup 
                  group={workflow.rootGroup}
                  onAddGroup={handleAddGroup}
                  onRemoveGroup={handleRemoveGroup}
                  onChangeType={handleChangeGroupType}
                  onRemoveItem={handleRemoveItem}
                  onUpdateItem={handleUpdateItem}
                  isRoot={true} // Mark the root group
                />
              </MDBox>

              {/* Logic preview */}
              {totalItems > 0 && (
                <MDBox mt={2} p={2} borderRadius="lg" bgcolor="grey.100">
                  <MDTypography variant="button" fontWeight="bold">
                    Alert Logic Preview:
                  </MDTypography>
                  <MDTypography variant="body2" mt={1} fontWeight="regular">
                    {getAlertLogicPreview()}
                  </MDTypography>
                </MDBox>
              )}

              {/* Alert delivery options */}
              <MDBox mt={3}>
                <Card>
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
                </Card>
              </MDBox>

              {/* Save button */}
              <MDBox mt={3} display="flex" justifyContent="flex-end">
                <MDButton variant="text" color="error" sx={{ mr: 1 }}>
                  Cancel
                </MDButton>
                <MDButton 
                  variant="gradient" 
                  color="info"
                  disabled={!alertName || totalItems === 0 || deliveryMethods.length === 0}
                >
                  Save Alert
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </DragDropContext>
  );
}

export default AlertBuilder;