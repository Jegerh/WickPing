import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Box, ToggleButtonGroup, ToggleButton, Collapse, Icon } from "@mui/material";
import { generateLogicPreview, generateSimpleLogicPreview } from "../utils/previewUtils";

function LogicPreview({ workflow, expanded, setExpanded, previewType, setPreviewType }) {
  return (
    <MDBox mt={3} p={0} borderRadius="lg" bgcolor="grey.100" overflow="hidden">
      {/* Preview Header */}
      <MDBox 
        p={2} 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        bgcolor="rgba(0,0,0,0.03)"
        sx={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <MDBox display="flex" alignItems="center">
          <Icon sx={{ mr: 1 }}>{expanded ? 'expand_less' : 'expand_more'}</Icon>
          <MDTypography variant="button" fontWeight="bold">
            Alert Logic Preview
          </MDTypography>
        </MDBox>
        
        {expanded && (
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
      
      {/* Preview Content */}
      <Collapse in={expanded}>
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
                __html: generateLogicPreview(workflow.rootGroup) 
              }}
            />
          )}
        </MDBox>
      </Collapse>
    </MDBox>
  );
}

export default LogicPreview;