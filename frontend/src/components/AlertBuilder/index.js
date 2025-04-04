import React from "react";
import { Card, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function AlertBuilder() {
  return (
    <MDBox>
      <MDTypography variant="h6" mb={3}>
        Alert Builder Coming Soon
      </MDTypography>
      <MDBox mb={3}>
        <MDTypography variant="body2">
          This is a placeholder for the AlertBuilder component. You'll implement the drag-and-drop interface here.
        </MDTypography>
      </MDBox>
      <MDBox display="flex" justifyContent="flex-end">
        <MDButton variant="gradient" color="info">
          Save Alert
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

export default AlertBuilder;