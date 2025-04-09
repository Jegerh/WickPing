// Replace the entire content of indicatorsRegistry.js with this code



// Import all functions from the data service
import { 
  getIndicatorByIdSync, 
  getDefaultConfig, 
  getIndicatorCategoriesSync, 
  getPopularIndicatorsSync 
} from "../../services/dataService";

// Re-export the functions to maintain backward compatibility
export const getIndicatorById = getIndicatorByIdSync;
export const getIndicatorCategories = getIndicatorCategoriesSync;
export const getPopularIndicators = getPopularIndicatorsSync;

// Export all sync versions directly
export { 
  getIndicatorByIdSync, 
  getIndicatorCategoriesSync, 
  getPopularIndicatorsSync,
  getDefaultConfig
};

console.log("INDICATORS_REGISTRY initialized via data service");