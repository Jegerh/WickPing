import React from "react";
import { Card, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

function RecentAlertsList() {
  // Sample data - replace with real data later
  const alertsData = {
    columns: [
      { Header: "Alert Name", accessor: "name" },
      { Header: "Triggered At", accessor: "time" },
      { Header: "Status", accessor: "status" },
      { Header: "Details", accessor: "details" },
    ],
    rows: [
      {
        name: "Bitcoin Volume Alert",
        time: "Today, 14:23",
        status: "Triggered",
        details: "BTC volume increased by 23% in 15 min",
      },
      {
        name: "Trump Bitcoin Tweet",
        time: "Yesterday, 09:41",
        status: "Triggered",
        details: "Tweet mentioned 'Bitcoin' with 25K likes",
      },
      {
        name: "ETH RSI Alert",
        time: "Apr 02, 18:12",
        status: "Triggered",
        details: "ETH RSI crossed above 70",
      },
    ],
  };

  return (
    <MDBox>
      <DataTable
        table={alertsData}
        entriesPerPage={false}
        showTotalEntries={false}
        isSorted={false}
      />
    </MDBox>
  );
}

export default RecentAlertsList;