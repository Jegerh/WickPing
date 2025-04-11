import React, { useState } from "react";
import { Box, Icon, ToggleButtonGroup, ToggleButton, IconButton, Collapse } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import SignalBlock from "./SignalBlock";

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
            ? "rgba(224, 242, 254, 0.4)" // Lighter blue for first level
            : "rgba(209, 233, 252, 0.5)", // Slightly darker blue for deeper nesting
        border: level === 0 
          ? "none" 
          : `1px solid rgba(25, 118, 210, 0.15)`, // Much subtler border
        boxShadow: 'none',  // Remove shadow entirely
        // Add a left border that gets thicker with nesting
        borderLeft: level > 0 ? `${Math.min(level + 2, 5)}px solid rgba(25, 118, 210, ${0.2 + (level * 0.05)})` : 'none',
        overflow: 'hidden' // Prevent child elements from creating overflow
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

export default LogicGroup;