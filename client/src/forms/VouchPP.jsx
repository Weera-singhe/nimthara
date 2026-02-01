import React from "react";
import { Box, Divider, List, ListItemText, Typography } from "@mui/material";
import QRCode from "react-qr-code";

export default function VouchPP({}) {
  const jobfileTag = (i) => String(i || 0).padStart(5, "0");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    ></Box>
  );
}
