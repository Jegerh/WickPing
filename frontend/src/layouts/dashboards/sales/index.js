import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDBadgeDot from "components/MDBadgeDot";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DefaultStatisticsCard from "examples/Cards/StatisticsCards/DefaultStatisticsCard";
import DataTable from "examples/Tables/DataTable";

// Import new components for alert creation
import AlertBuilder from "components/AlertBuilder";
import RecentAlertsList from "components/RecentAlertsList";

function Alerts() {
  const [tabValue, setTabValue] = useState(0);
  const [timeframeValue, setTimeframeValue] = useState("Last 24 hours");
  const [timeframeDropdown, setTimeframeDropdown] = useState(null);

  // Handlers for tabs
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Dropdown handlers
  const openTimeframeDropdown = ({ currentTarget }) => setTimeframeDropdown(currentTarget);
  const closeTimeframeDropdown = ({ currentTarget }) => {
    setTimeframeDropdown(null);
    setTimeframeValue(currentTarget.innerText || timeframeValue);
  };

  // Dropdown menu template
  const renderMenu = (state, close) => (
    <Menu
      anchorEl={state}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      open={Boolean(state)}
      onClose={close}
      keepMounted
      disableAutoFocusItem
    >
      <MenuItem onClick={close}>Last 24 hours</MenuItem>
      <MenuItem onClick={close}>Last 7 days</MenuItem>
      <MenuItem onClick={close}>Last 30 days</MenuItem>
    </Menu>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Stats Cards */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <DefaultStatisticsCard
                title="Active Alerts"
                count="8"
                percentage={{
                  color: "success",
                  value: "+22222",
                  label: "since yesterday",
                }}
                dropdown={{
                  action: openTimeframeDropdown,
                  menu: renderMenu(timeframeDropdown, closeTimeframeDropdown),
                  value: timeframeValue,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DefaultStatisticsCard
                title="Alerts Triggered"
                count="24"
                percentage={{
                  color: "success",
                  value: "+5",
                  label: "since yesterday",
                }}
                dropdown={{
                  action: openTimeframeDropdown,
                  menu: renderMenu(timeframeDropdown, closeTimeframeDropdown),
                  value: timeframeValue,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DefaultStatisticsCard
                title="Avg. Response Time"
                count="1.2s"
                percentage={{
                  color: "success",
                  value: "-0.3s",
                  label: "since last week",
                }}
                dropdown={{
                  action: openTimeframeDropdown,
                  menu: renderMenu(timeframeDropdown, closeTimeframeDropdown),
                  value: timeframeValue,
                }}
              />
            </Grid>
          </Grid>
        </MDBox>
        
        {/* Tabs for Alert Creation and Management */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Create Alert" />
                <Tab label="My Alerts" />
                <Tab label="Templates" />
              </Tabs>
              
              {/* Tab content */}
              <MDBox py={3}>
                {tabValue === 0 && (
                  <AlertBuilder />
                )}
                {tabValue === 1 && (
                  <DataTable 
                    table={{
                      columns: [
                        { Header: "Alert Name", accessor: "name" },
                        { Header: "Type", accessor: "type" },
                        { Header: "Sources", accessor: "sources" },
                        { Header: "Status", accessor: "status" },
                        { Header: "Last Triggered", accessor: "lastTriggered" },
                        { Header: "Actions", accessor: "actions" },
                      ],
                      rows: [
                        {
                          name: "Bitcoin Volume + Trump Tweet",
                          type: "Multi-Signal",
                          sources: "Twitter, Binance",
                          status: "Active",
                          lastTriggered: "2h ago",
                          actions: (
                            <MDBox display="flex">
                              <Tooltip title="Edit Alert" placement="top">
                                <MDButton variant="text" color="info" iconOnly>
                                  <Icon>edit</Icon>
                                </MDButton>
                              </Tooltip>
                              <Tooltip title="Pause Alert" placement="top">
                                <MDButton variant="text" color="warning" iconOnly>
                                  <Icon>pause</Icon>
                                </MDButton>
                              </Tooltip>
                              <Tooltip title="Delete Alert" placement="top">
                                <MDButton variant="text" color="error" iconOnly>
                                  <Icon>delete</Icon>
                                </MDButton>
                              </Tooltip>
                            </MDBox>
                          ),
                        },
                        // Add more sample alerts here
                      ],
                    }}
                  />
                )}
                {tabValue === 2 && (
                  <Grid container spacing={3}>
                    {/* Template cards would go here */}
                    <Grid item xs={12} md={4}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6">Bitcoin + Tweet Alert</MDTypography>
                          <MDTypography variant="body2" color="text">
                            Triggers when specified person tweets about Bitcoin and volume increases
                          </MDTypography>
                          <MDBox mt={2} display="flex" justifyContent="space-between">
                            <MDButton variant="gradient" color="info" size="small">
                              Use Template
                            </MDButton>
                            <MDButton variant="outlined" color="info" size="small">
                              Preview
                            </MDButton>
                          </MDBox>
                        </MDBox>
                      </Card>
                    </Grid>
                    {/* More template cards */}
                  </Grid>
                )}
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
        
        {/* Recent Alert Activity */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Recent Alert Activity
                  </MDTypography>
                </MDBox>
                <MDBox py={1}>
                  <RecentAlertsList />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Alerts;