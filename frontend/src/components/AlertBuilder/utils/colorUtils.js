// Enhanced color system for signal categories
const categoryColors = {
  // Technical indicators
  momentum: {
    primary: '#1976d2',      // Blue
    light: '#e3f2fd',
    border: 'rgba(25, 118, 210, 0.5)',
    icon: 'trending_up'
  },
  trend: {
    primary: '#7b1fa2',      // Purple
    light: '#f3e5f5',
    border: 'rgba(123, 31, 162, 0.5)',
    icon: 'show_chart'
  },
  volatility: {
    primary: '#ff9800',      // Orange
    light: '#fff3e0',
    border: 'rgba(255, 152, 0, 0.5)',
    icon: 'waterfall_chart'
  },
  volume: {
    primary: '#2e7d32',      // Green
    light: '#e8f5e9',
    border: 'rgba(46, 125, 50, 0.5)',
    icon: 'ssid_chart'
  },
  // Other signal types
  social: {
    primary: '#0288d1',      // Light Blue
    light: '#e1f5fe',
    border: 'rgba(2, 136, 209, 0.5)',
    icon: 'forum'
  },
  economic: {
    primary: '#d32f2f',      // Red
    light: '#ffebee',
    border: 'rgba(211, 47, 47, 0.5)',
    icon: 'event_note'
  },
  // Default fallback
  default: {
    primary: '#757575',      // Grey
    light: '#f5f5f5',
    border: 'rgba(117, 117, 117, 0.5)',
    icon: 'widgets'
  }
};
  
// Helper function to get colors for a block
const getBlockColors = (type, category) => {
  // First try to match by category if available
  if (category && categoryColors[category]) {
    return categoryColors[category];
  }
  
  // Then try to match by type
  switch(type) {
    case 'indicator': 
      return categoryColors.trend;  // Default for indicators
    case 'social': 
      return categoryColors.social;
    case 'economic': 
      return categoryColors.economic;
    default: 
      return categoryColors.default;
  }
};

// These functions should replace your existing ones
const getBlockBorderColor = (type) => {
  // Keep backwards compatibility
  return getBlockColors(type).border;
};

const getBlockHeaderColor = (type) => {
  // Keep backwards compatibility
  return getBlockColors(type).light;
};

const getBlockIconColor = (type) => {
  // Keep backwards compatibility
  return getBlockColors(type).primary;
};

const getBlockHoverBorderColor = (type) => {
  // For hover states
  const colors = getBlockColors(type);
  return colors.primary;
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

export {
  getBlockBorderColor,
  getBlockHeaderColor,
  getBlockIconColor,
  getBlockHoverBorderColor,
  darkenColor
};