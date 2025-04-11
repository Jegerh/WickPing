import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

function AlertDelivery({ deliveryMethods, onChange }) {
  // We need to use the onChange function that was passed as a prop
  const handleDeliveryMethodsChange = (method) => {
    onChange(method);
  };

  return (
    <MDBox mt={4}>
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
  );
}

export default AlertDelivery;