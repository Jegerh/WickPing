import React, { useState } from "react";
import { Grid, Icon, TextField, Card, Paper, InputAdornment, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { getIndicatorCategoriesSync, getPopularIndicatorsSync } from "./indicatorsRegistry";
import { getBlockBorderColor, getBlockIconColor } from "./utils/colorUtils";
import { signalCategories } from "../../services/dataService";

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

export default SignalSelector;