import React, { useState, useEffect } from "react";
import { Grid, TextField, Icon, Collapse, ToggleButtonGroup, ToggleButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import LogicGroup from "./LogicGroup";
import SignalSelector from "./SignalSelector";
import { getDefaultConfig, getAccountsSync, getIndicatorByIdSync } from "../../services/dataService";

// Helper functions
const getItemId = () => `item-${Math.random().toString(36).substr(2, 9)}`;
const getGroupId = () => `group-${Math.random().toString(36).substr(2, 9)}`;

// Helper function for condition text generation
const getConditionText = (block) => {
  if (block.type === "indicator") {
    const indicator = getIndicatorByIdSync(block.content);
    if (!indicator) return `${block.content} condition`;
    
    const condition = indicator.conditions?.find(c => c.value === block.config.condition);
    const conditionText = condition ? condition.label : "condition met";
    
    return `${block.content} of ${block.config.symbol || "unknown symbol"} (${block.config.timeframe || "unknown timeframe"}) ${conditionText.toLowerCase()}${block.config.threshold ? " " + block.config.threshold : ""}`;
  } else if (block.type === "social") {
    return `${block.config.account || "Account"} tweets about "${block.config.keywords || "keywords"}"`;
  } else {
    return `${block.config.event || "Event"} with ${block.config.impact || "impact"} impact is released`;
  }
};

// Initial workflow state
const initialWorkflow = {
  rootGroup: {
    id: "root",
    type: "AND",
    blocks: [],
    groups: []
  }
};

// CSS styles for preview
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

function AlertBuilder() {
  // State variables
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [alertName, setAlertName] = useState("");
  const [deliveryMethods, setDeliveryMethods] = useState(["email"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState(null);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewType, setPreviewType] = useState('simple');

  // Toggle selection of a block
  const handleToggleSelectBlock = (groupId, blockId) => {
    setSelectedBlocks(prev => {
      if (prev.includes(blockId)) {
        return prev.filter(id => id !== blockId);
      } else {
        return [...prev, blockId];
      }
    });
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
    
    // Determine what to pass to getDefaultConfig based on signal type
    let config;
    if (signal.type === "indicator") {
      // For indicators, pass the content (name) to getDefaultConfig
      config = getDefaultConfig(signal.content);
    } else if (signal.type === "social") {
      // For social signals, create default config manually
      config = {
        account: getAccountsSync()[0]?.value || "",
        keywords: "bitcoin,crypto",
      };
    } else if (signal.type === "economic") {
      // For economic signals, create default config manually
      config = {
        event: "Earnings",
        impact: "High"
      };
    } else {
      // Fallback for unknown types
      config = {};
    }
    
    const newBlock = {
      ...signal,
      id: getItemId(),
      config: config
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